import type { Express } from "express";
import type { Server } from "http";
import authRoutes from "./auth";
import leadsRoutes from "./leads";

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

  return httpServer;
}
