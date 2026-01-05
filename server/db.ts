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
    "INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)"
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

export default db;
