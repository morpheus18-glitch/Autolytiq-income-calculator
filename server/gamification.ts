import { v4 as uuidv4 } from "uuid";
import { statsDb, activityDb, type UserStats } from "./db-postgres";

// Badge definitions
export const BADGES = {
  first_transaction: {
    id: "first_transaction",
    name: "First Step",
    description: "Logged your first transaction",
    icon: "🎯",
  },
  streak_7: {
    id: "streak_7",
    name: "Week Warrior",
    description: "7-day logging streak",
    icon: "🔥",
  },
  streak_30: {
    id: "streak_30",
    name: "Monthly Master",
    description: "30-day logging streak",
    icon: "⚡",
  },
  transactions_10: {
    id: "transactions_10",
    name: "Getting Started",
    description: "Logged 10 transactions",
    icon: "📝",
  },
  transactions_50: {
    id: "transactions_50",
    name: "Consistent Tracker",
    description: "Logged 50 transactions",
    icon: "📊",
  },
  transactions_100: {
    id: "transactions_100",
    name: "Expense Expert",
    description: "Logged 100 transactions",
    icon: "🏆",
  },
  under_budget_4: {
    id: "under_budget_4",
    name: "Budget Boss",
    description: "4 weeks under budget",
    icon: "💰",
  },
  under_budget_12: {
    id: "under_budget_12",
    name: "Quarterly Champion",
    description: "12 weeks under budget",
    icon: "👑",
  },
};

export type BadgeId = keyof typeof BADGES;

/**
 * Get or create user stats
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const existing = await statsDb.get(userId);

  if (existing) {
    return existing;
  }

  // Create default stats
  const defaultStats: UserStats = {
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
    total_transactions_logged: 0,
    total_days_logged: 0,
    last_log_date: null,
    weeks_under_budget: 0,
    badges: "[]",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await statsDb.upsert(
    userId,
    0,
    0,
    0,
    0,
    null,
    0,
    "[]"
  );

  return defaultStats;
}

/**
 * Record a transaction and update gamification stats
 */
export async function recordTransaction(
  userId: string,
  amount: number,
  transactionDate: string
): Promise<{ stats: UserStats; newBadges: BadgeId[] }> {
  const today = new Date().toISOString().split("T")[0];
  const newBadges: BadgeId[] = [];

  // Get current stats
  let stats = await getUserStats(userId);
  const currentBadges: BadgeId[] = JSON.parse(stats.badges || "[]");

  // Update daily activity
  await activityDb.upsert(uuidv4(), userId, transactionDate, 1, amount);

  // Update transaction count
  stats.total_transactions_logged += 1;

  // Check for transaction count badges
  if (stats.total_transactions_logged === 1 && !currentBadges.includes("first_transaction")) {
    newBadges.push("first_transaction");
    currentBadges.push("first_transaction");
  }
  if (stats.total_transactions_logged >= 10 && !currentBadges.includes("transactions_10")) {
    newBadges.push("transactions_10");
    currentBadges.push("transactions_10");
  }
  if (stats.total_transactions_logged >= 50 && !currentBadges.includes("transactions_50")) {
    newBadges.push("transactions_50");
    currentBadges.push("transactions_50");
  }
  if (stats.total_transactions_logged >= 100 && !currentBadges.includes("transactions_100")) {
    newBadges.push("transactions_100");
    currentBadges.push("transactions_100");
  }

  // Update streak
  if (stats.last_log_date !== today) {
    const lastDate = stats.last_log_date ? new Date(stats.last_log_date) : null;
    const currentDate = new Date(today);

    if (lastDate) {
      const diffDays = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day - continue streak
        stats.current_streak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        stats.current_streak = 1;
      }
      // diffDays === 0 means same day, streak stays the same
    } else {
      // First ever log
      stats.current_streak = 1;
    }

    stats.total_days_logged += 1;
    stats.last_log_date = today;

    // Update longest streak
    if (stats.current_streak > stats.longest_streak) {
      stats.longest_streak = stats.current_streak;
    }
  }

  // Check for streak badges
  if (stats.current_streak >= 7 && !currentBadges.includes("streak_7")) {
    newBadges.push("streak_7");
    currentBadges.push("streak_7");
  }
  if (stats.current_streak >= 30 && !currentBadges.includes("streak_30")) {
    newBadges.push("streak_30");
    currentBadges.push("streak_30");
  }

  // Save updated stats
  stats.badges = JSON.stringify(currentBadges);
  await statsDb.upsert(
    userId,
    stats.current_streak,
    stats.longest_streak,
    stats.total_transactions_logged,
    stats.total_days_logged,
    stats.last_log_date,
    stats.weeks_under_budget,
    stats.badges
  );

  return { stats, newBadges };
}

/**
 * Record a week under budget
 */
export async function recordWeekUnderBudget(userId: string): Promise<BadgeId[]> {
  const stats = await getUserStats(userId);
  const currentBadges: BadgeId[] = JSON.parse(stats.badges || "[]");
  const newBadges: BadgeId[] = [];

  stats.weeks_under_budget += 1;

  // Check for under budget badges
  if (stats.weeks_under_budget >= 4 && !currentBadges.includes("under_budget_4")) {
    newBadges.push("under_budget_4");
    currentBadges.push("under_budget_4");
  }
  if (stats.weeks_under_budget >= 12 && !currentBadges.includes("under_budget_12")) {
    newBadges.push("under_budget_12");
    currentBadges.push("under_budget_12");
  }

  // Save updated stats
  await statsDb.upsert(
    userId,
    stats.current_streak,
    stats.longest_streak,
    stats.total_transactions_logged,
    stats.total_days_logged,
    stats.last_log_date,
    stats.weeks_under_budget,
    JSON.stringify(currentBadges)
  );

  return newBadges;
}

/**
 * Get user's badges with details
 */
export async function getUserBadges(userId: string): Promise<Array<typeof BADGES[BadgeId]>> {
  const stats = await getUserStats(userId);
  const badgeIds: BadgeId[] = JSON.parse(stats.badges || "[]");
  return badgeIds.map((id) => BADGES[id]).filter(Boolean);
}

/**
 * Calculate current streak from activity log
 */
export async function calculateStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const activities = await activityDb.getStreakDays(userId, today);

  if (activities.length === 0) return 0;

  let streak = 0;
  let expectedDate = new Date(today);

  for (const activity of activities) {
    const activityDate = new Date(activity.activity_date);
    const diffDays = Math.floor(
      (expectedDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      expectedDate = activityDate;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
