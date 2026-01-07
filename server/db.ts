import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Use process.cwd() for compatibility with both ESM dev and CJS production
const dbPath = path.join(process.cwd(), "data", "app.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

  -- Budget snapshots: saves user's budget questionnaire state
  CREATE TABLE IF NOT EXISTS budget_snapshots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT,
    fixed_expenses TEXT NOT NULL,
    frequency_data TEXT NOT NULL,
    selected_subscriptions TEXT NOT NULL,
    custom_sub_amounts TEXT,
    monthly_income REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Individual transactions for expense tracking
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Merchant category mappings for auto-categorization
  CREATE TABLE IF NOT EXISTS merchant_categories (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    merchant_pattern TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, merchant_pattern)
  );

  CREATE INDEX IF NOT EXISTS idx_budget_snapshots_user ON budget_snapshots(user_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, transaction_date);
  CREATE INDEX IF NOT EXISTS idx_merchant_categories_pattern ON merchant_categories(merchant_pattern);

  -- User preferences for notifications and settings
  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    weekly_email_enabled INTEGER DEFAULT 1,
    weekly_email_day INTEGER DEFAULT 0,
    budget_alert_threshold REAL DEFAULT 0.8,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Gamification: user stats and achievements
  CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_transactions_logged INTEGER DEFAULT 0,
    total_days_logged INTEGER DEFAULT 0,
    last_log_date DATE,
    weeks_under_budget INTEGER DEFAULT 0,
    badges TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Daily activity log for streak tracking
  CREATE TABLE IF NOT EXISTS daily_activity (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_date DATE NOT NULL,
    transactions_count INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON daily_activity(user_id, activity_date);

  -- Plaid: connected bank items (institutions)
  CREATE TABLE IF NOT EXISTS plaid_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    item_id TEXT UNIQUE NOT NULL,
    institution_id TEXT,
    institution_name TEXT,
    cursor TEXT,
    last_synced_at DATETIME,
    error_code TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Plaid: individual bank accounts
  CREATE TABLE IF NOT EXISTS plaid_accounts (
    id TEXT PRIMARY KEY,
    plaid_item_id TEXT NOT NULL,
    account_id TEXT UNIQUE NOT NULL,
    name TEXT,
    official_name TEXT,
    type TEXT,
    subtype TEXT,
    mask TEXT,
    current_balance REAL,
    available_balance REAL,
    iso_currency_code TEXT DEFAULT 'USD',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plaid_item_id) REFERENCES plaid_items(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_plaid_items_user ON plaid_items(user_id);
  CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);
  CREATE INDEX IF NOT EXISTS idx_plaid_accounts_item ON plaid_accounts(plaid_item_id);
  CREATE INDEX IF NOT EXISTS idx_plaid_accounts_account_id ON plaid_accounts(account_id);

  -- Add plaid_transaction_id to transactions if not exists
  -- (used to link Plaid transactions to our transactions table)
`);

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

export const userDb = {
  create: db.prepare<[string, string, string, string | null]>(
    "INSERT INTO users (id, email, password, name, verified) VALUES (?, ?, ?, ?, 1)"
  ),

  findByEmail: db.prepare<[string]>(
    "SELECT * FROM users WHERE email = ?"
  ),

  findById: db.prepare<[string]>(
    "SELECT * FROM users WHERE id = ?"
  ),

  updatePassword: db.prepare<[string, string]>(
    "UPDATE users SET password = ? WHERE id = ?"
  ),

  getAll: db.prepare(
    "SELECT id, email, name, created_at, verified FROM users ORDER BY created_at DESC"
  ),

  count: db.prepare("SELECT COUNT(*) as count FROM users"),
};

export const resetDb = {
  create: db.prepare<[string, string, string, string]>(
    "INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
  ),

  findByToken: db.prepare<[string]>(
    "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
  ),

  markUsed: db.prepare<[string]>(
    "UPDATE password_resets SET used = 1 WHERE token = ?"
  ),
};

// Budget snapshots interfaces and queries
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

export const budgetDb = {
  create: db.prepare<[string, string, string | null, string, string, string, string | null, number]>(
    `INSERT INTO budget_snapshots (id, user_id, name, fixed_expenses, frequency_data, selected_subscriptions, custom_sub_amounts, monthly_income)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ),

  findByUser: db.prepare<[string]>(
    "SELECT * FROM budget_snapshots WHERE user_id = ? ORDER BY created_at DESC"
  ),

  findLatest: db.prepare<[string]>(
    "SELECT * FROM budget_snapshots WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
  ),

  findById: db.prepare<[string, string]>(
    "SELECT * FROM budget_snapshots WHERE id = ? AND user_id = ?"
  ),

  update: db.prepare<[string, string, string, string | null, number, string, string]>(
    `UPDATE budget_snapshots SET
       fixed_expenses = ?, frequency_data = ?, selected_subscriptions = ?,
       custom_sub_amounts = ?, monthly_income = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`
  ),

  delete: db.prepare<[string, string]>(
    "DELETE FROM budget_snapshots WHERE id = ? AND user_id = ?"
  ),
};

// Transaction interfaces and queries
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

export const transactionDb = {
  create: db.prepare<[string, string, number, string | null, string | null, string, string | null, string, string, string | null, string | null, number | null]>(
    `INSERT INTO transactions (id, user_id, amount, merchant, description, category, subcategory, transaction_date, source, receipt_path, ocr_raw_text, confidence_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ),

  findByUser: db.prepare<[string, number, number]>(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT ? OFFSET ?"
  ),

  findByUserDateRange: db.prepare<[string, string, string]>(
    "SELECT * FROM transactions WHERE user_id = ? AND transaction_date BETWEEN ? AND ? ORDER BY transaction_date DESC"
  ),

  findById: db.prepare<[string, string]>(
    "SELECT * FROM transactions WHERE id = ? AND user_id = ?"
  ),

  update: db.prepare<[number, string | null, string | null, string, string | null, string, string, string]>(
    `UPDATE transactions SET
       amount = ?, merchant = ?, description = ?, category = ?, subcategory = ?,
       transaction_date = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`
  ),

  delete: db.prepare<[string, string]>(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?"
  ),

  sumByCategory: db.prepare<[string, string, string]>(
    `SELECT category, subcategory, SUM(amount) as total
     FROM transactions WHERE user_id = ? AND transaction_date BETWEEN ? AND ?
     GROUP BY category, subcategory`
  ),

  countByUser: db.prepare<[string]>(
    "SELECT COUNT(*) as count FROM transactions WHERE user_id = ?"
  ),

  getTopMerchants: db.prepare<[string, string, string, number]>(
    `SELECT merchant, SUM(amount) as total, COUNT(*) as count
     FROM transactions
     WHERE user_id = ? AND transaction_date BETWEEN ? AND ? AND merchant IS NOT NULL
     GROUP BY merchant
     ORDER BY total DESC
     LIMIT ?`
  ),
};

// Merchant category mapping for auto-categorization
export interface MerchantCategory {
  id: string;
  user_id: string | null;
  merchant_pattern: string;
  category: string;
  subcategory: string | null;
  created_at: string;
}

export const merchantDb = {
  findMatch: db.prepare<[string, string]>(
    `SELECT * FROM merchant_categories
     WHERE (user_id IS NULL OR user_id = ?)
     AND LOWER(?) LIKE '%' || LOWER(merchant_pattern) || '%'
     ORDER BY user_id DESC NULLS LAST LIMIT 1`
  ),

  create: db.prepare<[string, string | null, string, string, string | null]>(
    `INSERT OR REPLACE INTO merchant_categories (id, user_id, merchant_pattern, category, subcategory)
     VALUES (?, ?, ?, ?, ?)`
  ),

  findByUser: db.prepare<[string]>(
    "SELECT * FROM merchant_categories WHERE user_id = ? OR user_id IS NULL ORDER BY merchant_pattern"
  ),
};

// User preferences
export interface UserPreferences {
  user_id: string;
  weekly_email_enabled: number;
  weekly_email_day: number;
  budget_alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export const preferencesDb = {
  get: db.prepare<[string]>(
    "SELECT * FROM user_preferences WHERE user_id = ?"
  ),

  create: db.prepare<[string, number, number | null]>(
    `INSERT INTO user_preferences (user_id, weekly_email_enabled, budget_alert_threshold)
     VALUES (?, ?, ?)`
  ),

  update: db.prepare<[number, number | null, string]>(
    `UPDATE user_preferences SET
       weekly_email_enabled = ?,
       budget_alert_threshold = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ?`
  ),

  upsert: db.prepare<[string, number, number, number]>(
    `INSERT INTO user_preferences (user_id, weekly_email_enabled, weekly_email_day, budget_alert_threshold)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       weekly_email_enabled = excluded.weekly_email_enabled,
       weekly_email_day = excluded.weekly_email_day,
       budget_alert_threshold = excluded.budget_alert_threshold,
       updated_at = CURRENT_TIMESTAMP`
  ),

  getAllEnabled: db.prepare(
    "SELECT user_id FROM user_preferences WHERE weekly_email_enabled = 1"
  ),

  getUsersForWeeklyEmail: db.prepare<[number]>(
    `SELECT u.id, u.email, u.name, p.weekly_email_day
     FROM users u
     LEFT JOIN user_preferences p ON u.id = p.user_id
     WHERE p.weekly_email_enabled = 1 OR p.user_id IS NULL`
  ),
};

// User stats for gamification
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

export const statsDb = {
  get: db.prepare<[string]>(
    "SELECT * FROM user_stats WHERE user_id = ?"
  ),

  upsert: db.prepare<[string, number, number, number, number, string | null, number, string]>(
    `INSERT INTO user_stats (user_id, current_streak, longest_streak, total_transactions_logged, total_days_logged, last_log_date, weeks_under_budget, badges)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       current_streak = excluded.current_streak,
       longest_streak = excluded.longest_streak,
       total_transactions_logged = excluded.total_transactions_logged,
       total_days_logged = excluded.total_days_logged,
       last_log_date = excluded.last_log_date,
       weeks_under_budget = excluded.weeks_under_budget,
       badges = excluded.badges,
       updated_at = CURRENT_TIMESTAMP`
  ),

  incrementTransactions: db.prepare<[string]>(
    `UPDATE user_stats SET
       total_transactions_logged = total_transactions_logged + 1,
       updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ?`
  ),
};

// Daily activity tracking
export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  transactions_count: number;
  total_spent: number;
  created_at: string;
}

export const activityDb = {
  upsert: db.prepare<[string, string, string, number, number]>(
    `INSERT INTO daily_activity (id, user_id, activity_date, transactions_count, total_spent)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, activity_date) DO UPDATE SET
       transactions_count = transactions_count + excluded.transactions_count,
       total_spent = total_spent + excluded.total_spent`
  ),

  getByDateRange: db.prepare<[string, string, string]>(
    `SELECT * FROM daily_activity
     WHERE user_id = ? AND activity_date BETWEEN ? AND ?
     ORDER BY activity_date DESC`
  ),

  getStreakDays: db.prepare<[string, string]>(
    `SELECT activity_date FROM daily_activity
     WHERE user_id = ? AND activity_date <= ?
     ORDER BY activity_date DESC
     LIMIT 30`
  ),
};

// Weekly summary data query
export const summaryDb = {
  getWeeklySummary: db.prepare<[string, string, string]>(
    `SELECT
       COUNT(*) as transaction_count,
       SUM(amount) as total_spent,
       category,
       SUM(CASE WHEN category = 'needs' THEN amount ELSE 0 END) as needs_total,
       SUM(CASE WHEN category = 'wants' THEN amount ELSE 0 END) as wants_total,
       SUM(CASE WHEN category = 'savings' THEN amount ELSE 0 END) as savings_total
     FROM transactions
     WHERE user_id = ? AND transaction_date BETWEEN ? AND ?
     GROUP BY category`
  ),

  getTopMerchants: db.prepare<[string, string, string]>(
    `SELECT merchant, SUM(amount) as total, COUNT(*) as count
     FROM transactions
     WHERE user_id = ? AND transaction_date BETWEEN ? AND ? AND merchant IS NOT NULL
     GROUP BY merchant
     ORDER BY total DESC
     LIMIT 5`
  ),
};

// Plaid items (connected bank accounts)
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

export const plaidItemDb = {
  create: db.prepare<[string, string, string, string, string | null, string | null]>(
    `INSERT INTO plaid_items (id, user_id, access_token, item_id, institution_id, institution_name)
     VALUES (?, ?, ?, ?, ?, ?)`
  ),

  findByUser: db.prepare<[string]>(
    "SELECT * FROM plaid_items WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC"
  ),

  findByItemId: db.prepare<[string]>(
    "SELECT * FROM plaid_items WHERE item_id = ?"
  ),

  findById: db.prepare<[string, string]>(
    "SELECT * FROM plaid_items WHERE id = ? AND user_id = ?"
  ),

  updateCursor: db.prepare<[string, string]>(
    `UPDATE plaid_items SET cursor = ?, last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE item_id = ?`
  ),

  updateError: db.prepare<[string, string]>(
    `UPDATE plaid_items SET error_code = ?, status = 'error', updated_at = CURRENT_TIMESTAMP
     WHERE item_id = ?`
  ),

  clearError: db.prepare<[string]>(
    `UPDATE plaid_items SET error_code = NULL, status = 'active', updated_at = CURRENT_TIMESTAMP
     WHERE item_id = ?`
  ),

  delete: db.prepare<[string, string]>(
    "DELETE FROM plaid_items WHERE id = ? AND user_id = ?"
  ),

  deleteByItemId: db.prepare<[string]>(
    "DELETE FROM plaid_items WHERE item_id = ?"
  ),
};

export const plaidAccountDb = {
  upsert: db.prepare<[string, string, string, string | null, string | null, string | null, string | null, string | null, number | null, number | null, string]>(
    `INSERT INTO plaid_accounts (id, plaid_item_id, account_id, name, official_name, type, subtype, mask, current_balance, available_balance, iso_currency_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(account_id) DO UPDATE SET
       name = excluded.name,
       official_name = excluded.official_name,
       current_balance = excluded.current_balance,
       available_balance = excluded.available_balance,
       updated_at = CURRENT_TIMESTAMP`
  ),

  findByItem: db.prepare<[string]>(
    "SELECT * FROM plaid_accounts WHERE plaid_item_id = ?"
  ),

  findByAccountId: db.prepare<[string]>(
    "SELECT * FROM plaid_accounts WHERE account_id = ?"
  ),

  deleteByItem: db.prepare<[string]>(
    "DELETE FROM plaid_accounts WHERE plaid_item_id = ?"
  ),
};

export default db;
