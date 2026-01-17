import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { userDb, resetDb, type User } from "./db-postgres";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./email";
import {
  authRateLimiter,
  signupRateLimiter,
  passwordResetLimiter,
  recordFailedAttempt,
  isLocked,
  clearFailedAttempts,
  getLockTimeRemaining,
} from "./security/rate-limiter";
import { generateSecureToken } from "./security/crypto";

const router = Router();

// Password strength validation
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: "Password must contain at least one special character" };
  }
  return { valid: true };
}

// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Signup - with rate limiting
router.post("/signup", signupRateLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    // Sanitize name
    const sanitizedName = name ? name.trim().substring(0, 100) : null;

    // Check if user exists
    const existing = await userDb.findByEmail(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password with higher cost factor (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await userDb.create(userId, email.toLowerCase(), hashedPassword, sanitizedName);

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(email, sanitizedName || undefined).catch(console.error);

    res.json({
      success: true,
      user: { id: userId, email: email.toLowerCase(), name: sanitizedName },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Login - with rate limiting and brute force protection
router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if account is locked due to brute force
    if (await isLocked(normalizedEmail)) {
      const remaining = await getLockTimeRemaining(normalizedEmail);
      return res.status(429).json({
        error: `Account temporarily locked. Try again in ${Math.ceil(remaining / 60)} minutes.`,
      });
    }

    const user = await userDb.findByEmail(normalizedEmail);
    if (!user) {
      // Record failed attempt even for non-existent users (prevents enumeration)
      await recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const locked = await recordFailedAttempt(normalizedEmail);
      if (locked) {
        return res.status(429).json({
          error: "Too many failed attempts. Account locked for 30 minutes.",
        });
      }
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Clear failed attempts on successful login
    await clearFailedAttempts(normalizedEmail);

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Forgot password - with rate limiting
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await userDb.findByEmail(email.toLowerCase());

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true });
    }

    // Create cryptographically secure reset token
    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await resetDb.create(uuidv4(), user.id, token, expiresAt);

    // Send reset email
    await sendPasswordResetEmail(email, token);

    res.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Reset password - with rate limiting
router.post("/reset-password", authRateLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const reset = await resetDb.findByToken(token);
    if (!reset) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    // Hash new password with higher cost factor
    const hashedPassword = await bcrypt.hash(password, 12);
    await userDb.updatePassword(hashedPassword, reset.user_id);

    // Mark token as used
    await resetDb.markUsed(token);

    // Clear any failed login attempts for this user
    const user = await userDb.findById(reset.user_id);
    if (user) {
      await clearFailedAttempts(user.email);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Get all users (admin endpoint for email list)
router.get("/users", async (req, res) => {
  try {
    const users = await userDb.getAll();
    const countResult = await userDb.count();

    res.json({
      total: countResult.count,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
