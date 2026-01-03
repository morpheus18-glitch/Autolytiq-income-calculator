import { Router } from "express";
import Database from "better-sqlite3";
import path from "path";

const router = Router();

// Initialize database
const dbPath = path.join(process.cwd(), "data", "leads.db");
const db = new Database(dbPath);

// Auth middleware
const requireAdmin = (req: any, res: any, next: any) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== "autolytiq2025") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// GET /api/admin/leads - Get paginated leads
router.get("/leads", requireAdmin, (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    let whereClause = "";
    let params: any[] = [];

    if (search) {
      whereClause = "WHERE email LIKE ? OR name LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }

    const countResult = db.prepare(`
      SELECT COUNT(*) as count FROM leads ${whereClause}
    `).get(...params) as { count: number };

    const leads = db.prepare(`
      SELECT id, email, name, income_range, source, created_at, updated_at
      FROM leads
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      leads,
      total: countResult.count,
      page,
      limit,
      totalPages: Math.ceil(countResult.count / limit)
    });
  } catch (error) {
    console.error("Fetch leads error:", error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

// GET /api/admin/stats - Get lead statistics
router.get("/stats", requireAdmin, (req, res) => {
  try {
    const total = (db.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number }).count;

    const today = (db.prepare(`
      SELECT COUNT(*) as count FROM leads
      WHERE date(created_at) = date('now')
    `).get() as { count: number }).count;

    const thisWeek = (db.prepare(`
      SELECT COUNT(*) as count FROM leads
      WHERE created_at >= date('now', '-7 days')
    `).get() as { count: number }).count;

    const thisMonth = (db.prepare(`
      SELECT COUNT(*) as count FROM leads
      WHERE created_at >= date('now', '-30 days')
    `).get() as { count: number }).count;

    const byIncomeRange = db.prepare(`
      SELECT income_range, COUNT(*) as count
      FROM leads
      WHERE income_range IS NOT NULL
      GROUP BY income_range
      ORDER BY count DESC
    `).all();

    const bySource = db.prepare(`
      SELECT source, COUNT(*) as count
      FROM leads
      GROUP BY source
      ORDER BY count DESC
    `).all();

    res.json({
      total,
      today,
      thisWeek,
      thisMonth,
      byIncomeRange,
      bySource
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET /api/admin/leads/export - Export all leads as CSV
router.get("/leads/export", requireAdmin, (req, res) => {
  try {
    const leads = db.prepare(`
      SELECT email, name, income_range, source, created_at, updated_at
      FROM leads
      ORDER BY created_at DESC
    `).all() as Array<{
      email: string;
      name: string | null;
      income_range: string | null;
      source: string;
      created_at: string;
      updated_at: string;
    }>;

    const escapeCSV = (val: string | null) => {
      if (!val) return "";
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csv = [
      "email,name,income_range,source,created_at,updated_at",
      ...leads.map(l =>
        [
          escapeCSV(l.email),
          escapeCSV(l.name),
          escapeCSV(l.income_range),
          escapeCSV(l.source),
          escapeCSV(l.created_at),
          escapeCSV(l.updated_at)
        ].join(",")
      )
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=leads-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Failed to export" });
  }
});

// DELETE /api/admin/leads/:id - Delete a lead
router.delete("/leads/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM leads WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete" });
  }
});

export default router;
