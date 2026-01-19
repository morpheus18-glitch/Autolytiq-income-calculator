import { Pool, PoolClient } from "pg";

// Connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("[Database] No DATABASE_URL set, PostgreSQL features disabled");
}

// Create connection pool
export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : null;

// Initialize schema
export async function initializeDatabase() {
  if (!pool) return;

  const client = await pool.connect();
  try {
    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified INTEGER DEFAULT 0
      );

      -- Password resets
      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Budget snapshots
      CREATE TABLE IF NOT EXISTS budget_snapshots (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        fixed_expenses TEXT NOT NULL,
        frequency_data TEXT NOT NULL,
        selected_subscriptions TEXT NOT NULL,
        custom_sub_amounts TEXT,
        monthly_income REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Transactions
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        merchant TEXT,
        description TEXT,
        category TEXT NOT NULL,
        subcategory TEXT,
        transaction_date DATE NOT NULL,
        source TEXT NOT NULL DEFAULT 'manual',
        receipt_path TEXT,
        ocr_raw_text TEXT,
        confidence_score REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Merchant categories
      CREATE TABLE IF NOT EXISTS merchant_categories (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        merchant_pattern TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, merchant_pattern)
      );

      -- User preferences
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        weekly_email_enabled INTEGER DEFAULT 1,
        weekly_email_day INTEGER DEFAULT 0,
        budget_alert_threshold REAL DEFAULT 0.8,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- User stats
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        total_transactions_logged INTEGER DEFAULT 0,
        total_days_logged INTEGER DEFAULT 0,
        last_log_date DATE,
        weeks_under_budget INTEGER DEFAULT 0,
        badges TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Daily activity
      CREATE TABLE IF NOT EXISTS daily_activity (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_date DATE NOT NULL,
        transactions_count INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, activity_date)
      );

      -- Plaid items
      CREATE TABLE IF NOT EXISTS plaid_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        item_id TEXT UNIQUE NOT NULL,
        institution_id TEXT,
        institution_name TEXT,
        cursor TEXT,
        last_synced_at TIMESTAMP,
        error_code TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Plaid accounts
      CREATE TABLE IF NOT EXISTS plaid_accounts (
        id TEXT PRIMARY KEY,
        plaid_item_id TEXT NOT NULL REFERENCES plaid_items(id) ON DELETE CASCADE,
        account_id TEXT UNIQUE NOT NULL,
        name TEXT,
        official_name TEXT,
        type TEXT,
        subtype TEXT,
        mask TEXT,
        current_balance REAL,
        available_balance REAL,
        iso_currency_code TEXT DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Affiliate clicks tracking
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id TEXT PRIMARY KEY,
        affiliate_name TEXT NOT NULL,
        affiliate_url TEXT NOT NULL,
        category TEXT NOT NULL,
        page_source TEXT NOT NULL,
        session_id TEXT,
        user_agent TEXT,
        ip_address TEXT,
        referrer TEXT,
        device_type TEXT,
        browser TEXT,
        country TEXT,
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Affiliate sessions (for conversion tracking)
      CREATE TABLE IF NOT EXISTS affiliate_sessions (
        id TEXT PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        first_page TEXT,
        pages_visited INTEGER DEFAULT 1,
        affiliate_clicks INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        converted INTEGER DEFAULT 0,
        bounced INTEGER DEFAULT 0
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_name ON affiliate_clicks(affiliate_name);
      CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON affiliate_clicks(clicked_at);
      CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_category ON affiliate_clicks(category);
      CREATE INDEX IF NOT EXISTS idx_affiliate_sessions_session ON affiliate_sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
      CREATE INDEX IF NOT EXISTS idx_budget_snapshots_user ON budget_snapshots(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, transaction_date);
      CREATE INDEX IF NOT EXISTS idx_merchant_categories_pattern ON merchant_categories(merchant_pattern);
      CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON daily_activity(user_id, activity_date);
      CREATE INDEX IF NOT EXISTS idx_plaid_items_user ON plaid_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);
      CREATE INDEX IF NOT EXISTS idx_plaid_accounts_item ON plaid_accounts(plaid_item_id);
      CREATE INDEX IF NOT EXISTS idx_plaid_accounts_account_id ON plaid_accounts(account_id);
    `);
    console.log("[Database] PostgreSQL schema initialized");
  } finally {
    client.release();
  }
}

// Type definitions (same as SQLite)
export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  created_at: string;
  verified: number;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: number;
  created_at: string;
}

export interface BudgetSnapshot {
  id: string;
  user_id: string;
  name: string | null;
  fixed_expenses: string;
  frequency_data: string;
  selected_subscriptions: string;
  custom_sub_amounts: string | null;
  monthly_income: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  merchant: string | null;
  description: string | null;
  category: string;
  subcategory: string | null;
  transaction_date: string;
  source: string;
  receipt_path: string | null;
  ocr_raw_text: string | null;
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface MerchantCategory {
  id: string;
  user_id: string | null;
  merchant_pattern: string;
  category: string;
  subcategory: string | null;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  weekly_email_enabled: number;
  weekly_email_day: number;
  budget_alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_transactions_logged: number;
  total_days_logged: number;
  last_log_date: string | null;
  weeks_under_budget: number;
  badges: string;
  created_at: string;
  updated_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  transactions_count: number;
  total_spent: number;
  created_at: string;
}

export interface PlaidItem {
  id: string;
  user_id: string;
  access_token: string;
  item_id: string;
  institution_id: string | null;
  institution_name: string | null;
  cursor: string | null;
  last_synced_at: string | null;
  error_code: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PlaidAccount {
  id: string;
  plaid_item_id: string;
  account_id: string;
  name: string | null;
  official_name: string | null;
  type: string | null;
  subtype: string | null;
  mask: string | null;
  current_balance: number | null;
  available_balance: number | null;
  iso_currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateClick {
  id: string;
  affiliate_name: string;
  affiliate_url: string;
  category: string;
  page_source: string;
  session_id: string | null;
  user_agent: string | null;
  ip_address: string | null;
  referrer: string | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  clicked_at: string;
}

export interface AffiliateSession {
  id: string;
  session_id: string;
  first_page: string | null;
  pages_visited: number;
  affiliate_clicks: number;
  started_at: string;
  last_activity: string;
  converted: number;
  bounced: number;
}

// Query helper
async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (!pool) throw new Error("Database not configured");
  const result = await pool.query(sql, params);
  return result.rows;
}

async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

async function execute(sql: string, params: unknown[] = []): Promise<void> {
  if (!pool) throw new Error("Database not configured");
  await pool.query(sql, params);
}

// User database operations
export const userDb = {
  create: async (id: string, email: string, password: string, name: string | null) => {
    await execute(
      "INSERT INTO users (id, email, password, name, verified) VALUES ($1, $2, $3, $4, 1)",
      [id, email, password, name]
    );
  },

  findByEmail: async (email: string) => {
    return queryOne<User>("SELECT * FROM users WHERE email = $1", [email]);
  },

  findById: async (id: string) => {
    return queryOne<User>("SELECT * FROM users WHERE id = $1", [id]);
  },

  updatePassword: async (password: string, id: string) => {
    await execute("UPDATE users SET password = $1 WHERE id = $2", [password, id]);
  },

  getAll: async () => {
    return query<Omit<User, "password">>(
      "SELECT id, email, name, created_at, verified FROM users ORDER BY created_at DESC"
    );
  },

  count: async () => {
    const result = await queryOne<{ count: string }>("SELECT COUNT(*) as count FROM users");
    return { count: parseInt(result?.count || "0") };
  },
};

// Password reset operations
export const resetDb = {
  create: async (id: string, userId: string, token: string, expiresAt: string) => {
    await execute(
      "INSERT INTO password_resets (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)",
      [id, userId, token, expiresAt]
    );
  },

  findByToken: async (token: string) => {
    return queryOne<PasswordReset>(
      "SELECT * FROM password_resets WHERE token = $1 AND used = 0 AND expires_at > NOW()",
      [token]
    );
  },

  markUsed: async (token: string) => {
    await execute("UPDATE password_resets SET used = 1 WHERE token = $1", [token]);
  },
};

// Budget operations
export const budgetDb = {
  create: async (
    id: string, userId: string, name: string | null, fixedExpenses: string,
    frequencyData: string, selectedSubs: string, customSubAmounts: string | null, monthlyIncome: number
  ) => {
    await execute(
      `INSERT INTO budget_snapshots (id, user_id, name, fixed_expenses, frequency_data, selected_subscriptions, custom_sub_amounts, monthly_income)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, userId, name, fixedExpenses, frequencyData, selectedSubs, customSubAmounts, monthlyIncome]
    );
  },

  findByUser: async (userId: string) => {
    return query<BudgetSnapshot>(
      "SELECT * FROM budget_snapshots WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
  },

  findLatest: async (userId: string) => {
    return queryOne<BudgetSnapshot>(
      "SELECT * FROM budget_snapshots WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
  },

  findById: async (id: string, userId: string) => {
    return queryOne<BudgetSnapshot>(
      "SELECT * FROM budget_snapshots WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
  },

  update: async (
    fixedExpenses: string, frequencyData: string, selectedSubs: string,
    customSubAmounts: string | null, monthlyIncome: number, id: string, userId: string
  ) => {
    await execute(
      `UPDATE budget_snapshots SET
         fixed_expenses = $1, frequency_data = $2, selected_subscriptions = $3,
         custom_sub_amounts = $4, monthly_income = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7`,
      [fixedExpenses, frequencyData, selectedSubs, customSubAmounts, monthlyIncome, id, userId]
    );
  },

  delete: async (id: string, userId: string) => {
    await execute("DELETE FROM budget_snapshots WHERE id = $1 AND user_id = $2", [id, userId]);
  },
};

// Transaction operations
export const transactionDb = {
  create: async (
    id: string, userId: string, amount: number, merchant: string | null,
    description: string | null, category: string, subcategory: string | null,
    transactionDate: string, source: string, receiptPath: string | null,
    ocrRawText: string | null, confidenceScore: number | null
  ) => {
    await execute(
      `INSERT INTO transactions (id, user_id, amount, merchant, description, category, subcategory, transaction_date, source, receipt_path, ocr_raw_text, confidence_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, userId, amount, merchant, description, category, subcategory, transactionDate, source, receiptPath, ocrRawText, confidenceScore]
    );
  },

  findByUser: async (userId: string, limit: number, offset: number) => {
    return query<Transaction>(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset]
    );
  },

  findByUserDateRange: async (userId: string, startDate: string, endDate: string) => {
    return query<Transaction>(
      "SELECT * FROM transactions WHERE user_id = $1 AND transaction_date BETWEEN $2 AND $3 ORDER BY transaction_date DESC",
      [userId, startDate, endDate]
    );
  },

  findById: async (id: string, userId: string) => {
    return queryOne<Transaction>(
      "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
  },

  update: async (
    amount: number, merchant: string | null, description: string | null,
    category: string, subcategory: string | null, transactionDate: string,
    id: string, userId: string
  ) => {
    await execute(
      `UPDATE transactions SET
         amount = $1, merchant = $2, description = $3, category = $4, subcategory = $5,
         transaction_date = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8`,
      [amount, merchant, description, category, subcategory, transactionDate, id, userId]
    );
  },

  delete: async (id: string, userId: string) => {
    await execute("DELETE FROM transactions WHERE id = $1 AND user_id = $2", [id, userId]);
  },

  sumByCategory: async (userId: string, startDate: string, endDate: string) => {
    return query<{ category: string; subcategory: string | null; total: number }>(
      `SELECT category, subcategory, SUM(amount) as total
       FROM transactions WHERE user_id = $1 AND transaction_date BETWEEN $2 AND $3
       GROUP BY category, subcategory`,
      [userId, startDate, endDate]
    );
  },

  countByUser: async (userId: string) => {
    const result = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM transactions WHERE user_id = $1",
      [userId]
    );
    return { count: parseInt(result?.count || "0") };
  },

  getTopMerchants: async (userId: string, startDate: string, endDate: string, limit: number) => {
    return query<{ merchant: string; total: number; count: number }>(
      `SELECT merchant, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE user_id = $1 AND transaction_date BETWEEN $2 AND $3 AND merchant IS NOT NULL
       GROUP BY merchant
       ORDER BY total DESC
       LIMIT $4`,
      [userId, startDate, endDate, limit]
    );
  },
};

// Merchant category operations
export const merchantDb = {
  findMatch: async (userId: string, merchantName: string) => {
    return queryOne<MerchantCategory>(
      `SELECT * FROM merchant_categories
       WHERE (user_id IS NULL OR user_id = $1)
       AND LOWER($2) LIKE '%' || LOWER(merchant_pattern) || '%'
       ORDER BY user_id DESC NULLS LAST LIMIT 1`,
      [userId, merchantName]
    );
  },

  create: async (id: string, userId: string | null, pattern: string, category: string, subcategory: string | null) => {
    await execute(
      `INSERT INTO merchant_categories (id, user_id, merchant_pattern, category, subcategory)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, merchant_pattern) DO UPDATE SET category = $4, subcategory = $5`,
      [id, userId, pattern, category, subcategory]
    );
  },

  findByUser: async (userId: string) => {
    return query<MerchantCategory>(
      "SELECT * FROM merchant_categories WHERE user_id = $1 OR user_id IS NULL ORDER BY merchant_pattern",
      [userId]
    );
  },
};

// User preferences operations
export const preferencesDb = {
  get: async (userId: string) => {
    return queryOne<UserPreferences>("SELECT * FROM user_preferences WHERE user_id = $1", [userId]);
  },

  create: async (userId: string, weeklyEmailEnabled: number, budgetAlertThreshold: number | null) => {
    await execute(
      "INSERT INTO user_preferences (user_id, weekly_email_enabled, budget_alert_threshold) VALUES ($1, $2, $3)",
      [userId, weeklyEmailEnabled, budgetAlertThreshold]
    );
  },

  update: async (weeklyEmailEnabled: number, budgetAlertThreshold: number | null, userId: string) => {
    await execute(
      `UPDATE user_preferences SET
         weekly_email_enabled = $1, budget_alert_threshold = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [weeklyEmailEnabled, budgetAlertThreshold, userId]
    );
  },

  upsert: async (userId: string, weeklyEmailEnabled: number, weeklyEmailDay: number, budgetAlertThreshold: number) => {
    await execute(
      `INSERT INTO user_preferences (user_id, weekly_email_enabled, weekly_email_day, budget_alert_threshold)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         weekly_email_enabled = $2, weekly_email_day = $3, budget_alert_threshold = $4, updated_at = CURRENT_TIMESTAMP`,
      [userId, weeklyEmailEnabled, weeklyEmailDay, budgetAlertThreshold]
    );
  },

  getAllEnabled: async () => {
    return query<{ user_id: string }>("SELECT user_id FROM user_preferences WHERE weekly_email_enabled = 1");
  },

  getUsersForWeeklyEmail: async (day: number) => {
    return query<{ id: string; email: string; name: string | null; weekly_email_day: number }>(
      `SELECT u.id, u.email, u.name, COALESCE(p.weekly_email_day, 0) as weekly_email_day
       FROM users u
       LEFT JOIN user_preferences p ON u.id = p.user_id
       WHERE p.weekly_email_enabled = 1 OR p.user_id IS NULL`
    );
  },
};

// User stats operations
export const statsDb = {
  get: async (userId: string) => {
    return queryOne<UserStats>("SELECT * FROM user_stats WHERE user_id = $1", [userId]);
  },

  upsert: async (
    userId: string, currentStreak: number, longestStreak: number,
    totalTransactions: number, totalDays: number, lastLogDate: string | null,
    weeksUnderBudget: number, badges: string
  ) => {
    await execute(
      `INSERT INTO user_stats (user_id, current_streak, longest_streak, total_transactions_logged, total_days_logged, last_log_date, weeks_under_budget, badges)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
         current_streak = $2, longest_streak = $3, total_transactions_logged = $4,
         total_days_logged = $5, last_log_date = $6, weeks_under_budget = $7, badges = $8, updated_at = CURRENT_TIMESTAMP`,
      [userId, currentStreak, longestStreak, totalTransactions, totalDays, lastLogDate, weeksUnderBudget, badges]
    );
  },

  incrementTransactions: async (userId: string) => {
    await execute(
      `UPDATE user_stats SET total_transactions_logged = total_transactions_logged + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
      [userId]
    );
  },
};

// Daily activity operations
export const activityDb = {
  upsert: async (id: string, userId: string, activityDate: string, transactionsCount: number, totalSpent: number) => {
    await execute(
      `INSERT INTO daily_activity (id, user_id, activity_date, transactions_count, total_spent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, activity_date) DO UPDATE SET
         transactions_count = daily_activity.transactions_count + $4,
         total_spent = daily_activity.total_spent + $5`,
      [id, userId, activityDate, transactionsCount, totalSpent]
    );
  },

  getByDateRange: async (userId: string, startDate: string, endDate: string) => {
    return query<DailyActivity>(
      `SELECT * FROM daily_activity WHERE user_id = $1 AND activity_date BETWEEN $2 AND $3 ORDER BY activity_date DESC`,
      [userId, startDate, endDate]
    );
  },

  getStreakDays: async (userId: string, beforeDate: string) => {
    return query<{ activity_date: string }>(
      `SELECT activity_date FROM daily_activity WHERE user_id = $1 AND activity_date <= $2 ORDER BY activity_date DESC LIMIT 30`,
      [userId, beforeDate]
    );
  },
};

// Weekly summary operations
export const summaryDb = {
  getWeeklySummary: async (userId: string, startDate: string, endDate: string) => {
    return query<{ transaction_count: number; total_spent: number; category: string; needs_total: number; wants_total: number; savings_total: number }>(
      `SELECT
         COUNT(*) as transaction_count,
         SUM(amount) as total_spent,
         category,
         SUM(CASE WHEN category = 'needs' THEN amount ELSE 0 END) as needs_total,
         SUM(CASE WHEN category = 'wants' THEN amount ELSE 0 END) as wants_total,
         SUM(CASE WHEN category = 'savings' THEN amount ELSE 0 END) as savings_total
       FROM transactions
       WHERE user_id = $1 AND transaction_date BETWEEN $2 AND $3
       GROUP BY category`,
      [userId, startDate, endDate]
    );
  },

  getTopMerchants: async (userId: string, startDate: string, endDate: string) => {
    return query<{ merchant: string; total: number; count: number }>(
      `SELECT merchant, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE user_id = $1 AND transaction_date BETWEEN $2 AND $3 AND merchant IS NOT NULL
       GROUP BY merchant
       ORDER BY total DESC
       LIMIT 5`,
      [userId, startDate, endDate]
    );
  },
};

// Plaid items operations
export const plaidItemDb = {
  create: async (id: string, userId: string, accessToken: string, itemId: string, institutionId: string | null, institutionName: string | null) => {
    await execute(
      `INSERT INTO plaid_items (id, user_id, access_token, item_id, institution_id, institution_name) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userId, accessToken, itemId, institutionId, institutionName]
    );
  },

  findByUser: async (userId: string) => {
    return query<PlaidItem>(
      "SELECT * FROM plaid_items WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC",
      [userId]
    );
  },

  findByItemId: async (itemId: string) => {
    return queryOne<PlaidItem>("SELECT * FROM plaid_items WHERE item_id = $1", [itemId]);
  },

  findById: async (id: string, userId: string) => {
    return queryOne<PlaidItem>("SELECT * FROM plaid_items WHERE id = $1 AND user_id = $2", [id, userId]);
  },

  updateCursor: async (cursor: string, itemId: string) => {
    await execute(
      `UPDATE plaid_items SET cursor = $1, last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE item_id = $2`,
      [cursor, itemId]
    );
  },

  updateError: async (errorCode: string, itemId: string) => {
    await execute(
      `UPDATE plaid_items SET error_code = $1, status = 'error', updated_at = CURRENT_TIMESTAMP WHERE item_id = $2`,
      [errorCode, itemId]
    );
  },

  clearError: async (itemId: string) => {
    await execute(
      `UPDATE plaid_items SET error_code = NULL, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE item_id = $1`,
      [itemId]
    );
  },

  delete: async (id: string, userId: string) => {
    await execute("DELETE FROM plaid_items WHERE id = $1 AND user_id = $2", [id, userId]);
  },

  deleteByItemId: async (itemId: string) => {
    await execute("DELETE FROM plaid_items WHERE item_id = $1", [itemId]);
  },
};

// Plaid accounts operations
export const plaidAccountDb = {
  upsert: async (
    id: string, plaidItemId: string, accountId: string, name: string | null,
    officialName: string | null, type: string | null, subtype: string | null,
    mask: string | null, currentBalance: number | null, availableBalance: number | null,
    isoCurrencyCode: string
  ) => {
    await execute(
      `INSERT INTO plaid_accounts (id, plaid_item_id, account_id, name, official_name, type, subtype, mask, current_balance, available_balance, iso_currency_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (account_id) DO UPDATE SET
         name = $4, official_name = $5, current_balance = $9, available_balance = $10, updated_at = CURRENT_TIMESTAMP`,
      [id, plaidItemId, accountId, name, officialName, type, subtype, mask, currentBalance, availableBalance, isoCurrencyCode]
    );
  },

  findByItem: async (plaidItemId: string) => {
    return query<PlaidAccount>("SELECT * FROM plaid_accounts WHERE plaid_item_id = $1", [plaidItemId]);
  },

  findByAccountId: async (accountId: string) => {
    return queryOne<PlaidAccount>("SELECT * FROM plaid_accounts WHERE account_id = $1", [accountId]);
  },

  deleteByItem: async (plaidItemId: string) => {
    await execute("DELETE FROM plaid_accounts WHERE plaid_item_id = $1", [plaidItemId]);
  },
};

// Affiliate tracking operations
export const affiliateDb = {
  trackClick: async (
    id: string, affiliateName: string, affiliateUrl: string, category: string,
    pageSource: string, sessionId: string | null, userAgent: string | null,
    ipAddress: string | null, referrer: string | null, deviceType: string | null,
    browser: string | null, country: string | null
  ) => {
    await execute(
      `INSERT INTO affiliate_clicks (id, affiliate_name, affiliate_url, category, page_source, session_id, user_agent, ip_address, referrer, device_type, browser, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, affiliateName, affiliateUrl, category, pageSource, sessionId, userAgent, ipAddress, referrer, deviceType, browser, country]
    );
  },

  getClicks: async (startDate: string, endDate: string) => {
    return query<AffiliateClick>(
      `SELECT * FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2 ORDER BY clicked_at DESC`,
      [startDate, endDate]
    );
  },

  getClicksByAffiliate: async (startDate: string, endDate: string) => {
    return query<{ affiliate_name: string; category: string; clicks: number; unique_sessions: number }>(
      `SELECT affiliate_name, category, COUNT(*) as clicks, COUNT(DISTINCT session_id) as unique_sessions
       FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2
       GROUP BY affiliate_name, category ORDER BY clicks DESC`,
      [startDate, endDate]
    );
  },

  getClicksByPage: async (startDate: string, endDate: string) => {
    return query<{ page_source: string; clicks: number }>(
      `SELECT page_source, COUNT(*) as clicks
       FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2
       GROUP BY page_source ORDER BY clicks DESC`,
      [startDate, endDate]
    );
  },

  getClicksByDevice: async (startDate: string, endDate: string) => {
    return query<{ device_type: string; clicks: number }>(
      `SELECT COALESCE(device_type, 'unknown') as device_type, COUNT(*) as clicks
       FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2
       GROUP BY device_type ORDER BY clicks DESC`,
      [startDate, endDate]
    );
  },

  getClicksByBrowser: async (startDate: string, endDate: string) => {
    return query<{ browser: string; clicks: number }>(
      `SELECT COALESCE(browser, 'unknown') as browser, COUNT(*) as clicks
       FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2
       GROUP BY browser ORDER BY clicks DESC`,
      [startDate, endDate]
    );
  },

  getDailyClicks: async (startDate: string, endDate: string) => {
    return query<{ date: string; clicks: number; unique_sessions: number }>(
      `SELECT DATE(clicked_at) as date, COUNT(*) as clicks, COUNT(DISTINCT session_id) as unique_sessions
       FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2
       GROUP BY DATE(clicked_at) ORDER BY date ASC`,
      [startDate, endDate]
    );
  },

  getHourlyClicks: async (startDate: string, endDate: string) => {
    return query<{ hour: number; clicks: number }>(
      `SELECT EXTRACT(HOUR FROM clicked_at) as hour, COUNT(*) as clicks
       FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2
       GROUP BY EXTRACT(HOUR FROM clicked_at) ORDER BY hour ASC`,
      [startDate, endDate]
    );
  },

  getTotalStats: async (startDate: string, endDate: string) => {
    return queryOne<{ total_clicks: number; unique_sessions: number; unique_affiliates: number }>(
      `SELECT COUNT(*) as total_clicks, COUNT(DISTINCT session_id) as unique_sessions, COUNT(DISTINCT affiliate_name) as unique_affiliates
       FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );
  },

  getTopReferrers: async (startDate: string, endDate: string, limit: number) => {
    return query<{ referrer: string; clicks: number }>(
      `SELECT COALESCE(referrer, 'direct') as referrer, COUNT(*) as clicks
       FROM affiliate_clicks WHERE clicked_at BETWEEN $1 AND $2
       GROUP BY referrer ORDER BY clicks DESC LIMIT $3`,
      [startDate, endDate, limit]
    );
  },
};

// Session tracking operations
export const sessionDb = {
  upsert: async (id: string, sessionId: string, firstPage: string | null) => {
    await execute(
      `INSERT INTO affiliate_sessions (id, session_id, first_page)
       VALUES ($1, $2, $3)
       ON CONFLICT (session_id) DO UPDATE SET
         pages_visited = affiliate_sessions.pages_visited + 1,
         last_activity = CURRENT_TIMESTAMP`,
      [id, sessionId, firstPage]
    );
  },

  incrementClicks: async (sessionId: string) => {
    await execute(
      `UPDATE affiliate_sessions SET affiliate_clicks = affiliate_clicks + 1, last_activity = CURRENT_TIMESTAMP WHERE session_id = $1`,
      [sessionId]
    );
  },

  markBounced: async (sessionId: string) => {
    await execute(
      `UPDATE affiliate_sessions SET bounced = 1 WHERE session_id = $1 AND pages_visited = 1`,
      [sessionId]
    );
  },

  getSessionStats: async (startDate: string, endDate: string) => {
    return queryOne<{ total_sessions: number; sessions_with_clicks: number; bounced_sessions: number; avg_pages: number }>(
      `SELECT
         COUNT(*) as total_sessions,
         SUM(CASE WHEN affiliate_clicks > 0 THEN 1 ELSE 0 END) as sessions_with_clicks,
         SUM(bounced) as bounced_sessions,
         AVG(pages_visited) as avg_pages
       FROM affiliate_sessions WHERE started_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );
  },
};

export default pool;
