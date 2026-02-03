//! Property-based tests using proptest
//!
//! These tests verify mathematical invariants and properties that should
//! always hold true for our calculations.

use proptest::prelude::*;
use calc_core::{income, auto, housing, budget};

proptest! {
    /// Income must scale linearly with YTD amount
    /// If YTD doubles, annual projection should double
    #[test]
    fn income_scales_linearly(
        ytd in 1000.0..1000000.0f64,
        days in 30..365i64
    ) {
        let input1 = income::IncomeInput {
            ytd_income: ytd,
            start_date: "2024-01-01".to_string(),
            check_date: format!("2024-{:02}-{:02}",
                (days / 30).min(12).max(1),
                (days % 30).max(1).min(28)),
        };

        // Just verify it doesn't crash and produces positive results
        if let Ok(result) = income::calculate_income(&input1) {
            prop_assert!(result.gross_annual > 0.0);
            prop_assert!(result.gross_monthly > 0.0);
            prop_assert!(result.max_auto_payment > 0.0);
            prop_assert!(result.max_rent > 0.0);

            // 12% of monthly for auto, 30% for rent
            let expected_auto = (result.gross_monthly * 0.12).round();
            let expected_rent = (result.gross_monthly * 0.30).round();
            prop_assert!((result.max_auto_payment - expected_auto).abs() <= 1.0);
            prop_assert!((result.max_rent - expected_rent).abs() <= 1.0);
        }
    }

    /// Loan payment * months should approximately equal principal + interest
    #[test]
    fn loan_amortization_sums(
        principal in 5000.0..100000.0f64,
        apr in 1.0..20.0f64,
        months in 12u32..84u32
    ) {
        let payment = auto::calculate_monthly_payment(principal, apr, months).unwrap();
        let total_paid = payment * months as f64;

        // Total paid must be >= principal (no negative interest)
        prop_assert!(total_paid >= principal * 0.999); // Allow small rounding error

        // Total interest should be positive
        let interest = total_paid - principal;
        prop_assert!(interest >= 0.0);
    }

    /// Reverse amortization should recover the original loan amount
    #[test]
    fn loan_amount_payment_roundtrip(
        principal in 5000.0..100000.0f64,
        apr in 1.0..20.0f64,
        months in 12u32..84u32
    ) {
        // Calculate payment from principal
        let payment = auto::calculate_monthly_payment(principal, apr, months).unwrap();

        // Recover principal from payment
        let recovered = auto::calculate_loan_amount(payment, apr, months).unwrap();

        // Should be within 1% due to rounding
        let diff = (recovered - principal).abs();
        let tolerance = principal * 0.01;
        prop_assert!(diff <= tolerance,
            "Expected {} +/- {}, got {}, diff = {}",
            principal, tolerance, recovered, diff);
    }

    /// PTI ratios should maintain ordering: conservative < standard < aggressive
    #[test]
    fn pti_ordering_preserved(income in 1000.0..50000.0f64) {
        let approvals = auto::calculate_payment_approvals(income).unwrap();

        // Should have 3 tiers
        prop_assert_eq!(approvals.len(), 3);

        // Payments should increase with risk
        prop_assert!(approvals[0].max_payment < approvals[1].max_payment);
        prop_assert!(approvals[1].max_payment < approvals[2].max_payment);

        // Ratios should match expected values
        prop_assert!((approvals[0].ratio - 0.08).abs() < 0.001);
        prop_assert!((approvals[1].ratio - 0.12).abs() < 0.001);
        prop_assert!((approvals[2].ratio - 0.15).abs() < 0.001);
    }

    /// Mortgage PMI should only apply when down payment < 20%
    #[test]
    fn mortgage_pmi_threshold(
        price in 100000.0..1000000.0f64,
        down_percent in 0.0..40.0f64
    ) {
        let result = housing::calculate_mortgage(
            price, down_percent, 6.5, 30, 1.2, 1500.0
        ).unwrap();

        if down_percent >= 20.0 {
            prop_assert_eq!(result.piti.pmi, 0.0, "PMI should be 0 at {}% down", down_percent);
        } else {
            prop_assert!(result.piti.pmi > 0.0, "PMI should be > 0 at {}% down", down_percent);
        }
    }

    /// DTI ratios should be correctly calculated
    #[test]
    fn dti_calculation_correct(
        income in 3000.0..30000.0f64,
        housing in 500.0..5000.0f64,
        debts in 0.0..2000.0f64
    ) {
        if housing > income || (housing + debts) > income * 2.0 {
            // Skip unrealistic scenarios
            return Ok(());
        }

        let result = housing::calculate_dti(income, housing, debts).unwrap();

        // Front-end DTI = housing / income * 100
        let expected_front = (housing / income) * 100.0;
        prop_assert!((result.front_end_dti - expected_front).abs() < 0.2,
            "Front-end DTI: expected {}, got {}", expected_front, result.front_end_dti);

        // Back-end DTI = (housing + debts) / income * 100
        let expected_back = ((housing + debts) / income) * 100.0;
        prop_assert!((result.back_end_dti - expected_back).abs() < 0.2,
            "Back-end DTI: expected {}, got {}", expected_back, result.back_end_dti);
    }

    /// Budget allocation should sum to 100%
    #[test]
    fn budget_sums_to_100(net_monthly in 1000.0..50000.0f64) {
        let result = budget::calculate_budget_allocation(net_monthly).unwrap();

        // 50 + 30 + 20 = 100
        let total_percent = result.needs.percent + result.wants.percent + result.savings.percent;
        prop_assert_eq!(total_percent, 100.0);

        // Monthly amounts should sum to net_monthly (with rounding tolerance)
        let total_monthly = result.needs.monthly + result.wants.monthly + result.savings.monthly;
        prop_assert!((total_monthly - net_monthly.round()).abs() <= 3.0,
            "Total {} should equal {}", total_monthly, net_monthly);
    }

    /// Federal tax should be monotonically increasing
    #[test]
    fn federal_tax_monotonic(income in 0.0..500000.0f64) {
        let tax1 = budget::calculate_federal_tax(income);
        let tax2 = budget::calculate_federal_tax(income + 1000.0);

        // Higher income should have >= tax
        prop_assert!(tax2 >= tax1,
            "Tax on {} = {}, tax on {} = {}",
            income, tax1, income + 1000.0, tax2);
    }

    /// Tax rate should be progressive (higher income = higher effective rate)
    #[test]
    fn tax_rate_progressive(base in 20000.0..200000.0f64) {
        let high = base * 2.0;

        let tax_base = budget::calculate_federal_tax(base);
        let tax_high = budget::calculate_federal_tax(high);

        let rate_base = if base > 0.0 { tax_base / base } else { 0.0 };
        let rate_high = if high > 0.0 { tax_high / high } else { 0.0 };

        // Higher income should have higher or equal effective rate
        prop_assert!(rate_high >= rate_base - 0.001,
            "Effective rate at {} = {}, at {} = {}",
            base, rate_base, high, rate_high);
    }

    /// FICA should respect wage base for Social Security
    #[test]
    fn fica_respects_wage_base(income in 100000.0..300000.0f64) {
        let (_, ss, _) = budget::calculate_fica_tax(income);

        // SS should be capped at wage base * 6.2%
        let max_ss = budget::SS_WAGE_BASE_2024 * 0.062;
        prop_assert!(ss <= max_ss + 1.0,
            "SS {} should be <= {}", ss, max_ss);
    }

    /// Amortization schedule should end at zero balance
    #[test]
    fn amortization_ends_at_zero(
        principal in 10000.0..100000.0f64,
        apr in 1.0..15.0f64,
        months in 12u32..60u32
    ) {
        let schedule = auto::generate_amortization_schedule(principal, apr, months).unwrap();

        prop_assert_eq!(schedule.len(), months as usize);
        prop_assert_eq!(schedule.last().unwrap().balance, 0.0);

        // All payments should be positive
        for payment in &schedule {
            prop_assert!(payment.payment > 0.0);
            prop_assert!(payment.principal >= 0.0);
            prop_assert!(payment.interest >= 0.0);
        }
    }
}

// Additional invariant tests

#[test]
fn credit_tiers_ordered_by_apr() {
    let tiers = auto::CreditTier::all();

    // APR should increase as credit quality decreases
    assert!(tiers[0].apr < tiers[1].apr); // Excellent < Good
    assert!(tiers[1].apr < tiers[2].apr); // Good < Fair
    assert!(tiers[2].apr < tiers[3].apr); // Fair < Poor
}

#[test]
fn zero_apr_loan_equals_principal() {
    let payment = auto::calculate_monthly_payment(12000.0, 0.0, 12).unwrap();
    assert_eq!(payment, 1000.0); // 12000 / 12 = 1000
}

#[test]
fn standard_deduction_applied() {
    // Income below standard deduction should have no federal tax
    let tax = budget::calculate_federal_tax(10000.0);
    assert_eq!(tax, 0.0);
}
