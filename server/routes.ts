import type { Express } from "express";
import type { Server } from "http";
import authRoutes from "./auth";
import leadsRoutes from "./leads";
import adminRoutes from "./admin";
import budgetRoutes from "./budget";
import transactionRoutes from "./transactions";
import receiptRoutes from "./receipts";
import emailRoutes from "./email-routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

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

  return httpServer;
}
