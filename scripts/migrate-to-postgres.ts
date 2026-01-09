import "dotenv/config";
import Database from "better-sqlite3";
import { Pool } from "pg";
import path from "path";

const sqliteDbPath = path.join(process.cwd(), "data", "app.db");
const sqlite = new Database(sqliteDbPath);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log("Starting migration from SQLite to PostgreSQL...\n");

  const client = await pool.connect();

  try {
    // Migrate users
    const users = sqlite.prepare("SELECT * FROM users").all() as any[];
    console.log(`Migrating ${users.length} users...`);
    for (const user of users) {
      try {
        await client.query(
          `INSERT INTO users (id, email, password, name, created_at, verified)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [user.id, user.email, user.password, user.name, user.created_at, user.verified]
        );
      } catch (err: any) {
        console.log(`  Skipping user ${user.email}: ${err.message}`);
      }
    }
    console.log("  Users migrated!\n");

    // Migrate budget_snapshots
    const budgets = sqlite.prepare("SELECT * FROM budget_snapshots").all() as any[];
    console.log(`Migrating ${budgets.length} budget snapshots...`);
    for (const b of budgets) {
      try {
        await client.query(
          `INSERT INTO budget_snapshots (id, user_id, name, fixed_expenses, frequency_data, selected_subscriptions, custom_sub_amounts, monthly_income, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [b.id, b.user_id, b.name, b.fixed_expenses, b.frequency_data, b.selected_subscriptions, b.custom_sub_amounts, b.monthly_income, b.created_at, b.updated_at]
        );
      } catch (err: any) {
        console.log(`  Skipping budget ${b.id}: ${err.message}`);
      }
    }
    console.log("  Budget snapshots migrated!\n");

    // Migrate transactions
    const transactions = sqlite.prepare("SELECT * FROM transactions").all() as any[];
    console.log(`Migrating ${transactions.length} transactions...`);
    for (const t of transactions) {
      try {
        await client.query(
          `INSERT INTO transactions (id, user_id, amount, merchant, description, category, subcategory, transaction_date, source, receipt_path, ocr_raw_text, confidence_score, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING`,
          [t.id, t.user_id, t.amount, t.merchant, t.description, t.category, t.subcategory, t.transaction_date, t.source, t.receipt_path, t.ocr_raw_text, t.confidence_score, t.created_at, t.updated_at]
        );
      } catch (err: any) {
        console.log(`  Skipping transaction ${t.id}: ${err.message}`);
      }
    }
    console.log("  Transactions migrated!\n");

    // Migrate user_preferences
    const prefs = sqlite.prepare("SELECT * FROM user_preferences").all() as any[];
    console.log(`Migrating ${prefs.length} user preferences...`);
    for (const p of prefs) {
      try {
        await client.query(
          `INSERT INTO user_preferences (user_id, weekly_email_enabled, weekly_email_day, budget_alert_threshold, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id) DO NOTHING`,
          [p.user_id, p.weekly_email_enabled, p.weekly_email_day, p.budget_alert_threshold, p.created_at, p.updated_at]
        );
      } catch (err: any) {
        console.log(`  Skipping prefs for ${p.user_id}: ${err.message}`);
      }
    }
    console.log("  User preferences migrated!\n");

    // Migrate user_stats
    const stats = sqlite.prepare("SELECT * FROM user_stats").all() as any[];
    console.log(`Migrating ${stats.length} user stats...`);
    for (const s of stats) {
      try {
        await client.query(
          `INSERT INTO user_stats (user_id, current_streak, longest_streak, total_transactions_logged, total_days_logged, last_log_date, weeks_under_budget, badges, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (user_id) DO NOTHING`,
          [s.user_id, s.current_streak, s.longest_streak, s.total_transactions_logged, s.total_days_logged, s.last_log_date, s.weeks_under_budget, s.badges, s.created_at, s.updated_at]
        );
      } catch (err: any) {
        console.log(`  Skipping stats for ${s.user_id}: ${err.message}`);
      }
    }
    console.log("  User stats migrated!\n");

    // Migrate daily_activity
    const activities = sqlite.prepare("SELECT * FROM daily_activity").all() as any[];
    console.log(`Migrating ${activities.length} daily activities...`);
    for (const a of activities) {
      try {
        await client.query(
          `INSERT INTO daily_activity (id, user_id, activity_date, transactions_count, total_spent, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.user_id, a.activity_date, a.transactions_count, a.total_spent, a.created_at]
        );
      } catch (err: any) {
        console.log(`  Skipping activity ${a.id}: ${err.message}`);
      }
    }
    console.log("  Daily activities migrated!\n");

    // Migrate merchant_categories
    const merchants = sqlite.prepare("SELECT * FROM merchant_categories").all() as any[];
    console.log(`Migrating ${merchants.length} merchant categories...`);
    for (const m of merchants) {
      try {
        await client.query(
          `INSERT INTO merchant_categories (id, user_id, merchant_pattern, category, subcategory, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [m.id, m.user_id, m.merchant_pattern, m.category, m.subcategory, m.created_at]
        );
      } catch (err: any) {
        console.log(`  Skipping merchant ${m.id}: ${err.message}`);
      }
    }
    console.log("  Merchant categories migrated!\n");

    // Migrate plaid_items
    const plaidItems = sqlite.prepare("SELECT * FROM plaid_items").all() as any[];
    console.log(`Migrating ${plaidItems.length} Plaid items...`);
    for (const p of plaidItems) {
      try {
        await client.query(
          `INSERT INTO plaid_items (id, user_id, access_token, item_id, institution_id, institution_name, cursor, last_synced_at, error_code, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.user_id, p.access_token, p.item_id, p.institution_id, p.institution_name, p.cursor, p.last_synced_at, p.error_code, p.status, p.created_at, p.updated_at]
        );
      } catch (err: any) {
        console.log(`  Skipping plaid item ${p.id}: ${err.message}`);
      }
    }
    console.log("  Plaid items migrated!\n");

    // Migrate plaid_accounts
    const plaidAccounts = sqlite.prepare("SELECT * FROM plaid_accounts").all() as any[];
    console.log(`Migrating ${plaidAccounts.length} Plaid accounts...`);
    for (const a of plaidAccounts) {
      try {
        await client.query(
          `INSERT INTO plaid_accounts (id, plaid_item_id, account_id, name, official_name, type, subtype, mask, current_balance, available_balance, iso_currency_code, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.plaid_item_id, a.account_id, a.name, a.official_name, a.type, a.subtype, a.mask, a.current_balance, a.available_balance, a.iso_currency_code, a.created_at, a.updated_at]
        );
      } catch (err: any) {
        console.log(`  Skipping plaid account ${a.id}: ${err.message}`);
      }
    }
    console.log("  Plaid accounts migrated!\n");

    console.log("Migration completed successfully!");

  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }
}

migrate().catch(console.error);
