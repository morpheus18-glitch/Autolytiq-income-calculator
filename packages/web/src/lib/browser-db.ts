/**
 * Browser SQLite Database (sql.js + OPFS)
 *
 * Provides persistent storage for:
 * - Calculation history
 * - Scenario snapshots
 * - Budget tracking
 *
 * Uses OPFS (Origin Private File System) for persistence with
 * localStorage fallback for browsers that don't support it.
 */

import initSqlJs, { Database, SqlJsStatic } from "sql.js";

// Database schema version for migrations
const SCHEMA_VERSION = 1;

// Types for stored data
export interface CalculationRecord {
  id: number;
  type: "income" | "auto" | "housing" | "budget";
  input_json: string;
  output_json: string;
  created_at: string;
  notes?: string;
}

export interface ScenarioRecord {
  id: number;
  name: string;
  type: "income" | "auto" | "housing" | "budget";
  input_json: string;
  output_json: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

export interface BudgetTransaction {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  created_at: string;
}

// Database singleton
let db: Database | null = null;
let SQL: SqlJsStatic | null = null;
let initPromise: Promise<Database> | null = null;

// OPFS support detection
const supportsOPFS = (): boolean => {
  return typeof navigator !== "undefined" && "storage" in navigator;
};

/**
 * Initialize sql.js and create/open the database
 */
export async function initDatabase(): Promise<Database> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Initialize SQL.js with WASM
      SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      // Try to load existing database from storage
      const existingData = await loadDatabaseFromStorage();

      if (existingData) {
        db = new SQL.Database(existingData);
      } else {
        db = new SQL.Database();
        await createSchema(db);
      }

      // Check and run migrations
      await runMigrations(db);

      // Set up auto-save on changes
      setupAutoSave(db);

      console.log("[BrowserDB] Database initialized");
      return db;
    } catch (error) {
      console.error("[BrowserDB] Failed to initialize database:", error);
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Create the initial database schema
 */
async function createSchema(database: Database): Promise<void> {
  database.run(`
    -- Schema version tracking
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );
    INSERT OR REPLACE INTO schema_version (version) VALUES (${SCHEMA_VERSION});

    -- Calculation history
    CREATE TABLE IF NOT EXISTS calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income', 'auto', 'housing', 'budget')),
      input_json TEXT NOT NULL,
      output_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_calculations_type ON calculations(type);
    CREATE INDEX IF NOT EXISTS idx_calculations_created ON calculations(created_at);

    -- Saved scenarios
    CREATE TABLE IF NOT EXISTS scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'auto', 'housing', 'budget')),
      input_json TEXT NOT NULL,
      output_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_favorite INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_scenarios_type ON scenarios(type);
    CREATE INDEX IF NOT EXISTS idx_scenarios_favorite ON scenarios(is_favorite);

    -- Budget transactions
    CREATE TABLE IF NOT EXISTS budget_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON budget_transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON budget_transactions(category);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON budget_transactions(type);

    -- Budget history (monthly snapshots)
    CREATE TABLE IF NOT EXISTS budget_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      income_total REAL NOT NULL,
      expense_total REAL NOT NULL,
      savings_total REAL NOT NULL,
      category_breakdown TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(year, month)
    );
  `);
}

/**
 * Run any pending migrations
 */
async function runMigrations(database: Database): Promise<void> {
  const result = database.exec("SELECT version FROM schema_version LIMIT 1");
  const currentVersion = result.length > 0 ? result[0].values[0][0] as number : 0;

  if (currentVersion < SCHEMA_VERSION) {
    console.log(`[BrowserDB] Migrating from version ${currentVersion} to ${SCHEMA_VERSION}`);
    // Add migration logic here as needed
    database.run(`UPDATE schema_version SET version = ${SCHEMA_VERSION}`);
  }
}

/**
 * Load database from OPFS or localStorage
 */
async function loadDatabaseFromStorage(): Promise<Uint8Array | null> {
  try {
    if (supportsOPFS()) {
      const root = await navigator.storage.getDirectory();
      try {
        const fileHandle = await root.getFileHandle("autolytiq.db");
        const file = await fileHandle.getFile();
        const buffer = await file.arrayBuffer();
        return new Uint8Array(buffer);
      } catch {
        // File doesn't exist yet
        return null;
      }
    } else {
      // Fallback to localStorage (limited to ~5MB)
      const stored = localStorage.getItem("autolytiq_db");
      if (stored) {
        const binary = atob(stored);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      }
    }
  } catch (error) {
    console.warn("[BrowserDB] Failed to load from storage:", error);
  }
  return null;
}

/**
 * Save database to OPFS or localStorage
 */
async function saveDatabaseToStorage(database: Database): Promise<void> {
  try {
    const data = database.export();

    if (supportsOPFS()) {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle("autolytiq.db", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    } else {
      // Fallback to localStorage
      const binary = String.fromCharCode(...data);
      localStorage.setItem("autolytiq_db", btoa(binary));
    }
  } catch (error) {
    console.error("[BrowserDB] Failed to save to storage:", error);
  }
}

/**
 * Set up auto-save with debouncing
 */
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
function setupAutoSave(database: Database): void {
  // Save on page unload
  window.addEventListener("beforeunload", () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveDatabaseToStorage(database);
  });
}

function triggerSave(): void {
  if (!db) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (db) saveDatabaseToStorage(db);
  }, 1000); // Debounce saves by 1 second
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Save a calculation to history
 */
export async function saveCalculation(
  type: CalculationRecord["type"],
  input: object,
  output: object,
  notes?: string
): Promise<number> {
  const database = await initDatabase();

  database.run(
    `INSERT INTO calculations (type, input_json, output_json, notes)
     VALUES (?, ?, ?, ?)`,
    [type, JSON.stringify(input), JSON.stringify(output), notes || null]
  );

  triggerSave();

  const result = database.exec("SELECT last_insert_rowid()");
  return result[0].values[0][0] as number;
}

/**
 * Get calculation history
 */
export async function getCalculationHistory(
  type?: CalculationRecord["type"],
  limit: number = 50
): Promise<CalculationRecord[]> {
  const database = await initDatabase();

  const query = type
    ? "SELECT * FROM calculations WHERE type = ? ORDER BY created_at DESC LIMIT ?"
    : "SELECT * FROM calculations ORDER BY created_at DESC LIMIT ?";

  const params = type ? [type, limit] : [limit];
  const result = database.exec(query, params);

  if (result.length === 0) return [];

  const columns = result[0].columns;
  return result[0].values.map((row) => {
    const record: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      record[col] = row[i];
    });
    return record as unknown as CalculationRecord;
  });
}

/**
 * Save a scenario
 */
export async function saveScenario(
  name: string,
  type: ScenarioRecord["type"],
  input: object,
  output: object,
  isFavorite: boolean = false
): Promise<number> {
  const database = await initDatabase();

  database.run(
    `INSERT INTO scenarios (name, type, input_json, output_json, is_favorite)
     VALUES (?, ?, ?, ?, ?)`,
    [name, type, JSON.stringify(input), JSON.stringify(output), isFavorite ? 1 : 0]
  );

  triggerSave();

  const result = database.exec("SELECT last_insert_rowid()");
  return result[0].values[0][0] as number;
}

/**
 * Get saved scenarios
 */
export async function getScenarios(
  type?: ScenarioRecord["type"],
  favoritesOnly: boolean = false
): Promise<ScenarioRecord[]> {
  const database = await initDatabase();

  let query = "SELECT * FROM scenarios";
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (type) {
    conditions.push("type = ?");
    params.push(type);
  }
  if (favoritesOnly) {
    conditions.push("is_favorite = 1");
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY updated_at DESC";

  const result = database.exec(query, params);

  if (result.length === 0) return [];

  const columns = result[0].columns;
  return result[0].values.map((row) => {
    const record: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      record[col] = row[i];
      if (col === "is_favorite") {
        record[col] = row[i] === 1;
      }
    });
    return record as unknown as ScenarioRecord;
  });
}

/**
 * Update a scenario
 */
export async function updateScenario(
  id: number,
  updates: Partial<Pick<ScenarioRecord, "name" | "input_json" | "output_json" | "is_favorite">>
): Promise<void> {
  const database = await initDatabase();

  const setClause: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) {
    setClause.push("name = ?");
    params.push(updates.name);
  }
  if (updates.input_json !== undefined) {
    setClause.push("input_json = ?");
    params.push(updates.input_json);
  }
  if (updates.output_json !== undefined) {
    setClause.push("output_json = ?");
    params.push(updates.output_json);
  }
  if (updates.is_favorite !== undefined) {
    setClause.push("is_favorite = ?");
    params.push(updates.is_favorite ? 1 : 0);
  }

  if (setClause.length === 0) return;

  setClause.push("updated_at = datetime('now')");
  params.push(id);

  database.run(
    `UPDATE scenarios SET ${setClause.join(", ")} WHERE id = ?`,
    params
  );

  triggerSave();
}

/**
 * Delete a scenario
 */
export async function deleteScenario(id: number): Promise<void> {
  const database = await initDatabase();
  database.run("DELETE FROM scenarios WHERE id = ?", [id]);
  triggerSave();
}

/**
 * Add a budget transaction
 */
export async function addTransaction(
  category: string,
  amount: number,
  description: string,
  date: string,
  type: "income" | "expense"
): Promise<number> {
  const database = await initDatabase();

  database.run(
    `INSERT INTO budget_transactions (category, amount, description, date, type)
     VALUES (?, ?, ?, ?, ?)`,
    [category, amount, description, date, type]
  );

  triggerSave();

  const result = database.exec("SELECT last_insert_rowid()");
  return result[0].values[0][0] as number;
}

/**
 * Get transactions for a date range
 */
export async function getTransactions(
  startDate: string,
  endDate: string,
  category?: string
): Promise<BudgetTransaction[]> {
  const database = await initDatabase();

  let query = "SELECT * FROM budget_transactions WHERE date BETWEEN ? AND ?";
  const params: unknown[] = [startDate, endDate];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  query += " ORDER BY date DESC";

  const result = database.exec(query, params);

  if (result.length === 0) return [];

  const columns = result[0].columns;
  return result[0].values.map((row) => {
    const record: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      record[col] = row[i];
    });
    return record as unknown as BudgetTransaction;
  });
}

/**
 * Get spending summary by category for a date range
 */
export async function getSpendingByCategory(
  startDate: string,
  endDate: string
): Promise<{ category: string; total: number }[]> {
  const database = await initDatabase();

  const result = database.exec(
    `SELECT category, SUM(amount) as total
     FROM budget_transactions
     WHERE date BETWEEN ? AND ? AND type = 'expense'
     GROUP BY category
     ORDER BY total DESC`,
    [startDate, endDate]
  );

  if (result.length === 0) return [];

  return result[0].values.map((row) => ({
    category: row[0] as string,
    total: row[1] as number,
  }));
}

/**
 * Save monthly budget snapshot
 */
export async function saveBudgetSnapshot(
  year: number,
  month: number,
  incomeTotal: number,
  expenseTotal: number,
  savingsTotal: number,
  categoryBreakdown: object
): Promise<void> {
  const database = await initDatabase();

  database.run(
    `INSERT OR REPLACE INTO budget_history
     (year, month, income_total, expense_total, savings_total, category_breakdown)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [year, month, incomeTotal, expenseTotal, savingsTotal, JSON.stringify(categoryBreakdown)]
  );

  triggerSave();
}

/**
 * Get budget history for a year
 */
export async function getBudgetHistory(
  year: number
): Promise<{ month: number; income: number; expense: number; savings: number }[]> {
  const database = await initDatabase();

  const result = database.exec(
    `SELECT month, income_total, expense_total, savings_total
     FROM budget_history
     WHERE year = ?
     ORDER BY month`,
    [year]
  );

  if (result.length === 0) return [];

  return result[0].values.map((row) => ({
    month: row[0] as number,
    income: row[1] as number,
    expense: row[2] as number,
    savings: row[3] as number,
  }));
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const database = await initDatabase();
  database.run("DELETE FROM calculations");
  database.run("DELETE FROM scenarios");
  database.run("DELETE FROM budget_transactions");
  database.run("DELETE FROM budget_history");
  triggerSave();
}

/**
 * Export database as Uint8Array
 */
export async function exportDatabase(): Promise<Uint8Array> {
  const database = await initDatabase();
  return database.export();
}

/**
 * Import database from Uint8Array
 */
export async function importDatabase(data: Uint8Array): Promise<void> {
  if (!SQL) {
    await initDatabase();
  }
  if (SQL) {
    db = new SQL.Database(data);
    await saveDatabaseToStorage(db);
  }
}

/**
 * Get database stats
 */
export async function getDatabaseStats(): Promise<{
  calculationCount: number;
  scenarioCount: number;
  transactionCount: number;
  sizeBytes: number;
}> {
  const database = await initDatabase();

  const calcResult = database.exec("SELECT COUNT(*) FROM calculations");
  const scenarioResult = database.exec("SELECT COUNT(*) FROM scenarios");
  const txResult = database.exec("SELECT COUNT(*) FROM budget_transactions");

  const exported = database.export();

  return {
    calculationCount: calcResult[0]?.values[0][0] as number || 0,
    scenarioCount: scenarioResult[0]?.values[0][0] as number || 0,
    transactionCount: txResult[0]?.values[0][0] as number || 0,
    sizeBytes: exported.length,
  };
}
