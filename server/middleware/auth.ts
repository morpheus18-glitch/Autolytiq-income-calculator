import type { Request, Response, NextFunction } from "express";
import { userDb, type User } from "../db-postgres";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name?: string };
}

/**
 * Middleware to require authentication.
 * Checks for x-user-id header and validates the user exists.
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const user = await userDb.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
}

/**
 * Optional auth middleware - attaches user if present but doesn't require it.
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.headers["x-user-id"] as string;

  if (userId) {
    try {
      const user = await userDb.findById(userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
        };
      }
    } catch (error) {
      // Ignore errors in optional auth
    }
  }

  next();
}
