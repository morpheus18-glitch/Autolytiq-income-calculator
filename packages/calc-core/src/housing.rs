//! Housing affordability calculation module
//!
//! Provides calculations for:
//! - Rent affordability (30% and 25% rules)
//! - Mortgage payments (PITI breakdown)
//! - DTI (Debt-to-Income) ratios
//! - PMI calculations
//! - Maximum home price estimation

use serde::{Deserialize, Serialize};
use crate::{CalcError, CalcResult};

/// Rent affordability calculation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RentAffordability {
    /// Monthly income
    pub monthly_income: f64,
    /// Maximum rent at 30% of gross income
    pub max_rent_30: f64,
    /// Conservative max rent at 25% of gross income
    pub max_rent_25: f64,
    /// Current rent if provided
    pub current_rent: Option<f64>,
    /// Rent as percentage of income
    pub rent_percent: Option<f64>,
    /// Whether current rent is affordable (<= 30%)
    pub is_affordable: Option<bool>,
}

/// PITI (Principal, Interest, Taxes, Insurance) breakdown
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PitiBreakdown {
    pub principal_interest: f64,
    pub property_tax: f64,
    pub insurance: f64,
    pub pmi: f64,
    pub total_monthly: f64,
}

/// Mortgage calculation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MortgageResult {
    /// Home purchase price
    pub home_price: f64,
    /// Down payment amount
    pub down_payment: f64,
    /// Down payment percentage
    pub down_payment_percent: f64,
    /// Loan amount (principal)
    pub loan_amount: f64,
    /// Annual interest rate
    pub interest_rate: f64,
    /// Loan term in years
    pub term_years: u32,
    /// Monthly PITI breakdown
    pub piti: PitiBreakdown,
    /// Total payments over loan life
    pub total_payments: f64,
    /// Total interest paid
    pub total_interest: f64,
}

/// DTI (Debt-to-Income) analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DtiAnalysis {
    /// Monthly gross income
    pub monthly_income: f64,
    /// Monthly housing payment
    pub housing_payment: f64,
    /// Other monthly debts
    pub other_debts: f64,
    /// Front-end DTI (housing only) percentage
    pub front_end_dti: f64,
    /// Back-end DTI (total debts) percentage
    pub back_end_dti: f64,
    /// Whether mortgage is affordable (front <= 28%, back <= 36%)
    pub is_affordable: bool,
    /// Qualification status
    pub qualification: String,
}

/// Maximum home price calculation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaxHomePrice {
    pub monthly_income: f64,
    pub max_housing_payment: f64,
    pub estimated_max_price: f64,
    pub assumptions: MaxPriceAssumptions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaxPriceAssumptions {
    pub down_payment_percent: f64,
    pub interest_rate: f64,
    pub term_years: u32,
    pub property_tax_rate: f64,
    pub annual_insurance: f64,
}

/// Calculate rent affordability
pub fn calculate_rent_affordability(
    monthly_income: f64,
    current_rent: Option<f64>,
) -> CalcResult<RentAffordability> {
    if monthly_income <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Monthly income must be greater than 0".to_string(),
        ));
    }

    let max_rent_30 = (monthly_income * 0.30).round();
    let max_rent_25 = (monthly_income * 0.25).round();

    let (rent_percent, is_affordable) = if let Some(rent) = current_rent {
        let percent = (rent / monthly_income) * 100.0;
        (Some(percent), Some(rent <= max_rent_30))
    } else {
        (None, None)
    };

    Ok(RentAffordability {
        monthly_income,
        max_rent_30,
        max_rent_25,
        current_rent,
        rent_percent,
        is_affordable,
    })
}

/// Calculate mortgage payment using amortization formula
/// PMT = P * [r(1 + r)^n] / [(1 + r)^n - 1]
fn calculate_mortgage_pi(principal: f64, annual_rate: f64, years: u32) -> f64 {
    let monthly_rate = annual_rate / 100.0 / 12.0;
    let n = (years * 12) as f64;

    if monthly_rate == 0.0 {
        return principal / n;
    }

    let factor = (1.0 + monthly_rate).powf(n);
    principal * (monthly_rate * factor) / (factor - 1.0)
}

/// Calculate full mortgage with PITI breakdown
pub fn calculate_mortgage(
    home_price: f64,
    down_payment_percent: f64,
    interest_rate: f64,
    term_years: u32,
    property_tax_rate: f64,
    annual_insurance: f64,
) -> CalcResult<MortgageResult> {
    if home_price <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Home price must be greater than 0".to_string(),
        ));
    }

    if down_payment_percent < 0.0 || down_payment_percent >= 100.0 {
        return Err(CalcError::InvalidInput(
            "Down payment percent must be between 0 and 100".to_string(),
        ));
    }

    if term_years == 0 {
        return Err(CalcError::InvalidInput(
            "Loan term must be greater than 0".to_string(),
        ));
    }

    let down_payment = home_price * (down_payment_percent / 100.0);
    let loan_amount = home_price - down_payment;

    // Calculate P&I
    let principal_interest = calculate_mortgage_pi(loan_amount, interest_rate, term_years);

    // Calculate property tax (monthly)
    let property_tax = (home_price * (property_tax_rate / 100.0)) / 12.0;

    // Calculate insurance (monthly)
    let insurance = annual_insurance / 12.0;

    // Calculate PMI (if down payment < 20%)
    // Typical PMI is 0.5% of loan amount annually
    let pmi = if down_payment_percent < 20.0 {
        (loan_amount * 0.005) / 12.0
    } else {
        0.0
    };

    let total_monthly = principal_interest + property_tax + insurance + pmi;
    let total_payments = principal_interest * (term_years * 12) as f64;
    let total_interest = total_payments - loan_amount;

    Ok(MortgageResult {
        home_price,
        down_payment: down_payment.round(),
        down_payment_percent,
        loan_amount: loan_amount.round(),
        interest_rate,
        term_years,
        piti: PitiBreakdown {
            principal_interest: principal_interest.round(),
            property_tax: property_tax.round(),
            insurance: insurance.round(),
            pmi: pmi.round(),
            total_monthly: total_monthly.round(),
        },
        total_payments: total_payments.round(),
        total_interest: total_interest.round(),
    })
}

/// Calculate DTI analysis for mortgage qualification
pub fn calculate_dti(
    monthly_income: f64,
    housing_payment: f64,
    other_debts: f64,
) -> CalcResult<DtiAnalysis> {
    if monthly_income <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Monthly income must be greater than 0".to_string(),
        ));
    }

    let front_end_dti = (housing_payment / monthly_income) * 100.0;
    let back_end_dti = ((housing_payment + other_debts) / monthly_income) * 100.0;

    // Standard qualification: front-end <= 28%, back-end <= 36%
    let is_affordable = front_end_dti <= 28.0 && back_end_dti <= 36.0;

    let qualification = if front_end_dti <= 28.0 && back_end_dti <= 36.0 {
        "Excellent - Well within guidelines".to_string()
    } else if front_end_dti <= 31.0 && back_end_dti <= 43.0 {
        "Good - May qualify with compensating factors".to_string()
    } else if front_end_dti <= 36.0 && back_end_dti <= 50.0 {
        "Fair - FHA/VA loans may be available".to_string()
    } else {
        "At risk - May not qualify for most loans".to_string()
    };

    Ok(DtiAnalysis {
        monthly_income,
        housing_payment: housing_payment.round(),
        other_debts: other_debts.round(),
        front_end_dti: (front_end_dti * 10.0).round() / 10.0,
        back_end_dti: (back_end_dti * 10.0).round() / 10.0,
        is_affordable,
        qualification,
    })
}

/// Calculate maximum home price based on income
pub fn calculate_max_home_price(
    monthly_income: f64,
    down_payment_percent: f64,
    interest_rate: f64,
    term_years: u32,
    property_tax_rate: f64,
    annual_insurance: f64,
) -> CalcResult<MaxHomePrice> {
    if monthly_income <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Monthly income must be greater than 0".to_string(),
        ));
    }

    // Max housing at 28% of gross income (front-end DTI)
    let max_housing_payment = monthly_income * 0.28;

    // Estimate the portion going to P&I (roughly 80% of PITI)
    let estimated_pi = max_housing_payment * 0.80;

    // Reverse the mortgage formula to get max loan amount
    let monthly_rate = interest_rate / 100.0 / 12.0;
    let n = (term_years * 12) as f64;

    let max_loan = if monthly_rate == 0.0 {
        estimated_pi * n
    } else {
        let factor = (1.0 - (1.0 + monthly_rate).powf(-n)) / monthly_rate;
        estimated_pi * factor
    };

    // Convert loan to home price based on down payment
    let max_price = max_loan / (1.0 - down_payment_percent / 100.0);

    Ok(MaxHomePrice {
        monthly_income,
        max_housing_payment: max_housing_payment.round(),
        estimated_max_price: max_price.round(),
        assumptions: MaxPriceAssumptions {
            down_payment_percent,
            interest_rate,
            term_years,
            property_tax_rate,
            annual_insurance,
        },
    })
}

/// Generate mortgage amortization schedule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MortgagePayment {
    pub month: u32,
    pub payment: f64,
    pub principal: f64,
    pub interest: f64,
    pub balance: f64,
    pub cumulative_interest: f64,
    pub cumulative_principal: f64,
}

pub fn generate_mortgage_schedule(
    principal: f64,
    annual_rate: f64,
    term_years: u32,
) -> CalcResult<Vec<MortgagePayment>> {
    if principal <= 0.0 || term_years == 0 {
        return Err(CalcError::InvalidInput(
            "Invalid loan parameters".to_string(),
        ));
    }

    let monthly_payment = calculate_mortgage_pi(principal, annual_rate, term_years);
    let monthly_rate = annual_rate / 100.0 / 12.0;
    let total_months = term_years * 12;

    let mut balance = principal;
    let mut cumulative_interest = 0.0;
    let mut cumulative_principal = 0.0;
    let mut schedule = Vec::with_capacity(total_months as usize);

    for month in 1..=total_months {
        let interest = balance * monthly_rate;
        let principal_portion = monthly_payment - interest;
        balance -= principal_portion;

        cumulative_interest += interest;
        cumulative_principal += principal_portion;

        // Ensure final balance is exactly 0
        let final_balance = if month == total_months { 0.0 } else { balance.max(0.0) };

        schedule.push(MortgagePayment {
            month,
            payment: monthly_payment.round(),
            principal: principal_portion.round(),
            interest: interest.round(),
            balance: final_balance.round(),
            cumulative_interest: cumulative_interest.round(),
            cumulative_principal: cumulative_principal.round(),
        });
    }

    Ok(schedule)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rent_affordability() {
        let result = calculate_rent_affordability(5000.0, Some(1400.0)).unwrap();

        assert_eq!(result.max_rent_30, 1500.0);
        assert_eq!(result.max_rent_25, 1250.0);
        assert_eq!(result.is_affordable, Some(true));
        assert!((result.rent_percent.unwrap() - 28.0).abs() < 0.1);
    }

    #[test]
    fn test_mortgage_calculation() {
        let result = calculate_mortgage(
            400000.0, // home price
            20.0,     // 20% down
            6.5,      // interest rate
            30,       // 30 year term
            1.2,      // property tax rate
            1500.0,   // annual insurance
        ).unwrap();

        assert_eq!(result.down_payment, 80000.0);
        assert_eq!(result.loan_amount, 320000.0);
        assert_eq!(result.piti.pmi, 0.0); // No PMI at 20% down

        // P&I should be around $2,023
        assert!(result.piti.principal_interest > 2000.0);
        assert!(result.piti.principal_interest < 2100.0);
    }

    #[test]
    fn test_mortgage_with_pmi() {
        let result = calculate_mortgage(
            400000.0,
            10.0, // 10% down - should trigger PMI
            6.5,
            30,
            1.2,
            1500.0,
        ).unwrap();

        assert!(result.piti.pmi > 0.0);
        // PMI should be ~0.5% of loan annually / 12
        assert!((result.piti.pmi - 150.0).abs() < 10.0);
    }

    #[test]
    fn test_dti_calculation() {
        let result = calculate_dti(8000.0, 2000.0, 500.0).unwrap();

        assert_eq!(result.front_end_dti, 25.0);
        assert_eq!(result.back_end_dti, 31.2);
        assert!(result.is_affordable);
    }

    #[test]
    fn test_max_home_price() {
        let result = calculate_max_home_price(
            8000.0, // $8k/month income
            20.0,   // 20% down
            6.5,    // rate
            30,     // term
            1.2,    // property tax
            1500.0, // insurance
        ).unwrap();

        assert_eq!(result.max_housing_payment, 2240.0); // 28% of 8000
        // Max price should be around $350k-$400k
        assert!(result.estimated_max_price > 300000.0);
        assert!(result.estimated_max_price < 500000.0);
    }

    #[test]
    fn test_mortgage_schedule() {
        let schedule = generate_mortgage_schedule(100000.0, 6.0, 15).unwrap();

        assert_eq!(schedule.len(), 180); // 15 years * 12 months
        assert_eq!(schedule[179].balance, 0.0); // Final balance is 0

        // First payment should have more interest than principal
        assert!(schedule[0].interest > schedule[0].principal);

        // Last payment should have more principal than interest
        assert!(schedule[179].principal > schedule[179].interest);
    }
}
