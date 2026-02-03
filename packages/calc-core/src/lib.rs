//! Autolytiq Calculation Core
//!
//! This crate provides the core calculation engine for financial calculations:
//! - Income projections from YTD earnings
//! - Auto loan PTI (Payment-to-Income) calculations
//! - Housing affordability (DTI, PITI, mortgage payments)
//! - Budget allocation with tax calculations
//!
//! The calculations are designed to produce identical results to the JavaScript
//! implementations for seamless migration and validation.

pub mod income;
pub mod auto;
pub mod housing;
pub mod budget;
pub mod formulas;

pub use income::*;
pub use auto::*;
pub use housing::*;
pub use budget::*;
pub use formulas::FormulaEngine;

use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Errors that can occur during calculations
#[derive(Error, Debug, Serialize, Deserialize)]
pub enum CalcError {
    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Division by zero")]
    DivisionByZero,

    #[error("Calculation overflow")]
    Overflow,

    #[error("Formula error: {0}")]
    FormulaError(String),
}

pub type CalcResult<T> = Result<T, CalcError>;

/// Format a number as USD currency (no decimals)
pub fn format_currency(amount: f64) -> String {
    let rounded = amount.round() as i64;
    let formatted = if rounded.abs() >= 1_000_000 {
        format!("${:.2}M", rounded as f64 / 1_000_000.0)
    } else if rounded.abs() >= 1_000 {
        // Add commas
        let s = rounded.abs().to_string();
        let mut result = String::new();
        for (i, c) in s.chars().rev().enumerate() {
            if i > 0 && i % 3 == 0 {
                result.push(',');
            }
            result.push(c);
        }
        let formatted: String = result.chars().rev().collect();
        if rounded < 0 {
            format!("-${}", formatted)
        } else {
            format!("${}", formatted)
        }
    } else {
        format!("${}", rounded)
    };
    formatted
}

/// Format a ratio as a percentage
pub fn format_percent(ratio: f64) -> String {
    format!("{:.0}%", ratio * 100.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_currency() {
        assert_eq!(format_currency(1234.0), "$1,234");
        assert_eq!(format_currency(1000000.0), "$1.00M");
        assert_eq!(format_currency(50.0), "$50");
        assert_eq!(format_currency(999.5), "$1,000"); // rounds up
    }

    #[test]
    fn test_format_percent() {
        assert_eq!(format_percent(0.12), "12%");
        assert_eq!(format_percent(0.305), "31%"); // rounds
    }
}
