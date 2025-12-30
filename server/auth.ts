import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { userDb, resetDb, type User } from "./db";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./email";

const router = Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existing = userDb.findByEmail.get(email.toLowerCase()) as User | undefined;
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    userDb.create.run(userId, email.toLowerCase(), hashedPassword, name || null);

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(email, name).catch(console.error);

    res.json({
      success: true,
      user: { id: userId, email: email.toLowerCase(), name },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = userDb.findByEmail.get(email.toLowerCase()) as User | undefined;
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = userDb.findByEmail.get(email.toLowerCase()) as User | undefined;

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true });
    }

    // Create reset token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    resetDb.create.run(uuidv4(), user.id, token, expiresAt);

    // Send reset email
    await sendPasswordResetEmail(email, token);

    res.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const reset = resetDb.findByToken.get(token) as { user_id: string } | undefined;
    if (!reset) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 10);
    userDb.updatePassword.run(hashedPassword, reset.user_id);

    // Mark token as used
    resetDb.markUsed.run(token);

    res.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Get all users (admin endpoint for email list)
router.get("/users", (req, res) => {
  try {
    const users = userDb.getAll.all();
    const count = userDb.count.get() as { count: number };

    res.json({
      total: count.count,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
