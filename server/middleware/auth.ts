import type { Request, Response, NextFunction } from "express";
import { userDb, type User } from "../db";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name?: string };
}

/**
 * Middleware to require authentication.
 * Checks for x-user-id header and validates the user exists.
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = userDb.findById.get(userId) as User | undefined;

  if (!user) {
    return res.status(401).json({ error: "Invalid user" });
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
  };

  next();
}

/**
 * Optional auth middleware - attaches user if present but doesn't require it.
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.headers["x-user-id"] as string;

  if (userId) {
    const user = userDb.findById.get(userId) as User | undefined;
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
      };
    }
  }

  next();
}
