//! Auto loan and PTI (Payment-to-Income) calculation module
//!
//! Provides calculations for:
//! - Maximum payment based on PTI ratios (8%, 12%, 15%)
//! - Loan amount from monthly payment (reverse amortization)
//! - Loan estimates across credit tiers

use serde::{Deserialize, Serialize};
use crate::{CalcError, CalcResult};

/// Credit tier information with typical APR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreditTier {
    pub name: String,
    pub range: String,
    pub apr: f64,
}

impl CreditTier {
    pub fn excellent() -> Self {
        Self {
            name: "Excellent".to_string(),
            range: "750+".to_string(),
            apr: 5.99,
        }
    }

    pub fn good() -> Self {
        Self {
            name: "Good".to_string(),
            range: "700-749".to_string(),
            apr: 8.49,
        }
    }

    pub fn fair() -> Self {
        Self {
            name: "Fair".to_string(),
            range: "650-699".to_string(),
            apr: 12.99,
        }
    }

    pub fn poor() -> Self {
        Self {
            name: "Poor".to_string(),
            range: "550-649".to_string(),
            apr: 18.99,
        }
    }

    pub fn all() -> Vec<Self> {
        vec![Self::excellent(), Self::good(), Self::fair(), Self::poor()]
    }
}

/// PTI (Payment-to-Income) ratio types
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum PtiRatio {
    /// 8% - Very conservative, easy approval
    Conservative,
    /// 12% - Standard auto loan guideline
    Standard,
    /// 15% - Maximum most lenders approve
    Aggressive,
}

impl PtiRatio {
    pub fn value(&self) -> f64 {
        match self {
            PtiRatio::Conservative => 0.08,
            PtiRatio::Standard => 0.12,
            PtiRatio::Aggressive => 0.15,
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            PtiRatio::Conservative => "Low risk, easier approval",
            PtiRatio::Standard => "Typical auto loan guideline",
            PtiRatio::Aggressive => "Maximum most lenders approve",
        }
    }
}

/// Payment approval result for a PTI ratio
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentApproval {
    pub pti_type: String,
    pub ratio: f64,
    pub max_payment: f64,
    pub description: String,
}

/// Loan estimate for a credit tier
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoanEstimate {
    pub credit_tier: CreditTier,
    pub loan_amount: f64,
    pub total_interest: f64,
    pub total_cost: f64,
}

/// Full auto affordability result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoAffordability {
    pub monthly_income: f64,
    pub payment_approvals: Vec<PaymentApproval>,
    pub loan_estimates: Vec<LoanEstimate>,
}

/// Calculate maximum monthly payments based on income for all PTI ratios
pub fn calculate_payment_approvals(monthly_income: f64) -> CalcResult<Vec<PaymentApproval>> {
    if monthly_income <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Monthly income must be greater than 0".to_string(),
        ));
    }

    let ratios = [PtiRatio::Conservative, PtiRatio::Standard, PtiRatio::Aggressive];

    Ok(ratios
        .iter()
        .map(|ratio| PaymentApproval {
            pti_type: format!("{:?}", ratio),
            ratio: ratio.value(),
            max_payment: (monthly_income * ratio.value()).round(),
            description: ratio.description().to_string(),
        })
        .collect())
}

/// Calculate loan amount from monthly payment using reverse amortization
///
/// Formula: P = PMT * [(1 - (1 + r)^-n) / r]
/// Where:
/// - P = Principal (loan amount)
/// - PMT = Monthly payment
/// - r = Monthly interest rate
/// - n = Number of months
pub fn calculate_loan_amount(
    monthly_payment: f64,
    annual_rate: f64,
    term_months: u32,
) -> CalcResult<f64> {
    if monthly_payment <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Monthly payment must be greater than 0".to_string(),
        ));
    }

    if term_months == 0 {
        return Err(CalcError::InvalidInput(
            "Term must be greater than 0".to_string(),
        ));
    }

    // Handle 0% APR case
    if annual_rate <= 0.0 {
        return Ok(monthly_payment * term_months as f64);
    }

    let monthly_rate = annual_rate / 100.0 / 12.0;
    let n = term_months as f64;

    // P = PMT * [(1 - (1 + r)^-n) / r]
    let factor = (1.0 - (1.0 + monthly_rate).powf(-n)) / monthly_rate;
    let principal = monthly_payment * factor;

    Ok(principal.round())
}

/// Calculate monthly payment from loan amount using amortization formula
///
/// Formula: PMT = P * [r(1 + r)^n] / [(1 + r)^n - 1]
pub fn calculate_monthly_payment(
    principal: f64,
    annual_rate: f64,
    term_months: u32,
) -> CalcResult<f64> {
    if principal <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Principal must be greater than 0".to_string(),
        ));
    }

    if term_months == 0 {
        return Err(CalcError::InvalidInput(
            "Term must be greater than 0".to_string(),
        ));
    }

    // Handle 0% APR case
    if annual_rate <= 0.0 {
        return Ok((principal / term_months as f64).round());
    }

    let monthly_rate = annual_rate / 100.0 / 12.0;
    let n = term_months as f64;

    // PMT = P * [r(1 + r)^n] / [(1 + r)^n - 1]
    let factor = (1.0 + monthly_rate).powf(n);
    let payment = principal * (monthly_rate * factor) / (factor - 1.0);

    Ok(payment.round())
}

/// Calculate loan estimates for all credit tiers
pub fn calculate_loan_estimates(
    monthly_payment: f64,
    term_months: u32,
) -> CalcResult<Vec<LoanEstimate>> {
    let term = if term_months == 0 { 60 } else { term_months }; // Default 5 years

    if monthly_payment <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Monthly payment must be greater than 0".to_string(),
        ));
    }

    let estimates: Vec<LoanEstimate> = CreditTier::all()
        .into_iter()
        .map(|tier| {
            let loan_amount = calculate_loan_amount(monthly_payment, tier.apr, term)
                .unwrap_or(0.0);
            let total_cost = monthly_payment * term as f64;
            let total_interest = total_cost - loan_amount;

            LoanEstimate {
                credit_tier: tier,
                loan_amount,
                total_interest: total_interest.max(0.0).round(),
                total_cost: total_cost.round(),
            }
        })
        .collect();

    Ok(estimates)
}

/// Calculate full auto affordability analysis
pub fn calculate_auto_affordability(
    monthly_income: f64,
    term_months: u32,
) -> CalcResult<AutoAffordability> {
    let payment_approvals = calculate_payment_approvals(monthly_income)?;

    // Use standard PTI (12%) for loan estimates
    let standard_payment = (monthly_income * PtiRatio::Standard.value()).round();
    let loan_estimates = calculate_loan_estimates(standard_payment, term_months)?;

    Ok(AutoAffordability {
        monthly_income,
        payment_approvals,
        loan_estimates,
    })
}

/// Generate amortization schedule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AmortizationPayment {
    pub month: u32,
    pub payment: f64,
    pub principal: f64,
    pub interest: f64,
    pub balance: f64,
}

pub fn generate_amortization_schedule(
    principal: f64,
    annual_rate: f64,
    term_months: u32,
) -> CalcResult<Vec<AmortizationPayment>> {
    let payment = calculate_monthly_payment(principal, annual_rate, term_months)?;
    let monthly_rate = annual_rate / 100.0 / 12.0;

    let mut balance = principal;
    let mut schedule = Vec::with_capacity(term_months as usize);

    for month in 1..=term_months {
        let interest = balance * monthly_rate;
        let principal_portion = payment - interest;
        balance -= principal_portion;

        // Ensure final balance is exactly 0
        let final_balance = if month == term_months { 0.0 } else { balance.max(0.0) };

        schedule.push(AmortizationPayment {
            month,
            payment: payment.round(),
            principal: principal_portion.round(),
            interest: interest.round(),
            balance: final_balance.round(),
        });
    }

    Ok(schedule)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_payment_approvals() {
        let approvals = calculate_payment_approvals(5000.0).unwrap();

        assert_eq!(approvals.len(), 3);
        assert_eq!(approvals[0].max_payment, 400.0); // 8%
        assert_eq!(approvals[1].max_payment, 600.0); // 12%
        assert_eq!(approvals[2].max_payment, 750.0); // 15%
    }

    #[test]
    fn test_loan_amount_calculation() {
        // Test with known values
        let loan = calculate_loan_amount(600.0, 5.99, 60).unwrap();

        // At 5.99% APR, $600/month for 60 months should be around $31,000
        assert!(loan > 30000.0 && loan < 32000.0);
    }

    #[test]
    fn test_zero_apr() {
        let loan = calculate_loan_amount(500.0, 0.0, 60).unwrap();
        assert_eq!(loan, 30000.0); // 500 * 60
    }

    #[test]
    fn test_monthly_payment() {
        let payment = calculate_monthly_payment(30000.0, 5.99, 60).unwrap();

        // Should be approximately $580/month
        assert!(payment > 570.0 && payment < 590.0);
    }

    #[test]
    fn test_loan_estimates() {
        let estimates = calculate_loan_estimates(600.0, 60).unwrap();

        assert_eq!(estimates.len(), 4);

        // Excellent credit should get highest loan amount (lowest APR)
        assert!(estimates[0].loan_amount > estimates[3].loan_amount);

        // All should have same total cost (same payment)
        assert_eq!(estimates[0].total_cost, estimates[3].total_cost);
    }

    #[test]
    fn test_amortization_schedule() {
        let schedule = generate_amortization_schedule(10000.0, 6.0, 12).unwrap();

        assert_eq!(schedule.len(), 12);
        assert_eq!(schedule[11].balance, 0.0); // Final balance should be 0

        // First payment should have more interest than last
        assert!(schedule[0].interest > schedule[11].interest);
    }
}
