//! Budget calculation module
//!
//! Provides calculations for:
//! - Federal tax (2024 brackets with standard deduction)
//! - FICA (Social Security + Medicare)
//! - State tax estimation
//! - Take-home pay
//! - 50/30/20 budget allocation

use serde::{Deserialize, Serialize};
use crate::{CalcError, CalcResult};

/// Federal tax bracket
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxBracket {
    pub min: f64,
    pub max: f64,
    pub rate: f64,
}

/// 2024 Federal Tax Brackets (Single Filer)
pub const TAX_BRACKETS_2024: [TaxBracket; 7] = [
    TaxBracket { min: 0.0, max: 11600.0, rate: 0.10 },
    TaxBracket { min: 11600.0, max: 47150.0, rate: 0.12 },
    TaxBracket { min: 47150.0, max: 100525.0, rate: 0.22 },
    TaxBracket { min: 100525.0, max: 191950.0, rate: 0.24 },
    TaxBracket { min: 191950.0, max: 243725.0, rate: 0.32 },
    TaxBracket { min: 243725.0, max: 609350.0, rate: 0.35 },
    TaxBracket { min: 609350.0, max: f64::INFINITY, rate: 0.37 },
];

/// Standard deduction for 2024 (single filer)
pub const STANDARD_DEDUCTION_2024: f64 = 14600.0;

/// FICA rate (Social Security 6.2% + Medicare 1.45%)
pub const FICA_RATE: f64 = 0.0765;

/// Social Security wage base limit for 2024
pub const SS_WAGE_BASE_2024: f64 = 168600.0;

/// Tax deductions input
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxDeductions {
    /// 401k contribution percentage (0-100)
    pub retirement_401k_percent: f64,
    /// Annual health insurance premium
    pub health_insurance_annual: f64,
    /// State tax rate percentage
    pub state_tax_rate: f64,
    /// Other pre-tax deductions
    pub other_pretax: f64,
}

impl Default for TaxDeductions {
    fn default() -> Self {
        Self {
            retirement_401k_percent: 6.0,
            health_insurance_annual: 2400.0, // $200/month
            state_tax_rate: 5.0,
            other_pretax: 0.0,
        }
    }
}

/// Tax calculation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxBreakdown {
    pub gross_annual: f64,
    pub federal_tax: f64,
    pub state_tax: f64,
    pub fica_tax: f64,
    pub social_security: f64,
    pub medicare: f64,
    pub retirement_401k: f64,
    pub health_insurance: f64,
    pub total_deductions: f64,
    pub net_annual: f64,
    pub net_monthly: f64,
    pub effective_tax_rate: f64,
}

/// Budget allocation result (50/30/20 rule)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetAllocation {
    pub net_monthly: f64,
    pub needs: BudgetCategory,       // 50%
    pub wants: BudgetCategory,       // 30%
    pub savings: BudgetCategory,     // 20%
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetCategory {
    pub name: String,
    pub percent: f64,
    pub monthly: f64,
    pub weekly: f64,
    pub daily: f64,
    pub subcategories: Vec<SubCategory>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubCategory {
    pub name: String,
    pub percent: f64,
    pub monthly: f64,
}

/// Calculate federal income tax using 2024 brackets
pub fn calculate_federal_tax(gross_income: f64) -> f64 {
    // Apply standard deduction
    let taxable_income = (gross_income - STANDARD_DEDUCTION_2024).max(0.0);

    let mut tax = 0.0;
    let mut remaining = taxable_income;

    for bracket in &TAX_BRACKETS_2024 {
        if remaining <= 0.0 {
            break;
        }

        let bracket_width = bracket.max - bracket.min;
        let taxable_in_bracket = remaining.min(bracket_width);

        tax += taxable_in_bracket * bracket.rate;
        remaining -= taxable_in_bracket;
    }

    tax
}

/// Calculate FICA taxes (Social Security + Medicare)
pub fn calculate_fica_tax(gross_income: f64) -> (f64, f64, f64) {
    // Social Security: 6.2% up to wage base
    let ss_taxable = gross_income.min(SS_WAGE_BASE_2024);
    let social_security = ss_taxable * 0.062;

    // Medicare: 1.45% on all income (+ 0.9% additional for high earners, not implemented)
    let medicare = gross_income * 0.0145;

    let total = social_security + medicare;

    (total, social_security, medicare)
}

/// Calculate complete tax breakdown
pub fn calculate_taxes(
    gross_annual: f64,
    deductions: &TaxDeductions,
) -> CalcResult<TaxBreakdown> {
    if gross_annual <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Gross income must be greater than 0".to_string(),
        ));
    }

    // Pre-tax deductions
    let retirement_401k = gross_annual * (deductions.retirement_401k_percent / 100.0);
    let health_insurance = deductions.health_insurance_annual;

    // Adjusted gross income for federal tax
    let agi = gross_annual - retirement_401k - health_insurance - deductions.other_pretax;

    // Federal tax
    let federal_tax = calculate_federal_tax(agi);

    // State tax (simplified - on AGI)
    let state_tax = agi * (deductions.state_tax_rate / 100.0);

    // FICA (on gross, before 401k)
    let (fica_tax, social_security, medicare) = calculate_fica_tax(gross_annual);

    // Total deductions
    let total_deductions = federal_tax + state_tax + fica_tax + retirement_401k + health_insurance + deductions.other_pretax;

    // Net income
    let net_annual = gross_annual - total_deductions;
    let net_monthly = net_annual / 12.0;

    // Effective tax rate (taxes only, not 401k/insurance)
    let tax_only = federal_tax + state_tax + fica_tax;
    let effective_tax_rate = (tax_only / gross_annual) * 100.0;

    Ok(TaxBreakdown {
        gross_annual: gross_annual.round(),
        federal_tax: federal_tax.round(),
        state_tax: state_tax.round(),
        fica_tax: fica_tax.round(),
        social_security: social_security.round(),
        medicare: medicare.round(),
        retirement_401k: retirement_401k.round(),
        health_insurance: health_insurance.round(),
        total_deductions: total_deductions.round(),
        net_annual: net_annual.round(),
        net_monthly: net_monthly.round(),
        effective_tax_rate: (effective_tax_rate * 10.0).round() / 10.0,
    })
}

/// Calculate 50/30/20 budget allocation
pub fn calculate_budget_allocation(net_monthly: f64) -> CalcResult<BudgetAllocation> {
    if net_monthly <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Net monthly income must be greater than 0".to_string(),
        ));
    }

    // 50% Needs
    let needs_monthly = net_monthly * 0.50;
    let needs = BudgetCategory {
        name: "Needs".to_string(),
        percent: 50.0,
        monthly: needs_monthly.round(),
        weekly: (needs_monthly / 4.33).round(),
        daily: (needs_monthly / 30.0).round(),
        subcategories: vec![
            SubCategory {
                name: "Housing".to_string(),
                percent: 25.0,
                monthly: (net_monthly * 0.25).round(),
            },
            SubCategory {
                name: "Utilities".to_string(),
                percent: 5.0,
                monthly: (net_monthly * 0.05).round(),
            },
            SubCategory {
                name: "Groceries".to_string(),
                percent: 10.0,
                monthly: (net_monthly * 0.10).round(),
            },
            SubCategory {
                name: "Transportation".to_string(),
                percent: 10.0,
                monthly: (net_monthly * 0.10).round(),
            },
        ],
    };

    // 30% Wants
    let wants_monthly = net_monthly * 0.30;
    let wants = BudgetCategory {
        name: "Wants".to_string(),
        percent: 30.0,
        monthly: wants_monthly.round(),
        weekly: (wants_monthly / 4.33).round(),
        daily: (wants_monthly / 30.0).round(),
        subcategories: vec![
            SubCategory {
                name: "Dining Out".to_string(),
                percent: 5.0,
                monthly: (net_monthly * 0.05).round(),
            },
            SubCategory {
                name: "Subscriptions".to_string(),
                percent: 5.0,
                monthly: (net_monthly * 0.05).round(),
            },
            SubCategory {
                name: "Travel/Fun".to_string(),
                percent: 10.0,
                monthly: (net_monthly * 0.10).round(),
            },
            SubCategory {
                name: "Personal".to_string(),
                percent: 10.0,
                monthly: (net_monthly * 0.10).round(),
            },
        ],
    };

    // 20% Savings
    let savings_monthly = net_monthly * 0.20;
    let savings = BudgetCategory {
        name: "Savings".to_string(),
        percent: 20.0,
        monthly: savings_monthly.round(),
        weekly: (savings_monthly / 4.33).round(),
        daily: (savings_monthly / 30.0).round(),
        subcategories: vec![
            SubCategory {
                name: "Emergency Fund".to_string(),
                percent: 10.0,
                monthly: (net_monthly * 0.10).round(),
            },
            SubCategory {
                name: "Investments".to_string(),
                percent: 5.0,
                monthly: (net_monthly * 0.05).round(),
            },
            SubCategory {
                name: "Goals".to_string(),
                percent: 5.0,
                monthly: (net_monthly * 0.05).round(),
            },
        ],
    };

    Ok(BudgetAllocation {
        net_monthly: net_monthly.round(),
        needs,
        wants,
        savings,
    })
}

/// Quick reference calculations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuickReference {
    pub daily_budget: f64,
    pub hourly_rate: f64,
    pub emergency_fund_3mo: f64,
    pub emergency_fund_6mo: f64,
}

pub fn calculate_quick_reference(
    net_monthly: f64,
    hours_per_week: f64,
) -> CalcResult<QuickReference> {
    if net_monthly <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Net monthly income must be greater than 0".to_string(),
        ));
    }

    let hours = if hours_per_week <= 0.0 { 40.0 } else { hours_per_week };

    // Needs portion for emergency fund
    let monthly_expenses = net_monthly * 0.50;

    Ok(QuickReference {
        daily_budget: (net_monthly / 30.0).round(),
        hourly_rate: ((net_monthly * 12.0) / (hours * 52.0)).round(),
        emergency_fund_3mo: (monthly_expenses * 3.0).round(),
        emergency_fund_6mo: (monthly_expenses * 6.0).round(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_federal_tax_low_income() {
        // Income below standard deduction = no tax
        let tax = calculate_federal_tax(10000.0);
        assert_eq!(tax, 0.0);
    }

    #[test]
    fn test_federal_tax_middle_income() {
        // $50,000 - $14,600 = $35,400 taxable
        // First $11,600 at 10% = $1,160
        // Remaining $23,800 at 12% = $2,856
        // Total = $4,016
        let tax = calculate_federal_tax(50000.0);
        assert!((tax - 4016.0).abs() < 10.0);
    }

    #[test]
    fn test_fica_calculation() {
        let (total, ss, medicare) = calculate_fica_tax(60000.0);

        // SS: 60000 * 0.062 = 3720
        // Medicare: 60000 * 0.0145 = 870
        assert_eq!(ss, 3720.0);
        assert_eq!(medicare, 870.0);
        assert_eq!(total, 4590.0);
    }

    #[test]
    fn test_fica_wage_base() {
        // Test SS wage base limit
        let (_, ss, _) = calculate_fica_tax(200000.0);

        // SS should be capped at wage base: 168600 * 0.062 = 10,453.20
        assert!((ss - 10453.2).abs() < 1.0);
    }

    #[test]
    fn test_tax_breakdown() {
        let deductions = TaxDeductions {
            retirement_401k_percent: 6.0,
            health_insurance_annual: 2400.0,
            state_tax_rate: 5.0,
            other_pretax: 0.0,
        };

        let result = calculate_taxes(60000.0, &deductions).unwrap();

        assert!(result.net_annual > 0.0);
        assert!(result.net_annual < result.gross_annual);
        assert!(result.federal_tax > 0.0);
        assert!(result.fica_tax > 0.0);
        assert_eq!(result.retirement_401k, 3600.0); // 6% of 60k
    }

    #[test]
    fn test_budget_allocation() {
        let result = calculate_budget_allocation(4000.0).unwrap();

        assert_eq!(result.needs.monthly, 2000.0); // 50%
        assert_eq!(result.wants.monthly, 1200.0); // 30%
        assert_eq!(result.savings.monthly, 800.0); // 20%

        // Verify subcategories
        assert_eq!(result.needs.subcategories.len(), 4);
        assert_eq!(result.wants.subcategories.len(), 4);
        assert_eq!(result.savings.subcategories.len(), 3);
    }

    #[test]
    fn test_quick_reference() {
        let result = calculate_quick_reference(4000.0, 40.0).unwrap();

        assert!((result.daily_budget - 133.0).abs() < 1.0);
        assert!((result.hourly_rate - 23.0).abs() < 1.0);
        assert_eq!(result.emergency_fund_3mo, 6000.0); // 50% * 4000 * 3
        assert_eq!(result.emergency_fund_6mo, 12000.0);
    }
}
