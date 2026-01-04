import { Router } from "express";
import Database from "better-sqlite3";
import path from "path";

const router = Router();

// Initialize databases
const leadsDbPath = path.join(process.cwd(), "data", "leads.db");
const usersDbPath = path.join(process.cwd(), "data", "app.db");
const leadsDb = new Database(leadsDbPath);
const usersDb = new Database(usersDbPath);

// Add unsubscribed column to leads if not exists
try {
  leadsDb.exec(`ALTER TABLE leads ADD COLUMN unsubscribed INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists
}

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

    const countResult = leadsDb.prepare(`
      SELECT COUNT(*) as count FROM leads ${whereClause}
    `).get(...params) as { count: number };

    const leads = leadsDb.prepare(`
      SELECT id, email, name, income_range, source, created_at, updated_at, unsubscribed
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
    const total = (leadsDb.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number }).count;
    const subscribed = (leadsDb.prepare("SELECT COUNT(*) as count FROM leads WHERE unsubscribed = 0").get() as { count: number }).count;
    const unsubscribed = (leadsDb.prepare("SELECT COUNT(*) as count FROM leads WHERE unsubscribed = 1").get() as { count: number }).count;

    const today = (leadsDb.prepare(`
      SELECT COUNT(*) as count FROM leads
      WHERE date(created_at) = date('now')
    `).get() as { count: number }).count;

    const thisWeek = (leadsDb.prepare(`
      SELECT COUNT(*) as count FROM leads
      WHERE created_at >= date('now', '-7 days')
    `).get() as { count: number }).count;

    const thisMonth = (leadsDb.prepare(`
      SELECT COUNT(*) as count FROM leads
      WHERE created_at >= date('now', '-30 days')
    `).get() as { count: number }).count;

    const byIncomeRange = leadsDb.prepare(`
      SELECT income_range, COUNT(*) as count
      FROM leads
      WHERE income_range IS NOT NULL
      GROUP BY income_range
      ORDER BY count DESC
    `).all();

    const bySource = leadsDb.prepare(`
      SELECT source, COUNT(*) as count
      FROM leads
      GROUP BY source
      ORDER BY count DESC
    `).all();

    // User stats
    const totalUsers = (usersDb.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count;
    const usersToday = (usersDb.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE date(created_at) = date('now')
    `).get() as { count: number }).count;
    const usersThisWeek = (usersDb.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= date('now', '-7 days')
    `).get() as { count: number }).count;

    res.json({
      leads: {
        total,
        subscribed,
        unsubscribed,
        today,
        thisWeek,
        thisMonth,
        byIncomeRange,
        bySource
      },
      users: {
        total: totalUsers,
        today: usersToday,
        thisWeek: usersThisWeek
      }
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET /api/admin/leads/export - Export all leads as CSV
router.get("/leads/export", requireAdmin, (req, res) => {
  try {
    const leads = leadsDb.prepare(`
      SELECT email, name, income_range, source, created_at, updated_at, unsubscribed
      FROM leads
      ORDER BY created_at DESC
    `).all() as Array<{
      email: string;
      name: string | null;
      income_range: string | null;
      source: string;
      created_at: string;
      updated_at: string;
      unsubscribed: number;
    }>;

    const escapeCSV = (val: string | null) => {
      if (!val) return "";
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csv = [
      "email,name,income_range,source,created_at,updated_at,unsubscribed",
      ...leads.map(l =>
        [
          escapeCSV(l.email),
          escapeCSV(l.name),
          escapeCSV(l.income_range),
          escapeCSV(l.source),
          escapeCSV(l.created_at),
          escapeCSV(l.updated_at),
          l.unsubscribed ? "yes" : "no"
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
    const result = leadsDb.prepare("DELETE FROM leads WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete" });
  }
});

// PATCH /api/admin/leads/:id/unsubscribe - Toggle unsubscribe status
router.patch("/leads/:id/unsubscribe", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const lead = leadsDb.prepare("SELECT unsubscribed FROM leads WHERE id = ?").get(id) as { unsubscribed: number } | undefined;

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const newStatus = lead.unsubscribed ? 0 : 1;
    leadsDb.prepare("UPDATE leads SET unsubscribed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(newStatus, id);

    res.json({ message: newStatus ? "Unsubscribed" : "Resubscribed", unsubscribed: newStatus });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ message: "Failed to update" });
  }
});

// ==================== USER MANAGEMENT ====================

// GET /api/admin/users - Get paginated users
router.get("/users", requireAdmin, (req, res) => {
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

    const countResult = usersDb.prepare(`
      SELECT COUNT(*) as count FROM users ${whereClause}
    `).get(...params) as { count: number };

    const users = usersDb.prepare(`
      SELECT id, email, name, created_at, verified
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      users,
      total: countResult.count,
      page,
      limit,
      totalPages: Math.ceil(countResult.count / limit)
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    // Delete password resets for this user first
    usersDb.prepare("DELETE FROM password_resets WHERE user_id = ?").run(id);

    // Delete the user
    const result = usersDb.prepare("DELETE FROM users WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// PATCH /api/admin/users/:id - Update user (name, verified status)
router.patch("/users/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, verified } = req.body;

    const user = usersDb.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) {
      usersDb.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, id);
    }
    if (verified !== undefined) {
      usersDb.prepare("UPDATE users SET verified = ? WHERE id = ?").run(verified ? 1 : 0, id);
    }

    res.json({ message: "User updated" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// GET /api/admin/users/export - Export all users as CSV
router.get("/users/export", requireAdmin, (req, res) => {
  try {
    const users = usersDb.prepare(`
      SELECT id, email, name, created_at, verified
      FROM users
      ORDER BY created_at DESC
    `).all() as Array<{
      id: string;
      email: string;
      name: string | null;
      created_at: string;
      verified: number;
    }>;

    const escapeCSV = (val: string | null) => {
      if (!val) return "";
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csv = [
      "id,email,name,created_at,verified",
      ...users.map(u =>
        [
          escapeCSV(u.id),
          escapeCSV(u.email),
          escapeCSV(u.name),
          escapeCSV(u.created_at),
          u.verified ? "yes" : "no"
        ].join(",")
      )
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=users-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({ message: "Failed to export users" });
  }
});

export default router;
