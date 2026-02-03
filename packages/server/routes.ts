import type { Express } from "express";
import type { Server } from "http";
import authRoutes from "./auth";
import leadsRoutes from "./leads";
import adminRoutes from "./admin";
import budgetRoutes from "./budget";
import transactionRoutes from "./transactions";
import receiptRoutes from "./receipts";
import emailRoutes from "./email-routes";
import newsletterRoutes from "./newsletter";
import affiliateAnalyticsRoutes, { trackClickHandler, trackSessionHandler } from "./affiliate-analytics";
import { getCsrfTokenHandler, csrfProtection } from "./security/csrf";
import { sendCalculationResultsEmail } from "./email";
import { initMonetization } from "./monetization";
import monetizationRoutes from "./monetization/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize monetization system (safe to call multiple times)
  initMonetization();

  // Health check for uptime monitoring
  app.get("/api/health", (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    });
  });

  // Internal alert endpoint (localhost only)
  app.post("/api/internal/alert", async (req, res) => {
    // Only allow from localhost
    const ip = req.ip || req.socket.remoteAddress;
    if (!ip?.includes("127.0.0.1") && !ip?.includes("::1")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { type, message } = req.body;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = type === "down"
      ? "🚨 ALERT: Autolytiq is DOWN"
      : "✅ RECOVERED: Autolytiq is back online";

    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "Autolytiq <noreply@autolytiqs.com>",
        to: "dmarc@autolytiqs.com",
        subject,
        html: `
          <h2>${subject}</h2>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Details:</strong> ${message}</p>
        `,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Alert email failed:", error);
      res.status(500).json({ error: "Failed to send alert" });
    }
  });

  // CSRF token endpoint
  app.get("/api/csrf-token", getCsrfTokenHandler);

  // Email results endpoint (public, no CSRF needed - uses rate limiting instead)
  app.post("/api/email-results", async (req, res) => {
    try {
      const { email, calculationType, results } = req.body;

      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email is required" });
      }

      if (!calculationType || !results) {
        return res.status(400).json({ error: "Missing calculation data" });
      }

      const success = await sendCalculationResultsEmail(email, calculationType, results);

      if (success) {
        res.json({ success: true, message: "Results sent to your email" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error("Email results error:", error);
      res.status(500).json({ error: "Failed to send results" });
    }
  });

  // Affiliate tracking routes (public, no CSRF - uses rate limiting)
  app.post("/api/affiliate/track-click", trackClickHandler);
  app.post("/api/affiliate/track-session", trackSessionHandler);

  // Apply CSRF protection to state-changing API routes
  app.use("/api", csrfProtection);

  // Auth routes
  app.use("/api/auth", authRoutes);

  // Leads routes
  app.use("/api/leads", leadsRoutes);

  // Admin routes
  app.use("/api/admin", adminRoutes);

  // Budget routes (requires auth)
  app.use("/api/budget", budgetRoutes);

  // Transaction routes (requires auth)
  app.use("/api/transactions", transactionRoutes);

  // Receipt upload routes (requires auth)
  app.use("/api/receipts", receiptRoutes);

  // Email preference and weekly summary routes
  app.use("/api/email", emailRoutes);

  // Newsletter routes
  app.use("/api/newsletter", newsletterRoutes);

  // Affiliate analytics routes (admin)
  app.use("/api/affiliate", affiliateAnalyticsRoutes);

  // Monetization routes (feature-flagged)
  app.use("/api/monetization", monetizationRoutes);
  app.use("/api/checkout", monetizationRoutes);
  app.use("/api/webhooks", monetizationRoutes);
  app.use("/api/partner", monetizationRoutes);
  // Affiliate redirect endpoint (short URL)
  app.use("/r", monetizationRoutes);

  return httpServer;
}
