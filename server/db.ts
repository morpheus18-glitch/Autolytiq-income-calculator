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

export default db;
