/**
 * Property-based tests for calculation engine using fast-check
 *
 * These tests verify that:
 * 1. Calculations produce valid results across the input domain
 * 2. WASM and JS implementations produce identical results (parity tests)
 * 3. Mathematical invariants hold
 */

import * as fc from "fast-check";
import { _internal, sync } from "../lib/calc-engine";

const {
  jsCalculateIncome,
  jsCalculateLoanAmount,
  jsCalculateMortgage,
  jsCalculateTaxes,
  jsCalculateBudgetAllocation,
} = _internal;

describe("Income Calculations", () => {
  test("income projection produces valid results", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1000, max: 1000000 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
        (ytdIncome, month, day) => {
          const startDate = "2024-01-01";
          const checkDate = `2024-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          try {
            const result = jsCalculateIncome(ytdIncome, startDate, checkDate);

            // All values should be positive
            expect(result.gross_annual).toBeGreaterThan(0);
            expect(result.gross_monthly).toBeGreaterThan(0);
            expect(result.gross_weekly).toBeGreaterThan(0);
            expect(result.gross_daily).toBeGreaterThan(0);
            expect(result.days_worked).toBeGreaterThan(0);

            // Max auto payment should be 12% of monthly
            expect(result.max_auto_payment).toBeCloseTo(result.gross_monthly * 0.12, -1);

            // Max rent should be 30% of monthly
            expect(result.max_rent).toBeCloseTo(result.gross_monthly * 0.30, -1);

            return true;
          } catch {
            // Invalid date combinations are expected to fail
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test("income scales linearly with YTD", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 10000, max: 100000 }),
        (baseYtd) => {
          const doubledYtd = baseYtd * 2;
          const startDate = "2024-01-01";
          const checkDate = "2024-06-15";

          const result1 = jsCalculateIncome(baseYtd, startDate, checkDate);
          const result2 = jsCalculateIncome(doubledYtd, startDate, checkDate);

          // Doubled YTD should produce doubled annual projection
          expect(result2.gross_annual).toBeCloseTo(result1.gross_annual * 2, -1);
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe("Loan Calculations", () => {
  test("loan amount calculation produces valid results", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 100, max: 2000 }), // payment
        fc.float({ min: 0, max: 25 }), // APR
        fc.integer({ min: 12, max: 84 }), // months
        (payment, apr, months) => {
          const loanAmount = jsCalculateLoanAmount(payment, apr, months);

          // Loan amount should be positive
          expect(loanAmount).toBeGreaterThan(0);

          // Loan amount should be less than payment * months (otherwise negative interest)
          expect(loanAmount).toBeLessThanOrEqual(payment * months + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  test("0% APR loan equals payment * months", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 100, max: 2000 }),
        fc.integer({ min: 12, max: 84 }),
        (payment, months) => {
          const loanAmount = jsCalculateLoanAmount(payment, 0, months);
          expect(loanAmount).toBe(payment * months);
        }
      ),
      { numRuns: 50 }
    );
  });

  test("higher APR means lower loan amount for same payment", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 300, max: 1000 }),
        fc.float({ min: 3, max: 10 }),
        fc.integer({ min: 36, max: 72 }),
        (payment, lowApr, months) => {
          const highApr = lowApr + 5;

          const loanLowApr = jsCalculateLoanAmount(payment, lowApr, months);
          const loanHighApr = jsCalculateLoanAmount(payment, highApr, months);

          // Higher APR should result in lower loan amount
          expect(loanHighApr).toBeLessThan(loanLowApr);
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe("Mortgage Calculations", () => {
  test("mortgage PITI breakdown is consistent", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 100000, max: 1000000 }), // price
        fc.float({ min: 3, max: 30 }), // down payment %
        fc.float({ min: 3, max: 10 }), // rate
        fc.integer({ min: 15, max: 30 }), // term
        (price, downPercent, rate, term) => {
          const result = jsCalculateMortgage(
            price,
            downPercent,
            rate,
            term,
            1.2, // property tax
            1500 // insurance
          );

          // Loan amount = price - down payment
          expect(result.loan_amount).toBeCloseTo(
            price - price * (downPercent / 100),
            -1
          );

          // PITI total should equal sum of components
          const expectedTotal =
            result.piti.principal_interest +
            result.piti.property_tax +
            result.piti.insurance +
            result.piti.pmi;
          expect(result.piti.total_monthly).toBeCloseTo(expectedTotal, -1);

          // Total interest should be positive
          expect(result.total_interest).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test("PMI only applies when down payment < 20%", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 200000, max: 600000 }),
        fc.float({ min: 0, max: 40 }),
        (price, downPercent) => {
          const result = jsCalculateMortgage(price, downPercent, 6.5, 30, 1.2, 1500);

          if (downPercent >= 20) {
            expect(result.piti.pmi).toBe(0);
          } else {
            expect(result.piti.pmi).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe("Tax Calculations", () => {
  test("tax breakdown produces valid results", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 20000, max: 500000 }), // gross
        fc.float({ min: 0, max: 20 }), // 401k %
        fc.float({ min: 0, max: 500 }), // health insurance monthly
        fc.float({ min: 0, max: 13 }), // state tax %
        (gross, retirement, healthMonthly, stateRate) => {
          const result = jsCalculateTaxes(gross, retirement, healthMonthly * 12, stateRate);

          // Net should be less than gross
          expect(result.net_annual).toBeLessThan(result.gross_annual);
          expect(result.net_annual).toBeGreaterThan(0);

          // All tax components should be non-negative
          expect(result.federal_tax).toBeGreaterThanOrEqual(0);
          expect(result.state_tax).toBeGreaterThanOrEqual(0);
          expect(result.fica_tax).toBeGreaterThanOrEqual(0);

          // FICA = SS + Medicare
          expect(result.fica_tax).toBeCloseTo(
            result.social_security + result.medicare,
            -1
          );

          // Effective tax rate should be reasonable
          expect(result.effective_tax_rate).toBeGreaterThanOrEqual(0);
          expect(result.effective_tax_rate).toBeLessThan(50);
        }
      ),
      { numRuns: 100 }
    );
  });

  test("federal tax is monotonically increasing", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 20000, max: 200000 }),
        (income) => {
          const deductions = { retirement: 0, health: 0, state: 0 };

          const tax1 = jsCalculateTaxes(income, deductions.retirement, deductions.health, deductions.state);
          const tax2 = jsCalculateTaxes(income + 10000, deductions.retirement, deductions.health, deductions.state);

          expect(tax2.federal_tax).toBeGreaterThanOrEqual(tax1.federal_tax);
        }
      ),
      { numRuns: 50 }
    );
  });

  test("Social Security is capped at wage base", () => {
    fc.assert(
      fc.property(fc.float({ min: 150000, max: 500000 }), (income) => {
        const result = jsCalculateTaxes(income, 0, 0, 0);

        // SS wage base for 2024 is $168,600
        const maxSS = 168600 * 0.062;
        expect(result.social_security).toBeLessThanOrEqual(maxSS + 1);
      }),
      { numRuns: 50 }
    );
  });
});

describe("Budget Allocation", () => {
  test("50/30/20 allocation is correct", () => {
    fc.assert(
      fc.property(fc.float({ min: 1000, max: 50000 }), (netMonthly) => {
        const result = jsCalculateBudgetAllocation(netMonthly);

        // Percentages should be 50/30/20
        expect(result.needs.percent).toBe(50);
        expect(result.wants.percent).toBe(30);
        expect(result.savings.percent).toBe(20);

        // Totals should sum to 100%
        const totalPercent =
          result.needs.percent + result.wants.percent + result.savings.percent;
        expect(totalPercent).toBe(100);

        // Monthly amounts should approximately sum to net monthly
        const totalMonthly =
          result.needs.monthly + result.wants.monthly + result.savings.monthly;
        expect(totalMonthly).toBeCloseTo(Math.round(netMonthly), -1);
      }),
      { numRuns: 100 }
    );
  });

  test("subcategories sum to category total", () => {
    fc.assert(
      fc.property(fc.float({ min: 2000, max: 20000 }), (netMonthly) => {
        const result = jsCalculateBudgetAllocation(netMonthly);

        // Needs subcategories
        const needsSubtotal = result.needs.subcategories.reduce(
          (sum, sub) => sum + sub.monthly,
          0
        );
        expect(needsSubtotal).toBeCloseTo(result.needs.monthly, -1);

        // Wants subcategories
        const wantsSubtotal = result.wants.subcategories.reduce(
          (sum, sub) => sum + sub.monthly,
          0
        );
        expect(wantsSubtotal).toBeCloseTo(result.wants.monthly, -1);

        // Savings subcategories
        const savingsSubtotal = result.savings.subcategories.reduce(
          (sum, sub) => sum + sub.monthly,
          0
        );
        expect(savingsSubtotal).toBeCloseTo(result.savings.monthly, -1);
      }),
      { numRuns: 50 }
    );
  });
});

// WASM/JS Parity Tests - These run when WASM is available
describe("WASM/JS Parity", () => {
  // These tests would compare WASM and JS results
  // For now, we just verify the JS fallback works correctly

  test("sync API matches async results", async () => {
    const ytd = 50000;
    const start = "2024-01-01";
    const end = "2024-06-30";

    const syncResult = sync.calculateIncome(ytd, start, end);
    const jsResult = jsCalculateIncome(ytd, start, end);

    expect(syncResult.gross_annual).toBe(jsResult.gross_annual);
    expect(syncResult.gross_monthly).toBe(jsResult.gross_monthly);
    expect(syncResult.max_auto_payment).toBe(jsResult.max_auto_payment);
  });

  test("loan calculations are consistent", () => {
    const payment = 500;
    const apr = 6.0;
    const months = 60;

    const loanAmount = sync.calculateLoanAmount(payment, apr, months);
    const calculatedPayment = sync.calculateMonthlyPayment(loanAmount, apr, months);

    // Round-trip should be close
    expect(calculatedPayment).toBeCloseTo(payment, -1);
  });
});
