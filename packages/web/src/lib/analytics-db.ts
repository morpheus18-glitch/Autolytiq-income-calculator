/**
 * DuckDB Analytics Engine
 *
 * Provides local analytics capabilities for:
 * - Scenario grid calculations (APR/term/down payment matrices)
 * - Historical trend analysis
 * - What-if scenario comparisons
 *
 * All data stays in the browser - no server communication needed.
 */

import * as duckdb from "@duckdb/duckdb-wasm";

// DuckDB instance
let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;
let initPromise: Promise<duckdb.AsyncDuckDB> | null = null;

/**
 * Initialize DuckDB-WASM
 */
export async function initAnalyticsDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Get the bundles from jsdelivr
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

      // Select a bundle based on browser capabilities
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: "text/javascript",
        })
      );

      // Instantiate the async worker
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

      URL.revokeObjectURL(worker_url);

      // Create a connection
      conn = await db.connect();

      console.log("[AnalyticsDB] DuckDB initialized");
      return db;
    } catch (error) {
      console.error("[AnalyticsDB] Failed to initialize DuckDB:", error);
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Get the database connection
 */
async function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  if (!conn) {
    await initAnalyticsDB();
  }
  return conn!;
}

// =============================================================================
// Scenario Grid Calculations
// =============================================================================

export interface LoanScenarioGrid {
  scenarios: LoanScenario[];
  summary: {
    minPayment: number;
    maxPayment: number;
    minTotalCost: number;
    maxTotalCost: number;
    optimalScenario: LoanScenario;
  };
}

export interface LoanScenario {
  apr: number;
  termMonths: number;
  downPaymentPercent: number;
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
}

/**
 * Generate a grid of auto loan scenarios
 */
export async function generateAutoLoanGrid(
  vehiclePrice: number,
  aprRange: { min: number; max: number; step: number },
  termRange: { min: number; max: number; step: number },
  downPaymentRange: { min: number; max: number; step: number }
): Promise<LoanScenarioGrid> {
  const connection = await getConnection();

  // Generate the scenarios using SQL
  await connection.query(`
    CREATE OR REPLACE TABLE auto_scenarios AS
    WITH
      aprs AS (
        SELECT generate_series::DOUBLE / 100 AS apr
        FROM generate_series(
          ${Math.round(aprRange.min * 100)},
          ${Math.round(aprRange.max * 100)},
          ${Math.round(aprRange.step * 100)}
        )
      ),
      terms AS (
        SELECT generate_series AS term_months
        FROM generate_series(
          ${termRange.min},
          ${termRange.max},
          ${termRange.step}
        )
      ),
      down_payments AS (
        SELECT generate_series::DOUBLE / 100 AS down_percent
        FROM generate_series(
          ${Math.round(downPaymentRange.min * 100)},
          ${Math.round(downPaymentRange.max * 100)},
          ${Math.round(downPaymentRange.step * 100)}
        )
      ),
      grid AS (
        SELECT
          a.apr,
          t.term_months,
          d.down_percent,
          ${vehiclePrice}::DOUBLE AS vehicle_price
        FROM aprs a
        CROSS JOIN terms t
        CROSS JOIN down_payments d
      )
    SELECT
      apr,
      term_months,
      down_percent * 100 AS down_payment_percent,
      vehicle_price * (1 - down_percent) AS loan_amount,
      -- Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
      CASE
        WHEN apr = 0 THEN (vehicle_price * (1 - down_percent)) / term_months
        ELSE (vehicle_price * (1 - down_percent)) *
             ((apr/12) * POWER(1 + apr/12, term_months)) /
             (POWER(1 + apr/12, term_months) - 1)
      END AS monthly_payment,
      CASE
        WHEN apr = 0 THEN 0
        ELSE (
          (vehicle_price * (1 - down_percent)) *
          ((apr/12) * POWER(1 + apr/12, term_months)) /
          (POWER(1 + apr/12, term_months) - 1)
        ) * term_months - (vehicle_price * (1 - down_percent))
      END AS total_interest
    FROM grid
  `);

  // Fetch results
  const result = await connection.query(`
    SELECT
      apr,
      term_months,
      down_payment_percent,
      ROUND(loan_amount, 2) as loan_amount,
      ROUND(monthly_payment, 2) as monthly_payment,
      ROUND(total_interest, 2) as total_interest,
      ROUND(loan_amount + total_interest, 2) as total_cost
    FROM auto_scenarios
    ORDER BY apr, term_months, down_payment_percent
  `);

  const scenarios: LoanScenario[] = result.toArray().map((row: Record<string, unknown>) => ({
    apr: row.apr as number,
    termMonths: row.term_months as number,
    downPaymentPercent: row.down_payment_percent as number,
    loanAmount: row.loan_amount as number,
    monthlyPayment: row.monthly_payment as number,
    totalInterest: row.total_interest as number,
    totalCost: row.total_cost as number,
  }));

  // Calculate summary
  const summary = await connection.query(`
    SELECT
      MIN(monthly_payment) as min_payment,
      MAX(monthly_payment) as max_payment,
      MIN(loan_amount + total_interest) as min_total_cost,
      MAX(loan_amount + total_interest) as max_total_cost
    FROM auto_scenarios
  `);

  const summaryRow = summary.toArray()[0] as Record<string, number>;

  // Find optimal scenario (lowest total cost with reasonable monthly payment)
  const optimalResult = await connection.query(`
    SELECT * FROM auto_scenarios
    ORDER BY (loan_amount + total_interest) ASC
    LIMIT 1
  `);

  const optimalRow = optimalResult.toArray()[0] as Record<string, unknown>;
  const optimalScenario: LoanScenario = {
    apr: optimalRow.apr as number,
    termMonths: optimalRow.term_months as number,
    downPaymentPercent: optimalRow.down_payment_percent as number,
    loanAmount: optimalRow.loan_amount as number,
    monthlyPayment: optimalRow.monthly_payment as number,
    totalInterest: optimalRow.total_interest as number,
    totalCost: (optimalRow.loan_amount as number) + (optimalRow.total_interest as number),
  };

  return {
    scenarios,
    summary: {
      minPayment: summaryRow.min_payment,
      maxPayment: summaryRow.max_payment,
      minTotalCost: summaryRow.min_total_cost,
      maxTotalCost: summaryRow.max_total_cost,
      optimalScenario,
    },
  };
}

// =============================================================================
// Mortgage Scenario Analysis
// =============================================================================

export interface MortgageScenario {
  homePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  downPaymentAmount: number;
  loanAmount: number;
}

export interface MortgageScenarioGrid {
  scenarios: MortgageScenario[];
  summary: {
    minPayment: number;
    maxPayment: number;
    savings15vs30: number;
    breakEvenPoint: string;
  };
}

/**
 * Generate mortgage comparison scenarios
 */
export async function generateMortgageGrid(
  homePrice: number,
  downPaymentOptions: number[],
  rateOptions: number[],
  termOptions: number[]
): Promise<MortgageScenarioGrid> {
  const connection = await getConnection();

  // Create parameter tables
  await connection.query(`
    CREATE OR REPLACE TABLE price_table AS SELECT ${homePrice}::DOUBLE AS home_price
  `);

  await connection.query(`
    CREATE OR REPLACE TABLE down_options AS
    SELECT unnest([${downPaymentOptions.join(",")}])::DOUBLE / 100 AS down_percent
  `);

  await connection.query(`
    CREATE OR REPLACE TABLE rate_options AS
    SELECT unnest([${rateOptions.join(",")}])::DOUBLE / 100 AS rate
  `);

  await connection.query(`
    CREATE OR REPLACE TABLE term_options AS
    SELECT unnest([${termOptions.join(",")}]) AS term_years
  `);

  // Generate grid
  await connection.query(`
    CREATE OR REPLACE TABLE mortgage_scenarios AS
    SELECT
      p.home_price,
      d.down_percent * 100 AS down_payment_percent,
      r.rate * 100 AS interest_rate,
      t.term_years,
      p.home_price * d.down_percent AS down_payment_amount,
      p.home_price * (1 - d.down_percent) AS loan_amount,
      t.term_years * 12 AS term_months,
      -- Monthly payment calculation
      CASE
        WHEN r.rate = 0 THEN (p.home_price * (1 - d.down_percent)) / (t.term_years * 12)
        ELSE (p.home_price * (1 - d.down_percent)) *
             ((r.rate/12) * POWER(1 + r.rate/12, t.term_years * 12)) /
             (POWER(1 + r.rate/12, t.term_years * 12) - 1)
      END AS monthly_payment
    FROM price_table p
    CROSS JOIN down_options d
    CROSS JOIN rate_options r
    CROSS JOIN term_options t
  `);

  // Add calculated fields
  await connection.query(`
    CREATE OR REPLACE TABLE mortgage_scenarios AS
    SELECT
      *,
      monthly_payment * term_months AS total_cost,
      (monthly_payment * term_months) - loan_amount AS total_interest
    FROM mortgage_scenarios
  `);

  // Fetch results
  const result = await connection.query(`
    SELECT
      home_price,
      down_payment_percent,
      interest_rate,
      term_years,
      ROUND(down_payment_amount, 2) as down_payment_amount,
      ROUND(loan_amount, 2) as loan_amount,
      ROUND(monthly_payment, 2) as monthly_payment,
      ROUND(total_interest, 2) as total_interest,
      ROUND(total_cost, 2) as total_cost
    FROM mortgage_scenarios
    ORDER BY down_payment_percent, interest_rate, term_years
  `);

  const scenarios: MortgageScenario[] = result.toArray().map((row: Record<string, unknown>) => ({
    homePrice: row.home_price as number,
    downPaymentPercent: row.down_payment_percent as number,
    interestRate: row.interest_rate as number,
    termYears: row.term_years as number,
    downPaymentAmount: row.down_payment_amount as number,
    loanAmount: row.loan_amount as number,
    monthlyPayment: row.monthly_payment as number,
    totalInterest: row.total_interest as number,
    totalCost: row.total_cost as number,
  }));

  // Calculate summary
  const summaryResult = await connection.query(`
    SELECT
      MIN(monthly_payment) as min_payment,
      MAX(monthly_payment) as max_payment
    FROM mortgage_scenarios
  `);

  const summaryRow = summaryResult.toArray()[0] as Record<string, number>;

  // Calculate 15 vs 30 year savings
  const savingsResult = await connection.query(`
    SELECT
      (SELECT total_interest FROM mortgage_scenarios WHERE term_years = 30 AND down_payment_percent = 20 LIMIT 1) -
      (SELECT total_interest FROM mortgage_scenarios WHERE term_years = 15 AND down_payment_percent = 20 LIMIT 1)
      AS savings_15_vs_30
  `);

  const savingsRow = savingsResult.toArray()[0] as Record<string, number>;

  return {
    scenarios,
    summary: {
      minPayment: summaryRow.min_payment,
      maxPayment: summaryRow.max_payment,
      savings15vs30: savingsRow.savings_15_vs_30 || 0,
      breakEvenPoint: "5-7 years", // Simplified
    },
  };
}

// =============================================================================
// Budget Analytics
// =============================================================================

export interface SpendingAnalysis {
  totalSpent: number;
  averageDaily: number;
  topCategories: { category: string; amount: number; percent: number }[];
  trend: { period: string; amount: number }[];
}

/**
 * Analyze spending patterns from transaction data
 */
export async function analyzeSpending(
  transactions: Array<{ category: string; amount: number; date: string; type: string }>
): Promise<SpendingAnalysis> {
  const connection = await getConnection();

  // Load transactions into DuckDB
  await connection.query(`
    CREATE OR REPLACE TABLE transactions AS
    SELECT * FROM (
      VALUES ${transactions.map((t) => `('${t.category}', ${t.amount}, '${t.date}', '${t.type}')`).join(",") || "('', 0, '', '')"}
    ) AS t(category, amount, date, type)
    WHERE type = 'expense'
  `);

  // Calculate totals
  const totalsResult = await connection.query(`
    SELECT
      SUM(amount) as total_spent,
      COUNT(DISTINCT date) as days,
      SUM(amount) / NULLIF(COUNT(DISTINCT date), 0) as avg_daily
    FROM transactions
  `);

  const totals = totalsResult.toArray()[0] as Record<string, number>;

  // Top categories
  const categoriesResult = await connection.query(`
    SELECT
      category,
      SUM(amount) as amount,
      SUM(amount) * 100.0 / NULLIF(SUM(SUM(amount)) OVER (), 0) as percent
    FROM transactions
    WHERE category != ''
    GROUP BY category
    ORDER BY amount DESC
    LIMIT 10
  `);

  const topCategories = categoriesResult.toArray().map((row: Record<string, unknown>) => ({
    category: row.category as string,
    amount: row.amount as number,
    percent: row.percent as number,
  }));

  // Weekly trend
  const trendResult = await connection.query(`
    SELECT
      date_trunc('week', date::DATE)::TEXT as period,
      SUM(amount) as amount
    FROM transactions
    WHERE date != ''
    GROUP BY date_trunc('week', date::DATE)
    ORDER BY period
    LIMIT 12
  `);

  const trend = trendResult.toArray().map((row: Record<string, unknown>) => ({
    period: row.period as string,
    amount: row.amount as number,
  }));

  return {
    totalSpent: totals.total_spent || 0,
    averageDaily: totals.avg_daily || 0,
    topCategories,
    trend,
  };
}

// =============================================================================
// Income Volatility Analysis
// =============================================================================

export interface VolatilityAnalysis {
  meanIncome: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  minIncome: number;
  maxIncome: number;
  trend: "increasing" | "stable" | "decreasing";
  projectedAnnual: { low: number; expected: number; high: number };
}

/**
 * Analyze income volatility from historical data
 */
export async function analyzeIncomeVolatility(
  incomeHistory: Array<{ period: string; amount: number }>
): Promise<VolatilityAnalysis> {
  const connection = await getConnection();

  if (incomeHistory.length === 0) {
    return {
      meanIncome: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      minIncome: 0,
      maxIncome: 0,
      trend: "stable",
      projectedAnnual: { low: 0, expected: 0, high: 0 },
    };
  }

  await connection.query(`
    CREATE OR REPLACE TABLE income_history AS
    SELECT * FROM (
      VALUES ${incomeHistory.map((i) => `('${i.period}', ${i.amount})`).join(",")}
    ) AS t(period, amount)
  `);

  const statsResult = await connection.query(`
    SELECT
      AVG(amount) as mean_income,
      STDDEV(amount) as std_dev,
      STDDEV(amount) / NULLIF(AVG(amount), 0) * 100 as cv,
      MIN(amount) as min_income,
      MAX(amount) as max_income,
      REGR_SLOPE(amount, ROW_NUMBER() OVER (ORDER BY period)) as trend_slope
    FROM income_history
  `);

  const stats = statsResult.toArray()[0] as Record<string, number>;

  const meanIncome = stats.mean_income || 0;
  const stdDev = stats.std_dev || 0;

  // Determine trend
  let trend: "increasing" | "stable" | "decreasing" = "stable";
  if (stats.trend_slope > meanIncome * 0.01) {
    trend = "increasing";
  } else if (stats.trend_slope < -meanIncome * 0.01) {
    trend = "decreasing";
  }

  // Project annual income (assuming monthly data)
  const monthlyMean = meanIncome;
  const annualExpected = monthlyMean * 12;
  const annualStdDev = stdDev * Math.sqrt(12);

  return {
    meanIncome: Math.round(meanIncome),
    standardDeviation: Math.round(stdDev),
    coefficientOfVariation: Math.round(stats.cv * 10) / 10,
    minIncome: Math.round(stats.min_income || 0),
    maxIncome: Math.round(stats.max_income || 0),
    trend,
    projectedAnnual: {
      low: Math.round(annualExpected - 1.96 * annualStdDev),
      expected: Math.round(annualExpected),
      high: Math.round(annualExpected + 1.96 * annualStdDev),
    },
  };
}

/**
 * Close the database connection
 */
export async function closeAnalyticsDB(): Promise<void> {
  if (conn) {
    await conn.close();
    conn = null;
  }
  if (db) {
    await db.terminate();
    db = null;
  }
  initPromise = null;
}

/**
 * Check if DuckDB is available
 */
export function isAnalyticsAvailable(): boolean {
  return db !== null;
}
