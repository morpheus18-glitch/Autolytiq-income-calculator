import { Router } from "express";
import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";
import { sendNewsletterWelcomeEmail } from "./email";

const router = Router();

// Initialize database
const dbPath = path.join(process.cwd(), "data", "leads.db");
const db = new Database(dbPath);

// Create leads table with subscription management
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    income_range TEXT,
    source TEXT DEFAULT 'calculator',
    subscribed INTEGER DEFAULT 1,
    unsubscribe_token TEXT UNIQUE,
    last_email_sent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for faster lookups
db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`);

// Add new columns if they don't exist (migration)
try {
  db.exec(`ALTER TABLE leads ADD COLUMN subscribed INTEGER DEFAULT 1`);
} catch (e) { /* column exists */ }
try {
  db.exec(`ALTER TABLE leads ADD COLUMN unsubscribe_token TEXT`);
} catch (e) { /* column exists */ }
try {
  db.exec(`ALTER TABLE leads ADD COLUMN last_email_sent INTEGER DEFAULT 0`);
} catch (e) { /* column exists */ }

// Create token index after column exists
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_token ON leads(unsubscribe_token)`);
} catch (e) { /* index exists or column missing */ }

// Generate unsubscribe tokens for existing leads without one
const leadsWithoutToken = db.prepare(`SELECT id FROM leads WHERE unsubscribe_token IS NULL`).all() as Array<{id: number}>;
for (const lead of leadsWithoutToken) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare(`UPDATE leads SET unsubscribe_token = ? WHERE id = ?`).run(token, lead.id);
}

interface LeadInput {
  email: string;
  name?: string;
  income_range?: string;
  source?: string;
}

// POST /api/leads - Create a new lead
router.post("/", (req, res) => {
  try {
    const { email, name, income_range, source } = req.body as LeadInput;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    // Check if email already exists
    const existing = db.prepare("SELECT id FROM leads WHERE email = ?").get(email);

    if (existing) {
      // Update existing lead with new info
      db.prepare(`
        UPDATE leads
        SET name = COALESCE(?, name),
            income_range = COALESCE(?, income_range),
            source = COALESCE(?, source),
            updated_at = CURRENT_TIMESTAMP
        WHERE email = ?
      `).run(name, income_range, source, email);

      return res.json({ message: "Updated", existing: true });
    }

    // Generate unique unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Insert new lead
    const result = db.prepare(`
      INSERT INTO leads (email, name, income_range, source, unsubscribe_token)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, name || null, income_range || null, source || "calculator", unsubscribeToken);

    // Send welcome email asynchronously (don't block the response)
    sendNewsletterWelcomeEmail(email, name, income_range).catch(err => {
      console.error("Failed to send newsletter welcome email:", err);
    });

    res.status(201).json({
      message: "Subscribed",
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Lead capture error:", error);
    res.status(500).json({ message: "Failed to save" });
  }
});

// GET /api/leads - Get all leads (admin endpoint)
router.get("/", (req, res) => {
  try {
    // Simple auth check via query param (replace with proper auth in production)
    const { key } = req.query;
    if (key !== process.env.ADMIN_KEY && key !== "autolytiq2025") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const leads = db.prepare(`
      SELECT id, email, name, income_range, source, created_at
      FROM leads
      ORDER BY created_at DESC
    `).all();

    res.json({ count: leads.length, leads });
  } catch (error) {
    console.error("Fetch leads error:", error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

// GET /api/leads/export - Export leads as CSV
router.get("/export", (req, res) => {
  try {
    const { key } = req.query;
    if (key !== process.env.ADMIN_KEY && key !== "autolytiq2025") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const leads = db.prepare(`
      SELECT email, name, income_range, source, created_at
      FROM leads
      ORDER BY created_at DESC
    `).all() as Array<{email: string; name: string | null; income_range: string | null; source: string; created_at: string}>;

    const csv = [
      "email,name,income_range,source,created_at",
      ...leads.map(l =>
        `${l.email},${l.name || ""},${l.income_range || ""},${l.source},${l.created_at}`
      )
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.send(csv);
  } catch (error) {
    console.error("Export leads error:", error);
    res.status(500).json({ message: "Failed to export leads" });
  }
});

// GET /api/leads/unsubscribe/:token - Unsubscribe via token
router.get("/unsubscribe/:token", (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length !== 64) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const lead = db.prepare("SELECT id, email, subscribed FROM leads WHERE unsubscribe_token = ?").get(token) as { id: number; email: string; subscribed: number } | undefined;

    if (!lead) {
      return res.status(404).json({ message: "Not found" });
    }

    if (lead.subscribed === 0) {
      return res.json({ message: "Already unsubscribed", email: lead.email });
    }

    db.prepare("UPDATE leads SET subscribed = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(lead.id);

    res.json({ message: "Successfully unsubscribed", email: lead.email });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

// POST /api/leads/resubscribe - Resubscribe by email
router.post("/resubscribe", (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const lead = db.prepare("SELECT id, subscribed FROM leads WHERE email = ?").get(email) as { id: number; subscribed: number } | undefined;

    if (!lead) {
      return res.status(404).json({ message: "Email not found" });
    }

    if (lead.subscribed === 1) {
      return res.json({ message: "Already subscribed" });
    }

    db.prepare("UPDATE leads SET subscribed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(lead.id);

    res.json({ message: "Successfully resubscribed" });
  } catch (error) {
    console.error("Resubscribe error:", error);
    res.status(500).json({ message: "Failed to resubscribe" });
  }
});

// Export database functions for newsletter system
export const leadsDb = {
  getSubscribedLeads: () => db.prepare(`
    SELECT id, email, name, income_range, unsubscribe_token, last_email_sent
    FROM leads
    WHERE subscribed = 1
    ORDER BY created_at ASC
  `).all() as Array<{
    id: number;
    email: string;
    name: string | null;
    income_range: string | null;
    unsubscribe_token: string;
    last_email_sent: number;
  }>,

  updateLastEmailSent: (id: number, weekNumber: number) => {
    db.prepare("UPDATE leads SET last_email_sent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(weekNumber, id);
  },

  getLeadByToken: (token: string) => db.prepare("SELECT * FROM leads WHERE unsubscribe_token = ?").get(token),
};

export default router;
