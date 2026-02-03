/**
 * Monetization Database Layer
 *
 * Separate database module for monetization tables.
 * Uses the same SQLite database but with isolated tables.
 * This allows monetization to be disabled without affecting core functionality.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type {
  Entitlement,
  Purchase,
  Referral,
  ReferralEvent,
  AffiliateOffer,
  AffiliateClick,
  PartnerInquiry,
  ReportTier,
  PurchaseStatus,
  PaymentProvider,
} from './types';

// Use same database path as main app
const dbPath = path.join(process.cwd(), 'data', 'app.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize monetization tables
export function initMonetizationTables(): void {
  db.exec(`
    -- Purchases: tracks payment transactions
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT NOT NULL,
      report_id TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'PRO',
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'usd',
      provider TEXT NOT NULL DEFAULT 'stripe',
      provider_ref TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_purchases_report ON purchases(report_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
    CREATE INDEX IF NOT EXISTS idx_purchases_provider_ref ON purchases(provider_ref);
    CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

    -- Entitlements: grants access to report tiers
    CREATE TABLE IF NOT EXISTS entitlements (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'FREE',
      source_purchase_id TEXT,
      source_referral_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (source_purchase_id) REFERENCES purchases(id)
    );

    CREATE INDEX IF NOT EXISTS idx_entitlements_report ON entitlements(report_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_entitlements_report_tier ON entitlements(report_id, tier);

    -- Referrals: tracks referral codes and owners
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      owner_report_id TEXT NOT NULL,
      owner_user_id TEXT,
      owner_email TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      reward_granted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
    CREATE INDEX IF NOT EXISTS idx_referrals_owner_report ON referrals(owner_report_id);

    -- Referral events: tracks individual referral conversions
    CREATE TABLE IF NOT EXISTS referral_events (
      id TEXT PRIMARY KEY,
      referral_id TEXT NOT NULL,
      code TEXT NOT NULL,
      new_report_id TEXT NOT NULL,
      fingerprint_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (referral_id) REFERENCES referrals(id)
    );

    CREATE INDEX IF NOT EXISTS idx_referral_events_code ON referral_events(code);
    CREATE INDEX IF NOT EXISTS idx_referral_events_new_report ON referral_events(new_report_id);

    -- Affiliate offers: configurable affiliate products
    CREATE TABLE IF NOT EXISTS affiliate_offers (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      url TEXT NOT NULL,
      priority INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_affiliate_offers_category ON affiliate_offers(category);
    CREATE INDEX IF NOT EXISTS idx_affiliate_offers_active ON affiliate_offers(active);

    -- Affiliate clicks: tracks outbound clicks
    CREATE TABLE IF NOT EXISTS monetization_affiliate_clicks (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      report_id TEXT,
      user_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      referrer TEXT,
      FOREIGN KEY (slug) REFERENCES affiliate_offers(slug)
    );

    CREATE INDEX IF NOT EXISTS idx_monetization_clicks_slug ON monetization_affiliate_clicks(slug);
    CREATE INDEX IF NOT EXISTS idx_monetization_clicks_report ON monetization_affiliate_clicks(report_id);

    -- Partner inquiries: B2B/white-label leads
    CREATE TABLE IF NOT EXISTS partner_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      volume TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_partner_inquiries_email ON partner_inquiries(email);
  `);

  console.log('[Monetization] Database tables initialized');
}

// === PURCHASE OPERATIONS ===

export const purchaseDb = {
  create: (data: {
    email: string;
    reportId: string;
    tier: ReportTier;
    amountCents: number;
    currency: string;
    provider: PaymentProvider;
    providerRef: string;
  }): Purchase => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO purchases (id, email, report_id, tier, amount_cents, currency, provider, provider_ref, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    stmt.run(id, data.email, data.reportId, data.tier, data.amountCents, data.currency, data.provider, data.providerRef);

    return purchaseDb.findById(id)!;
  },

  findById: (id: string): Purchase | null => {
    const stmt = db.prepare('SELECT * FROM purchases WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? mapPurchaseRow(row) : null;
  },

  findByProviderRef: (providerRef: string): Purchase | null => {
    const stmt = db.prepare('SELECT * FROM purchases WHERE provider_ref = ?');
    const row = stmt.get(providerRef) as any;
    return row ? mapPurchaseRow(row) : null;
  },

  findByReportId: (reportId: string): Purchase[] => {
    const stmt = db.prepare('SELECT * FROM purchases WHERE report_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(reportId) as any[];
    return rows.map(mapPurchaseRow);
  },

  findCompletedByReportId: (reportId: string): Purchase | null => {
    const stmt = db.prepare(`
      SELECT * FROM purchases
      WHERE report_id = ? AND status = 'completed'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const row = stmt.get(reportId) as any;
    return row ? mapPurchaseRow(row) : null;
  },

  updateStatus: (id: string, status: PurchaseStatus): void => {
    const stmt = db.prepare(`
      UPDATE purchases SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    stmt.run(status, id);
  },

  // Prevent duplicate purchases for same report+tier
  hasPendingOrCompletedPurchase: (reportId: string, tier: ReportTier): boolean => {
    const stmt = db.prepare(`
      SELECT 1 FROM purchases
      WHERE report_id = ? AND tier = ? AND status IN ('pending', 'completed')
      LIMIT 1
    `);
    return !!stmt.get(reportId, tier);
  },
};

function mapPurchaseRow(row: any): Purchase {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    reportId: row.report_id,
    tier: row.tier as ReportTier,
    amountCents: row.amount_cents,
    currency: row.currency,
    provider: row.provider as PaymentProvider,
    providerRef: row.provider_ref,
    status: row.status as PurchaseStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// === ENTITLEMENT OPERATIONS ===

export const entitlementDb = {
  create: (data: {
    reportId: string;
    tier: ReportTier;
    sourcePurchaseId?: string;
    sourceReferralId?: string;
    expiresAt?: string;
  }): Entitlement => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO entitlements (id, report_id, tier, source_purchase_id, source_referral_id, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.reportId,
      data.tier,
      data.sourcePurchaseId || null,
      data.sourceReferralId || null,
      data.expiresAt || null
    );

    return entitlementDb.findById(id)!;
  },

  findById: (id: string): Entitlement | null => {
    const stmt = db.prepare('SELECT * FROM entitlements WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? mapEntitlementRow(row) : null;
  },

  findByReportId: (reportId: string): Entitlement[] => {
    const stmt = db.prepare(`
      SELECT * FROM entitlements
      WHERE report_id = ?
      AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY tier DESC
    `);
    const rows = stmt.all(reportId) as any[];
    return rows.map(mapEntitlementRow);
  },

  getHighestTier: (reportId: string): ReportTier => {
    const stmt = db.prepare(`
      SELECT tier FROM entitlements
      WHERE report_id = ?
      AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY
        CASE tier
          WHEN 'PREMIUM' THEN 3
          WHEN 'PRO' THEN 2
          WHEN 'FREE' THEN 1
          ELSE 0
        END DESC
      LIMIT 1
    `);
    const row = stmt.get(reportId) as any;
    return row ? (row.tier as ReportTier) : 'FREE';
  },

  hasEntitlement: (reportId: string, tier: ReportTier): boolean => {
    const currentTier = entitlementDb.getHighestTier(reportId);
    const tierOrder: Record<ReportTier, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
    return tierOrder[currentTier] >= tierOrder[tier];
  },
};

function mapEntitlementRow(row: any): Entitlement {
  return {
    id: row.id,
    reportId: row.report_id,
    tier: row.tier as ReportTier,
    sourcePurchaseId: row.source_purchase_id,
    sourceReferralId: row.source_referral_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

// === REFERRAL OPERATIONS ===

export const referralDb = {
  create: (data: {
    ownerReportId: string;
    ownerUserId?: string;
    ownerEmail: string;
  }): Referral => {
    const id = uuidv4();
    // Generate unique referral code (6 chars alphanumeric)
    const code = generateReferralCode();

    const stmt = db.prepare(`
      INSERT INTO referrals (id, code, owner_report_id, owner_user_id, owner_email)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, code, data.ownerReportId, data.ownerUserId || null, data.ownerEmail);

    return referralDb.findById(id)!;
  },

  findById: (id: string): Referral | null => {
    const stmt = db.prepare('SELECT * FROM referrals WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? mapReferralRow(row) : null;
  },

  findByCode: (code: string): Referral | null => {
    const stmt = db.prepare('SELECT * FROM referrals WHERE code = ?');
    const row = stmt.get(code) as any;
    return row ? mapReferralRow(row) : null;
  },

  findByReportId: (reportId: string): Referral | null => {
    const stmt = db.prepare('SELECT * FROM referrals WHERE owner_report_id = ?');
    const row = stmt.get(reportId) as any;
    return row ? mapReferralRow(row) : null;
  },

  incrementCount: (id: string): void => {
    const stmt = db.prepare('UPDATE referrals SET count = count + 1 WHERE id = ?');
    stmt.run(id);
  },

  markRewardGranted: (id: string): void => {
    const stmt = db.prepare('UPDATE referrals SET reward_granted = 1 WHERE id = ?');
    stmt.run(id);
  },
};

export const referralEventDb = {
  create: (data: {
    referralId: string;
    code: string;
    newReportId: string;
    fingerprintHash?: string;
  }): ReferralEvent => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO referral_events (id, referral_id, code, new_report_id, fingerprint_hash)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.referralId, data.code, data.newReportId, data.fingerprintHash || null);

    return referralEventDb.findById(id)!;
  },

  findById: (id: string): ReferralEvent | null => {
    const stmt = db.prepare('SELECT * FROM referral_events WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? mapReferralEventRow(row) : null;
  },

  // Check for potential fraud - same fingerprint or report already referred
  isDuplicate: (code: string, newReportId: string, fingerprintHash?: string): boolean => {
    // Check if report was already referred
    const reportStmt = db.prepare('SELECT 1 FROM referral_events WHERE new_report_id = ? LIMIT 1');
    if (reportStmt.get(newReportId)) return true;

    // Check if same fingerprint used this code recently (24h)
    if (fingerprintHash) {
      const fpStmt = db.prepare(`
        SELECT 1 FROM referral_events
        WHERE code = ? AND fingerprint_hash = ?
        AND created_at > datetime('now', '-24 hours')
        LIMIT 1
      `);
      if (fpStmt.get(code, fingerprintHash)) return true;
    }

    return false;
  },
};

function mapReferralRow(row: any): Referral {
  return {
    id: row.id,
    code: row.code,
    ownerReportId: row.owner_report_id,
    ownerUserId: row.owner_user_id,
    ownerEmail: row.owner_email,
    count: row.count,
    rewardGranted: !!row.reward_granted,
    createdAt: row.created_at,
  };
}

function mapReferralEventRow(row: any): ReferralEvent {
  return {
    id: row.id,
    referralId: row.referral_id,
    code: row.code,
    newReportId: row.new_report_id,
    fingerprintHash: row.fingerprint_hash,
    createdAt: row.created_at,
  };
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// === AFFILIATE OPERATIONS ===

export const affiliateOfferDb = {
  create: (data: {
    slug: string;
    title: string;
    description?: string;
    category: string;
    url: string;
    priority?: number;
  }): AffiliateOffer => {
    const stmt = db.prepare(`
      INSERT INTO affiliate_offers (slug, title, description, category, url, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      data.slug,
      data.title,
      data.description || null,
      data.category,
      data.url,
      data.priority || 0
    );

    return affiliateOfferDb.findBySlug(data.slug)!;
  },

  findBySlug: (slug: string): AffiliateOffer | null => {
    const stmt = db.prepare('SELECT * FROM affiliate_offers WHERE slug = ?');
    const row = stmt.get(slug) as any;
    return row ? mapAffiliateOfferRow(row) : null;
  },

  findByCategory: (category: string, limit = 3): AffiliateOffer[] => {
    const stmt = db.prepare(`
      SELECT * FROM affiliate_offers
      WHERE category = ? AND active = 1
      ORDER BY priority DESC
      LIMIT ?
    `);
    const rows = stmt.all(category, limit) as any[];
    return rows.map(mapAffiliateOfferRow);
  },

  findActive: (limit = 3): AffiliateOffer[] => {
    const stmt = db.prepare(`
      SELECT * FROM affiliate_offers
      WHERE active = 1
      ORDER BY priority DESC
      LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];
    return rows.map(mapAffiliateOfferRow);
  },

  // Get offers relevant to income level
  findForIncomeLevel: (annualIncome: number, limit = 3): AffiliateOffer[] => {
    let category = 'general';
    if (annualIncome < 45000) {
      category = 'budgeting';
    } else if (annualIncome < 100000) {
      category = 'savings';
    } else {
      category = 'investing';
    }

    const offers = affiliateOfferDb.findByCategory(category, limit);
    // Fallback to general if no category-specific offers
    if (offers.length === 0) {
      return affiliateOfferDb.findActive(limit);
    }
    return offers;
  },
};

export const affiliateClickDb = {
  create: (data: {
    slug: string;
    reportId?: string;
    userId?: string;
    userAgent?: string;
    referrer?: string;
  }): AffiliateClick => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO monetization_affiliate_clicks (id, slug, report_id, user_id, user_agent, referrer)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.slug,
      data.reportId || null,
      data.userId || null,
      data.userAgent || null,
      data.referrer || null
    );

    return affiliateClickDb.findById(id)!;
  },

  findById: (id: string): AffiliateClick | null => {
    const stmt = db.prepare('SELECT * FROM monetization_affiliate_clicks WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? mapAffiliateClickRow(row) : null;
  },

  countBySlug: (slug: string): number => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM monetization_affiliate_clicks WHERE slug = ?');
    const row = stmt.get(slug) as any;
    return row?.count || 0;
  },
};

function mapAffiliateOfferRow(row: any): AffiliateOffer {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    category: row.category,
    url: row.url,
    priority: row.priority,
    active: !!row.active,
    createdAt: row.created_at,
  };
}

function mapAffiliateClickRow(row: any): AffiliateClick {
  return {
    id: row.id,
    slug: row.slug,
    reportId: row.report_id,
    userId: row.user_id,
    timestamp: row.timestamp,
    userAgent: row.user_agent,
    referrer: row.referrer,
  };
}

// === PARTNER INQUIRY OPERATIONS ===

export const partnerInquiryDb = {
  create: (data: {
    name: string;
    email: string;
    company: string;
    volume?: string;
    message?: string;
  }): PartnerInquiry => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO partner_inquiries (id, name, email, company, volume, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.name,
      data.email,
      data.company,
      data.volume || null,
      data.message || null
    );

    return partnerInquiryDb.findById(id)!;
  },

  findById: (id: string): PartnerInquiry | null => {
    const stmt = db.prepare('SELECT * FROM partner_inquiries WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? mapPartnerInquiryRow(row) : null;
  },

  findAll: (): PartnerInquiry[] => {
    const stmt = db.prepare('SELECT * FROM partner_inquiries ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    return rows.map(mapPartnerInquiryRow);
  },
};

function mapPartnerInquiryRow(row: any): PartnerInquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    volume: row.volume || '',
    message: row.message || '',
    createdAt: row.created_at,
  };
}

export default db;
