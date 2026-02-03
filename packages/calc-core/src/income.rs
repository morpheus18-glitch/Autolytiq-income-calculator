//! Income calculation module
//!
//! Calculates annual income projections from YTD (Year-to-Date) earnings.
//! This is the core calculation that powers the income calculator.

use serde::{Deserialize, Serialize};
use crate::{CalcError, CalcResult};

/// Input data for income calculation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncomeInput {
    /// Year-to-date gross income
    pub ytd_income: f64,
    /// Start date of employment or beginning of year (whichever is later)
    pub start_date: String, // ISO 8601 format: YYYY-MM-DD
    /// Date of the most recent paycheck
    pub check_date: String, // ISO 8601 format: YYYY-MM-DD
}

/// Calculated income data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncomeData {
    /// Projected gross annual income
    pub gross_annual: f64,
    /// Monthly gross income (annual / 12)
    pub gross_monthly: f64,
    /// Weekly gross income (annual / 52)
    pub gross_weekly: f64,
    /// Daily gross income (ytd / days_worked)
    pub gross_daily: f64,
    /// Number of days worked (used for projection)
    pub days_worked: i64,
    /// Maximum recommended auto payment (12% of monthly)
    pub max_auto_payment: f64,
    /// Maximum recommended rent (30% of monthly)
    pub max_rent: f64,
}

/// Parse an ISO 8601 date string (YYYY-MM-DD) into components
fn parse_date(date_str: &str) -> CalcResult<(i32, u32, u32)> {
    let parts: Vec<&str> = date_str.split('-').collect();
    if parts.len() != 3 {
        return Err(CalcError::InvalidInput(format!(
            "Invalid date format: {}. Expected YYYY-MM-DD",
            date_str
        )));
    }

    let year = parts[0]
        .parse::<i32>()
        .map_err(|_| CalcError::InvalidInput(format!("Invalid year: {}", parts[0])))?;
    let month = parts[1]
        .parse::<u32>()
        .map_err(|_| CalcError::InvalidInput(format!("Invalid month: {}", parts[1])))?;
    let day = parts[2]
        .parse::<u32>()
        .map_err(|_| CalcError::InvalidInput(format!("Invalid day: {}", parts[2])))?;

    Ok((year, month, day))
}

/// Calculate days between two dates (inclusive)
fn days_between(start: (i32, u32, u32), end: (i32, u32, u32)) -> i64 {
    // Simple day calculation using Julian day numbers
    fn to_julian(year: i32, month: u32, day: u32) -> i64 {
        let a = (14 - month as i64) / 12;
        let y = year as i64 + 4800 - a;
        let m = month as i64 + 12 * a - 3;
        day as i64 + (153 * m + 2) / 5 + 365 * y + y / 4 - y / 100 + y / 400 - 32045
    }

    let start_julian = to_julian(start.0, start.1, start.2);
    let end_julian = to_julian(end.0, end.1, end.2);

    end_julian - start_julian + 1 // +1 for inclusive
}

/// Calculate income projection from YTD data
///
/// This mirrors the JavaScript implementation in use-income.ts:
/// - Calculates days worked from effective start to check date
/// - Projects annual income: daily * 365
/// - Derives monthly (annual/12), weekly (annual/52)
/// - Calculates max auto payment (12%) and max rent (30%)
pub fn calculate_income(input: &IncomeInput) -> CalcResult<IncomeData> {
    // Validate YTD income
    if input.ytd_income <= 0.0 {
        return Err(CalcError::InvalidInput(
            "YTD income must be greater than 0".to_string(),
        ));
    }

    // Parse dates
    let start = parse_date(&input.start_date)?;
    let check = parse_date(&input.check_date)?;

    // Determine effective start (later of start date or Jan 1 of check year)
    let year_start = (check.0, 1, 1);
    let effective_start = if start.0 < year_start.0
        || (start.0 == year_start.0 && start.1 < year_start.1)
        || (start.0 == year_start.0 && start.1 == year_start.1 && start.2 < year_start.2)
    {
        year_start
    } else {
        start
    };

    // Calculate days worked
    let days = days_between(effective_start, check);
    if days <= 0 {
        return Err(CalcError::InvalidInput(
            "Check date must be after start date".to_string(),
        ));
    }

    // Calculate income metrics
    let daily = input.ytd_income / days as f64;
    let annual = daily * 365.0;
    let monthly = annual / 12.0;
    let weekly = annual / 52.0;

    Ok(IncomeData {
        gross_annual: annual.round(),
        gross_monthly: monthly.round(),
        gross_weekly: weekly.round(),
        gross_daily: daily.round(),
        days_worked: days,
        max_auto_payment: (monthly * 0.12).round(),
        max_rent: (monthly * 0.30).round(),
    })
}

/// Calculate income from manual monthly input
pub fn income_from_monthly(monthly_income: f64) -> CalcResult<IncomeData> {
    if monthly_income <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Monthly income must be greater than 0".to_string(),
        ));
    }

    let annual = monthly_income * 12.0;
    let weekly = annual / 52.0;
    let daily = annual / 365.0;

    Ok(IncomeData {
        gross_annual: annual.round(),
        gross_monthly: monthly_income.round(),
        gross_weekly: weekly.round(),
        gross_daily: daily.round(),
        days_worked: 0, // Manual input doesn't track days
        max_auto_payment: (monthly_income * 0.12).round(),
        max_rent: (monthly_income * 0.30).round(),
    })
}

/// Calculate income from annual salary
pub fn income_from_annual(annual_income: f64) -> CalcResult<IncomeData> {
    if annual_income <= 0.0 {
        return Err(CalcError::InvalidInput(
            "Annual income must be greater than 0".to_string(),
        ));
    }

    let monthly = annual_income / 12.0;
    let weekly = annual_income / 52.0;
    let daily = annual_income / 365.0;

    Ok(IncomeData {
        gross_annual: annual_income.round(),
        gross_monthly: monthly.round(),
        gross_weekly: weekly.round(),
        gross_daily: daily.round(),
        days_worked: 0, // Manual input doesn't track days
        max_auto_payment: (monthly * 0.12).round(),
        max_rent: (monthly * 0.30).round(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_income_calculation() {
        let input = IncomeInput {
            ytd_income: 50000.0,
            start_date: "2024-01-01".to_string(),
            check_date: "2024-06-30".to_string(),
        };

        let result = calculate_income(&input).unwrap();

        // 182 days from Jan 1 to Jun 30 (inclusive)
        assert_eq!(result.days_worked, 182);

        // Daily = 50000 / 182 = ~274.73
        let expected_daily = 50000.0 / 182.0;
        let expected_annual = expected_daily * 365.0;

        assert!((result.gross_annual - expected_annual.round()).abs() < 1.0);
    }

    #[test]
    fn test_income_from_monthly() {
        let result = income_from_monthly(5000.0).unwrap();
        assert_eq!(result.gross_annual, 60000.0);
        assert_eq!(result.gross_monthly, 5000.0);
        assert_eq!(result.max_auto_payment, 600.0); // 12%
        assert_eq!(result.max_rent, 1500.0); // 30%
    }

    #[test]
    fn test_income_from_annual() {
        let result = income_from_annual(60000.0).unwrap();
        assert_eq!(result.gross_monthly, 5000.0);
        assert_eq!(result.max_auto_payment, 600.0);
    }

    #[test]
    fn test_invalid_ytd() {
        let input = IncomeInput {
            ytd_income: -1000.0,
            start_date: "2024-01-01".to_string(),
            check_date: "2024-06-30".to_string(),
        };
        assert!(calculate_income(&input).is_err());
    }

    #[test]
    fn test_start_before_year() {
        // If employment started in previous year, use Jan 1
        let input = IncomeInput {
            ytd_income: 50000.0,
            start_date: "2023-06-01".to_string(),
            check_date: "2024-06-30".to_string(),
        };

        let result = calculate_income(&input).unwrap();
        // Should use Jan 1, 2024 as effective start
        assert_eq!(result.days_worked, 182);
    }
}
