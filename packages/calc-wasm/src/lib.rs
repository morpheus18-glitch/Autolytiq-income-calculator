//! WASM bindings for Autolytiq Calculation Engine
//!
//! This crate provides JavaScript-compatible bindings for the calc-core library.
//! All calculations produce results that exactly match the JavaScript implementations.

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use calc_core::{
    income, auto, housing, budget,
    IncomeInput, IncomeData,
    PaymentApproval, LoanEstimate, AutoAffordability,
    RentAffordability, MortgageResult, DtiAnalysis, MaxHomePrice,
    TaxDeductions, TaxBreakdown, BudgetAllocation, QuickReference,
};

// Initialize panic hook for better error messages in browser console
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// =============================================================================
// Income Calculations
// =============================================================================

/// Calculate income projection from YTD data
///
/// # Arguments
/// * `ytd_income` - Year-to-date gross income
/// * `start_date` - Employment start date (ISO 8601: YYYY-MM-DD)
/// * `check_date` - Most recent paycheck date (ISO 8601: YYYY-MM-DD)
///
/// # Returns
/// JSON object with income projections
#[wasm_bindgen(js_name = calculateIncome)]
pub fn calculate_income(
    ytd_income: f64,
    start_date: &str,
    check_date: &str,
) -> Result<JsValue, JsError> {
    let input = IncomeInput {
        ytd_income,
        start_date: start_date.to_string(),
        check_date: check_date.to_string(),
    };

    income::calculate_income(&input)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate income from monthly amount
#[wasm_bindgen(js_name = incomeFromMonthly)]
pub fn income_from_monthly(monthly_income: f64) -> Result<JsValue, JsError> {
    income::income_from_monthly(monthly_income)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate income from annual amount
#[wasm_bindgen(js_name = incomeFromAnnual)]
pub fn income_from_annual(annual_income: f64) -> Result<JsValue, JsError> {
    income::income_from_annual(annual_income)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

// =============================================================================
// Auto Loan Calculations
// =============================================================================

/// Calculate payment approvals for all PTI ratios
#[wasm_bindgen(js_name = calculatePaymentApprovals)]
pub fn calculate_payment_approvals(monthly_income: f64) -> Result<JsValue, JsError> {
    auto::calculate_payment_approvals(monthly_income)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate loan amount from monthly payment (reverse amortization)
#[wasm_bindgen(js_name = calculateLoanAmount)]
pub fn calculate_loan_amount(
    monthly_payment: f64,
    annual_rate: f64,
    term_months: u32,
) -> Result<f64, JsError> {
    auto::calculate_loan_amount(monthly_payment, annual_rate, term_months)
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate monthly payment from loan amount
#[wasm_bindgen(js_name = calculateMonthlyPayment)]
pub fn calculate_monthly_payment(
    principal: f64,
    annual_rate: f64,
    term_months: u32,
) -> Result<f64, JsError> {
    auto::calculate_monthly_payment(principal, annual_rate, term_months)
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate loan estimates for all credit tiers
#[wasm_bindgen(js_name = calculateLoanEstimates)]
pub fn calculate_loan_estimates(
    monthly_payment: f64,
    term_months: u32,
) -> Result<JsValue, JsError> {
    auto::calculate_loan_estimates(monthly_payment, term_months)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate full auto affordability analysis
#[wasm_bindgen(js_name = calculateAutoAffordability)]
pub fn calculate_auto_affordability(
    monthly_income: f64,
    term_months: u32,
) -> Result<JsValue, JsError> {
    auto::calculate_auto_affordability(monthly_income, term_months)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Generate auto loan amortization schedule
#[wasm_bindgen(js_name = generateAutoAmortization)]
pub fn generate_auto_amortization(
    principal: f64,
    annual_rate: f64,
    term_months: u32,
) -> Result<JsValue, JsError> {
    auto::generate_amortization_schedule(principal, annual_rate, term_months)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

// =============================================================================
// Housing Calculations
// =============================================================================

/// Calculate rent affordability
#[wasm_bindgen(js_name = calculateRentAffordability)]
pub fn calculate_rent_affordability(
    monthly_income: f64,
    current_rent: Option<f64>,
) -> Result<JsValue, JsError> {
    housing::calculate_rent_affordability(monthly_income, current_rent)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate mortgage with PITI breakdown
#[wasm_bindgen(js_name = calculateMortgage)]
pub fn calculate_mortgage(
    home_price: f64,
    down_payment_percent: f64,
    interest_rate: f64,
    term_years: u32,
    property_tax_rate: f64,
    annual_insurance: f64,
) -> Result<JsValue, JsError> {
    housing::calculate_mortgage(
        home_price,
        down_payment_percent,
        interest_rate,
        term_years,
        property_tax_rate,
        annual_insurance,
    )
    .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
    .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate DTI analysis
#[wasm_bindgen(js_name = calculateDti)]
pub fn calculate_dti(
    monthly_income: f64,
    housing_payment: f64,
    other_debts: f64,
) -> Result<JsValue, JsError> {
    housing::calculate_dti(monthly_income, housing_payment, other_debts)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate maximum home price
#[wasm_bindgen(js_name = calculateMaxHomePrice)]
pub fn calculate_max_home_price(
    monthly_income: f64,
    down_payment_percent: f64,
    interest_rate: f64,
    term_years: u32,
    property_tax_rate: f64,
    annual_insurance: f64,
) -> Result<JsValue, JsError> {
    housing::calculate_max_home_price(
        monthly_income,
        down_payment_percent,
        interest_rate,
        term_years,
        property_tax_rate,
        annual_insurance,
    )
    .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
    .map_err(|e| JsError::new(&e.to_string()))
}

/// Generate mortgage amortization schedule
#[wasm_bindgen(js_name = generateMortgageAmortization)]
pub fn generate_mortgage_amortization(
    principal: f64,
    annual_rate: f64,
    term_years: u32,
) -> Result<JsValue, JsError> {
    housing::generate_mortgage_schedule(principal, annual_rate, term_years)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

// =============================================================================
// Budget Calculations
// =============================================================================

/// Calculate tax breakdown
#[wasm_bindgen(js_name = calculateTaxes)]
pub fn calculate_taxes(
    gross_annual: f64,
    retirement_401k_percent: f64,
    health_insurance_annual: f64,
    state_tax_rate: f64,
) -> Result<JsValue, JsError> {
    let deductions = TaxDeductions {
        retirement_401k_percent,
        health_insurance_annual,
        state_tax_rate,
        other_pretax: 0.0,
    };

    budget::calculate_taxes(gross_annual, &deductions)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate federal tax only
#[wasm_bindgen(js_name = calculateFederalTax)]
pub fn calculate_federal_tax(gross_income: f64) -> f64 {
    budget::calculate_federal_tax(gross_income)
}

/// Calculate FICA taxes
#[wasm_bindgen(js_name = calculateFica)]
pub fn calculate_fica(gross_income: f64) -> JsValue {
    let (total, ss, medicare) = budget::calculate_fica_tax(gross_income);

    #[derive(Serialize)]
    struct FicaResult {
        total: f64,
        social_security: f64,
        medicare: f64,
    }

    serde_wasm_bindgen::to_value(&FicaResult {
        total,
        social_security: ss,
        medicare,
    }).unwrap()
}

/// Calculate 50/30/20 budget allocation
#[wasm_bindgen(js_name = calculateBudgetAllocation)]
pub fn calculate_budget_allocation(net_monthly: f64) -> Result<JsValue, JsError> {
    budget::calculate_budget_allocation(net_monthly)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

/// Calculate quick reference stats
#[wasm_bindgen(js_name = calculateQuickReference)]
pub fn calculate_quick_reference(
    net_monthly: f64,
    hours_per_week: f64,
) -> Result<JsValue, JsError> {
    budget::calculate_quick_reference(net_monthly, hours_per_week)
        .map(|result| serde_wasm_bindgen::to_value(&result).unwrap())
        .map_err(|e| JsError::new(&e.to_string()))
}

// =============================================================================
// Utility Functions
// =============================================================================

/// Format number as USD currency
#[wasm_bindgen(js_name = formatCurrency)]
pub fn format_currency(amount: f64) -> String {
    calc_core::format_currency(amount)
}

/// Format ratio as percentage
#[wasm_bindgen(js_name = formatPercent)]
pub fn format_percent(ratio: f64) -> String {
    calc_core::format_percent(ratio)
}

/// Get version information
#[wasm_bindgen(js_name = getVersion)]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Check if WASM module is loaded (for feature detection)
#[wasm_bindgen(js_name = isWasmLoaded)]
pub fn is_wasm_loaded() -> bool {
    true
}

// =============================================================================
// Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_income_calculation() {
        let result = calculate_income(50000.0, "2024-01-01", "2024-06-30");
        assert!(result.is_ok());
    }

    #[wasm_bindgen_test]
    fn test_loan_amount() {
        let result = calculate_loan_amount(600.0, 5.99, 60);
        assert!(result.is_ok());
        let amount = result.unwrap();
        assert!(amount > 30000.0 && amount < 32000.0);
    }

    #[wasm_bindgen_test]
    fn test_mortgage_calculation() {
        let result = calculate_mortgage(400000.0, 20.0, 6.5, 30, 1.2, 1500.0);
        assert!(result.is_ok());
    }

    #[wasm_bindgen_test]
    fn test_tax_calculation() {
        let result = calculate_taxes(60000.0, 6.0, 2400.0, 5.0);
        assert!(result.is_ok());
    }

    #[wasm_bindgen_test]
    fn test_version() {
        let version = get_version();
        assert!(!version.is_empty());
    }

    #[wasm_bindgen_test]
    fn test_is_loaded() {
        assert!(is_wasm_loaded());
    }
}
