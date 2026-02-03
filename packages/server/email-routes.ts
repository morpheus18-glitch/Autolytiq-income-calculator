import { Router } from "express";
import { requireAuth, type AuthRequest } from "./middleware/auth";
import { sendWeeklySummaryEmail, getWeeklyEmailData, type WeeklySummaryData } from "./email";
import { preferencesDb, statsDb, transactionDb, userDb, type UserStats } from "./db-postgres";

const router = Router();

// Get user's email preferences
router.get("/preferences", requireAuth, async (req: AuthRequest, res) => {
  try {
    const prefs = await preferencesDb.get(req.user!.id);

    res.json({
      weeklyEmailEnabled: prefs?.weekly_email_enabled === 1,
      budgetAlertThreshold: prefs?.budget_alert_threshold || null,
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// Update user's email preferences
router.post("/preferences", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { weeklyEmailEnabled, budgetAlertThreshold } = req.body;

    // Check if preferences exist
    const existing = await preferencesDb.get(req.user!.id);

    if (existing) {
      await preferencesDb.update(
        weeklyEmailEnabled ? 1 : 0,
        budgetAlertThreshold || null,
        req.user!.id
      );
    } else {
      await preferencesDb.create(
        req.user!.id,
        weeklyEmailEnabled ? 1 : 0,
        budgetAlertThreshold || null
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// Send test weekly summary email to authenticated user
router.post("/test-weekly-summary", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const userName = req.user!.name;

    // Get date range for last 7 days
    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get spending data
    const spendingData = await getWeeklyEmailData(userId, startDate, endDate);

    // Get top merchants
    const topMerchants = await transactionDb.getTopMerchants(
      userId,
      startDate,
      endDate,
      5
    );

    // Get user stats
    const stats = await statsDb.get(userId);

    const summaryData: WeeklySummaryData = {
      userId,
      email: userEmail,
      name: userName || undefined,
      startDate,
      endDate,
      totalSpent: spendingData.totalSpent,
      needsTotal: spendingData.needsTotal,
      wantsTotal: spendingData.wantsTotal,
      savingsTotal: spendingData.savingsTotal,
      transactionCount: spendingData.transactionCount,
      topMerchants,
      stats: stats || null,
    };

    const success = await sendWeeklySummaryEmail(summaryData);

    if (success) {
      res.json({ success: true, message: "Test email sent!" });
    } else {
      res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    console.error("Send test email error:", error);
    res.status(500).json({ error: "Failed to send test email" });
  }
});

// Cron endpoint to send weekly emails (secured with API key)
router.post("/send-weekly-batch", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.CRON_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get all users with weekly email enabled
    const enabledUsers = await preferencesDb.getAllEnabled();

    if (enabledUsers.length === 0) {
      return res.json({ sent: 0, message: "No users with weekly email enabled" });
    }

    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    let sentCount = 0;
    const errors: string[] = [];

    for (const { user_id } of enabledUsers) {
      try {
        // Get user info
        const user = await userDb.findById(user_id);

        if (!user) continue;

        // Get spending data
        const spendingData = await getWeeklyEmailData(user_id, startDate, endDate);

        // Skip if no transactions
        if (spendingData.transactionCount === 0) continue;

        // Get top merchants
        const topMerchants = await transactionDb.getTopMerchants(
          user_id,
          startDate,
          endDate,
          5
        );

        // Get user stats
        const stats = await statsDb.get(user_id);

        const summaryData: WeeklySummaryData = {
          userId: user_id,
          email: user.email,
          name: user.name || undefined,
          startDate,
          endDate,
          totalSpent: spendingData.totalSpent,
          needsTotal: spendingData.needsTotal,
          wantsTotal: spendingData.wantsTotal,
          savingsTotal: spendingData.savingsTotal,
          transactionCount: spendingData.transactionCount,
          topMerchants,
          stats: stats || null,
        };

        const success = await sendWeeklySummaryEmail(summaryData);
        if (success) {
          sentCount++;
        }
      } catch (err) {
        errors.push(`User ${user_id}: ${(err as Error).message}`);
      }
    }

    res.json({
      sent: sentCount,
      total: enabledUsers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Send weekly batch error:", error);
    res.status(500).json({ error: "Failed to send weekly emails" });
  }
});

export default router;
