/**
 * Monetization API Routes
 *
 * All monetization-related endpoints.
 * These routes are additive and do not modify existing routes.
 */

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import {
  getMonetizationFlags,
  getPricingConfig,
  isFeatureEnabled,
  getClientFlags,
} from './config';
import {
  purchaseDb,
  entitlementDb,
  referralDb,
  referralEventDb,
  affiliateOfferDb,
  affiliateClickDb,
  partnerInquiryDb,
} from './db';
import {
  resolveEntitlement,
  grantEntitlement,
  canUpgrade,
  validatePurchaseEligibility,
  getEntitlementForClient,
} from './entitlement';
import type { ReportTier, CheckoutRequest } from './types';

const router = Router();

// Initialize Stripe (lazy - only when needed)
let stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

// === PUBLIC ENDPOINTS ===

/**
 * GET /api/monetization/flags
 * Returns feature flags for client-side conditional rendering
 */
router.get('/flags', (req: Request, res: Response) => {
  const flags = getClientFlags();
  res.json(flags);
});

/**
 * GET /api/monetization/pricing
 * Returns pricing information (if monetization enabled)
 */
router.get('/pricing', (req: Request, res: Response) => {
  const flags = getMonetizationFlags();

  if (!flags.monetizationEnabled) {
    return res.json({ enabled: false });
  }

  const pricing = getPricingConfig();

  res.json({
    enabled: true,
    proReport: {
      enabled: flags.proReportEnabled,
      priceCents: pricing.proReportPriceCents,
      priceFormatted: `$${(pricing.proReportPriceCents / 100).toFixed(2)}`,
      currency: pricing.proReportCurrency,
    },
    premiumToolkit: {
      enabled: flags.premiumToolkitEnabled,
      priceCents: pricing.premiumToolkitPriceCents,
      priceFormatted: `$${(pricing.premiumToolkitPriceCents / 100).toFixed(2)}`,
      currency: pricing.premiumToolkitCurrency,
    },
  });
});

/**
 * GET /api/monetization/entitlement/:reportId
 * Returns entitlement status for a specific report
 */
router.get('/entitlement/:reportId', (req: Request, res: Response) => {
  const { reportId } = req.params;
  const userId = req.headers['x-user-id'] as string | undefined;

  if (!reportId) {
    return res.status(400).json({ error: 'Report ID is required' });
  }

  const entitlement = getEntitlementForClient(reportId, userId);
  res.json(entitlement);
});

// === CHECKOUT ENDPOINTS ===

/**
 * POST /api/checkout/pro-report
 * Creates a Stripe Checkout session for Pro Report purchase
 */
router.post('/checkout/pro-report', async (req: Request, res: Response) => {
  try {
    const flags = getMonetizationFlags();

    // Check feature flags
    if (!flags.monetizationEnabled || !flags.proReportEnabled) {
      return res.status(403).json({ error: 'Pro reports are not available' });
    }

    const { reportId, email, successUrl, cancelUrl } = req.body as CheckoutRequest;

    // Validate required fields
    if (!reportId) {
      return res.status(400).json({ error: 'Report ID is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if already purchased
    const eligibility = validatePurchaseEligibility(reportId, 'PRO');
    if (!eligibility.eligible) {
      return res.status(409).json({ error: eligibility.reason });
    }

    // Initialize Stripe
    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Get pricing
    const pricing = getPricingConfig();
    const appUrl = process.env.APP_URL || 'https://autolytiqs.com';

    // Create Stripe Checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: pricing.proReportCurrency,
            product_data: {
              name: 'Pro Income Report',
              description: 'Income Stability Score, Approval Readiness, 30-Day Action Plan, and more',
            },
            unit_amount: pricing.proReportPriceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${appUrl}/report/${reportId}?upgrade=success`,
      cancel_url: cancelUrl || `${appUrl}/report/${reportId}?upgrade=cancelled`,
      customer_email: email,
      metadata: {
        reportId,
        tier: 'PRO',
        source: 'income-calculator',
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    // Record pending purchase
    purchaseDb.create({
      email,
      reportId,
      tier: 'PRO',
      amountCents: pricing.proReportPriceCents,
      currency: pricing.proReportCurrency,
      provider: 'stripe',
      providerRef: session.id,
    });

    console.log(`[Checkout] Session created for report ${reportId}`, {
      sessionId: session.id,
      email,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * GET /api/checkout/success
 * Validates checkout completion (called from success page)
 */
router.get('/checkout/success', async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // Find purchase by session ID
  const purchase = purchaseDb.findByProviderRef(session_id);

  if (!purchase) {
    return res.status(404).json({ error: 'Purchase not found' });
  }

  res.json({
    status: purchase.status,
    reportId: purchase.reportId,
    tier: purchase.tier,
  });
});

// === WEBHOOK ENDPOINT ===

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for payment confirmation
 */
router.post(
  '/webhooks/stripe',
  // Use raw body for webhook signature verification
  async (req: Request, res: Response) => {
    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: 'Missing signature or secret' });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      // Note: req.body should be raw buffer for this to work
      const rawBody = (req as any).rawBody || req.body;
      event = stripeClient.webhooks.constructEvent(
        typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody),
        sig as string,
        webhookSecret
      );
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log(`[Webhook] Received event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const reportId = session.metadata?.reportId;
  const tier = session.metadata?.tier as ReportTier;

  if (!reportId || !tier) {
    console.error('[Webhook] Missing metadata in checkout session', session.id);
    return;
  }

  // Find and update purchase
  const purchase = purchaseDb.findByProviderRef(session.id);
  if (!purchase) {
    console.error('[Webhook] Purchase not found for session', session.id);
    return;
  }

  // Mark purchase as completed
  purchaseDb.updateStatus(purchase.id, 'completed');

  // Grant entitlement
  grantEntitlement(reportId, tier, { purchaseId: purchase.id });

  console.log(`[Webhook] Purchase completed for report ${reportId}`, {
    purchaseId: purchase.id,
    tier,
  });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const purchase = purchaseDb.findByProviderRef(session.id);
  if (purchase) {
    purchaseDb.updateStatus(purchase.id, 'expired');
    console.log(`[Webhook] Checkout expired for session ${session.id}`);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Payment intent doesn't have session ID, need to find by payment intent ID
  // This is a fallback - most failures will be caught by checkout.session.expired
  console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);
}

// === AFFILIATE ENDPOINTS ===

/**
 * GET /r/:slug
 * Affiliate redirect endpoint with click tracking
 */
router.get('/r/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { reportId } = req.query;

  if (!isFeatureEnabled('affiliateBlockEnabled')) {
    return res.redirect('/');
  }

  // Find the affiliate offer
  const offer = affiliateOfferDb.findBySlug(slug);
  if (!offer || !offer.active) {
    return res.redirect('/');
  }

  // Track the click
  affiliateClickDb.create({
    slug,
    reportId: reportId as string | undefined,
    userId: req.headers['x-user-id'] as string | undefined,
    userAgent: req.headers['user-agent'] as string | undefined,
    referrer: req.headers['referer'] as string | undefined,
  });

  console.log(`[Affiliate] Click tracked for ${slug}`, { reportId });

  // Redirect to affiliate URL
  res.redirect(offer.url);
});

/**
 * GET /api/monetization/affiliate-offers
 * Get affiliate offers for a specific income level
 */
router.get('/affiliate-offers', (req: Request, res: Response) => {
  if (!isFeatureEnabled('affiliateBlockEnabled')) {
    return res.json({ offers: [] });
  }

  const { income } = req.query;
  const annualIncome = income ? parseInt(income as string, 10) : 0;

  const offers = affiliateOfferDb.findForIncomeLevel(annualIncome, 3);

  res.json({
    offers: offers.map((o) => ({
      slug: o.slug,
      title: o.title,
      description: o.description,
      category: o.category,
    })),
  });
});

// === REFERRAL ENDPOINTS ===

/**
 * POST /api/monetization/referral/create
 * Create a referral code for a report
 */
router.post('/referral/create', (req: Request, res: Response) => {
  if (!isFeatureEnabled('referralUnlockEnabled')) {
    return res.status(403).json({ error: 'Referral system is not available' });
  }

  const { reportId, email } = req.body;
  const userId = req.headers['x-user-id'] as string | undefined;

  if (!reportId || !email) {
    return res.status(400).json({ error: 'Report ID and email are required' });
  }

  // Check if referral already exists
  const existing = referralDb.findByReportId(reportId);
  if (existing) {
    return res.json({
      code: existing.code,
      count: existing.count,
      rewardGranted: existing.rewardGranted,
    });
  }

  // Create new referral
  const referral = referralDb.create({
    ownerReportId: reportId,
    ownerUserId: userId,
    ownerEmail: email,
  });

  res.json({
    code: referral.code,
    count: 0,
    rewardGranted: false,
  });
});

/**
 * POST /api/monetization/referral/track
 * Track a referral conversion
 */
router.post('/referral/track', (req: Request, res: Response) => {
  if (!isFeatureEnabled('referralUnlockEnabled')) {
    return res.status(403).json({ error: 'Referral system is not available' });
  }

  const { code, newReportId, fingerprintHash } = req.body;

  if (!code || !newReportId) {
    return res.status(400).json({ error: 'Code and new report ID are required' });
  }

  // Find referral
  const referral = referralDb.findByCode(code);
  if (!referral) {
    return res.status(404).json({ error: 'Invalid referral code' });
  }

  // Check for duplicate
  if (referralEventDb.isDuplicate(code, newReportId, fingerprintHash)) {
    return res.status(409).json({ error: 'Referral already tracked' });
  }

  // Can't refer yourself
  if (referral.ownerReportId === newReportId) {
    return res.status(400).json({ error: 'Cannot refer yourself' });
  }

  // Create referral event
  referralEventDb.create({
    referralId: referral.id,
    code,
    newReportId,
    fingerprintHash,
  });

  // Increment count
  referralDb.incrementCount(referral.id);

  // Check if reward should be granted (1 referral = PRO access)
  const requiredReferrals = parseInt(process.env.REFERRAL_REWARD_THRESHOLD || '1', 10);
  const updatedReferral = referralDb.findById(referral.id)!;

  if (updatedReferral.count >= requiredReferrals && !updatedReferral.rewardGranted) {
    // Grant PRO entitlement
    grantEntitlement(referral.ownerReportId, 'PRO', { referralId: referral.id });
    referralDb.markRewardGranted(referral.id);

    console.log(`[Referral] Reward granted to report ${referral.ownerReportId}`, {
      referralId: referral.id,
      count: updatedReferral.count,
    });
  }

  res.json({
    tracked: true,
    count: updatedReferral.count,
    rewardGranted: updatedReferral.count >= requiredReferrals,
  });
});

/**
 * GET /api/monetization/referral/:reportId
 * Get referral status for a report
 */
router.get('/referral/:reportId', (req: Request, res: Response) => {
  if (!isFeatureEnabled('referralUnlockEnabled')) {
    return res.json({ enabled: false });
  }

  const { reportId } = req.params;
  const referral = referralDb.findByReportId(reportId);

  if (!referral) {
    return res.json({
      enabled: true,
      hasCode: false,
    });
  }

  const requiredReferrals = parseInt(process.env.REFERRAL_REWARD_THRESHOLD || '1', 10);

  res.json({
    enabled: true,
    hasCode: true,
    code: referral.code,
    count: referral.count,
    required: requiredReferrals,
    rewardGranted: referral.rewardGranted,
  });
});

// === B2B INQUIRY ENDPOINTS ===

/**
 * POST /api/partner
 * Submit a B2B/white-label inquiry
 */
router.post('/partner', (req: Request, res: Response) => {
  if (!isFeatureEnabled('b2bInquiryEnabled')) {
    return res.status(403).json({ error: 'Partner inquiries are not available' });
  }

  const { name, email, company, volume, message } = req.body;

  // Validate required fields
  if (!name || !email || !company) {
    return res.status(400).json({ error: 'Name, email, and company are required' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  // Create inquiry
  const inquiry = partnerInquiryDb.create({
    name,
    email,
    company,
    volume,
    message,
  });

  console.log(`[Partner] New inquiry from ${company}`, {
    inquiryId: inquiry.id,
    email,
  });

  // TODO: Send notification email to admin

  res.json({
    success: true,
    message: 'Thank you for your interest. We will contact you shortly.',
  });
});

/**
 * GET /api/partner/inquiries
 * Admin endpoint to list partner inquiries
 */
router.get('/partner/inquiries', (req: Request, res: Response) => {
  // TODO: Add admin authentication check
  const inquiries = partnerInquiryDb.findAll();
  res.json({ inquiries });
});

export default router;
