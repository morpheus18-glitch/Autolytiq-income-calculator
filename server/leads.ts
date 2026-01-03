import { Router } from "express";
import Database from "better-sqlite3";
import path from "path";
import { sendNewsletterWelcomeEmail } from "./email";

const router = Router();

// Initialize database
const dbPath = path.join(process.cwd(), "data", "leads.db");
const db = new Database(dbPath);

// Create leads table
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    income_range TEXT,
    source TEXT DEFAULT 'calculator',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for faster lookups
db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`);

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

    // Insert new lead
    const result = db.prepare(`
      INSERT INTO leads (email, name, income_range, source)
      VALUES (?, ?, ?, ?)
    `).run(email, name || null, income_range || null, source || "calculator");

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

export default router;
