//! Rhai scripting engine for versioned formulas
//!
//! This module provides a scripting engine for defining and running
//! custom calculation formulas. This allows for:
//! - Formula versioning
//! - User-defined calculations
//! - A/B testing different calculation methods
//! - Hot-reloading formulas without recompilation

use rhai::{Engine, EvalAltResult, Scope, AST};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::{CalcError, CalcResult};

/// A versioned formula definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Formula {
    pub name: String,
    pub version: String,
    pub description: String,
    pub script: String,
    pub inputs: Vec<FormulaInput>,
    pub output_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormulaInput {
    pub name: String,
    pub input_type: String,
    pub description: String,
    pub default: Option<f64>,
}

/// Result from executing a formula
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormulaResult {
    pub value: f64,
    pub formula_name: String,
    pub formula_version: String,
    pub inputs: HashMap<String, f64>,
}

/// The formula engine for executing Rhai scripts
pub struct FormulaEngine {
    engine: Engine,
    formulas: HashMap<String, (Formula, AST)>,
}

impl Default for FormulaEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl FormulaEngine {
    /// Create a new formula engine with built-in functions
    pub fn new() -> Self {
        let mut engine = Engine::new();

        // Add financial calculation functions
        engine.register_fn("pmt", pmt);
        engine.register_fn("pv", pv);
        engine.register_fn("fv", fv);
        engine.register_fn("rate", nper_rate);
        engine.register_fn("round", round_to);
        engine.register_fn("min", f64::min);
        engine.register_fn("max", f64::max);
        engine.register_fn("abs", f64::abs);
        engine.register_fn("pow", f64::powf);
        engine.register_fn("sqrt", f64::sqrt);
        engine.register_fn("floor", f64::floor);
        engine.register_fn("ceil", f64::ceil);

        Self {
            engine,
            formulas: HashMap::new(),
        }
    }

    /// Register a formula for later execution
    pub fn register_formula(&mut self, formula: Formula) -> CalcResult<()> {
        let ast = self.engine.compile(&formula.script).map_err(|e| {
            CalcError::FormulaError(format!(
                "Failed to compile formula '{}': {}",
                formula.name, e
            ))
        })?;

        self.formulas.insert(formula.name.clone(), (formula, ast));
        Ok(())
    }

    /// Execute a registered formula with given inputs
    pub fn execute(
        &self,
        formula_name: &str,
        inputs: HashMap<String, f64>,
    ) -> CalcResult<FormulaResult> {
        let (formula, ast) = self.formulas.get(formula_name).ok_or_else(|| {
            CalcError::FormulaError(format!("Formula '{}' not found", formula_name))
        })?;

        let mut scope = Scope::new();

        // Add inputs to scope
        for (name, value) in &inputs {
            scope.push(name.clone(), *value);
        }

        // Add defaults for missing inputs
        for input in &formula.inputs {
            if !inputs.contains_key(&input.name) {
                if let Some(default) = input.default {
                    scope.push(input.name.clone(), default);
                } else {
                    return Err(CalcError::FormulaError(format!(
                        "Missing required input: {}",
                        input.name
                    )));
                }
            }
        }

        let result: f64 = self.engine.eval_ast_with_scope(&mut scope, ast).map_err(
            |e: Box<EvalAltResult>| CalcError::FormulaError(format!("Execution error: {}", e)),
        )?;

        Ok(FormulaResult {
            value: result,
            formula_name: formula.name.clone(),
            formula_version: formula.version.clone(),
            inputs,
        })
    }

    /// Execute a one-off script without registering
    pub fn eval(&self, script: &str, inputs: HashMap<String, f64>) -> CalcResult<f64> {
        let mut scope = Scope::new();

        for (name, value) in inputs {
            scope.push(name, value);
        }

        self.engine
            .eval_with_scope::<f64>(&mut scope, script)
            .map_err(|e| CalcError::FormulaError(format!("Eval error: {}", e)))
    }

    /// Get a registered formula by name
    pub fn get_formula(&self, name: &str) -> Option<&Formula> {
        self.formulas.get(name).map(|(f, _)| f)
    }

    /// List all registered formulas
    pub fn list_formulas(&self) -> Vec<&Formula> {
        self.formulas.values().map(|(f, _)| f).collect()
    }
}

// Financial functions for Rhai

/// PMT - Payment calculation for a loan
/// pmt(rate, nper, pv) = pv * (rate * (1 + rate)^nper) / ((1 + rate)^nper - 1)
fn pmt(rate: f64, nper: f64, pv: f64) -> f64 {
    if rate == 0.0 {
        return pv / nper;
    }
    let factor = (1.0 + rate).powf(nper);
    pv * (rate * factor) / (factor - 1.0)
}

/// PV - Present value calculation
/// pv(rate, nper, pmt) = pmt * ((1 - (1 + rate)^-nper) / rate)
fn pv(rate: f64, nper: f64, payment: f64) -> f64 {
    if rate == 0.0 {
        return payment * nper;
    }
    payment * ((1.0 - (1.0 + rate).powf(-nper)) / rate)
}

/// FV - Future value calculation
/// fv(rate, nper, pmt, pv) = pv * (1 + rate)^nper + pmt * (((1 + rate)^nper - 1) / rate)
fn fv(rate: f64, nper: f64, payment: f64, present_value: f64) -> f64 {
    if rate == 0.0 {
        return present_value + payment * nper;
    }
    let factor = (1.0 + rate).powf(nper);
    present_value * factor + payment * ((factor - 1.0) / rate)
}

/// Approximate rate calculation (simplified)
fn nper_rate(nper: f64, pmt: f64, pv: f64) -> f64 {
    // Newton-Raphson approximation
    let mut rate = 0.1 / 12.0; // Initial guess

    for _ in 0..100 {
        let factor = (1.0 + rate).powf(nper);
        let pmt_calc = pv * (rate * factor) / (factor - 1.0);
        let diff = pmt_calc - pmt;

        if diff.abs() < 0.0001 {
            break;
        }

        // Derivative approximation
        let h = 0.0001;
        let factor_h = (1.0 + rate + h).powf(nper);
        let pmt_h = pv * ((rate + h) * factor_h) / (factor_h - 1.0);
        let derivative = (pmt_h - pmt_calc) / h;

        if derivative.abs() > 0.0001 {
            rate -= diff / derivative;
        }

        // Clamp rate to reasonable range
        rate = rate.clamp(0.0001, 1.0);
    }

    rate
}

/// Round to specified decimal places
fn round_to(value: f64, decimals: i64) -> f64 {
    let factor = 10_f64.powi(decimals as i32);
    (value * factor).round() / factor
}

/// Built-in formula definitions
pub fn default_formulas() -> Vec<Formula> {
    vec![
        Formula {
            name: "income_projection".to_string(),
            version: "1.0.0".to_string(),
            description: "Project annual income from YTD earnings".to_string(),
            script: r#"
                let daily = ytd_income / days_worked;
                let annual = daily * 365.0;
                round(annual, 0)
            "#.to_string(),
            inputs: vec![
                FormulaInput {
                    name: "ytd_income".to_string(),
                    input_type: "number".to_string(),
                    description: "Year-to-date gross income".to_string(),
                    default: None,
                },
                FormulaInput {
                    name: "days_worked".to_string(),
                    input_type: "number".to_string(),
                    description: "Number of days worked in period".to_string(),
                    default: None,
                },
            ],
            output_type: "number".to_string(),
        },
        Formula {
            name: "loan_payment".to_string(),
            version: "1.0.0".to_string(),
            description: "Calculate monthly loan payment".to_string(),
            script: r#"
                let monthly_rate = apr / 100.0 / 12.0;
                round(pmt(monthly_rate, term_months, principal), 2)
            "#.to_string(),
            inputs: vec![
                FormulaInput {
                    name: "principal".to_string(),
                    input_type: "number".to_string(),
                    description: "Loan principal amount".to_string(),
                    default: None,
                },
                FormulaInput {
                    name: "apr".to_string(),
                    input_type: "number".to_string(),
                    description: "Annual percentage rate".to_string(),
                    default: Some(6.0),
                },
                FormulaInput {
                    name: "term_months".to_string(),
                    input_type: "number".to_string(),
                    description: "Loan term in months".to_string(),
                    default: Some(60.0),
                },
            ],
            output_type: "number".to_string(),
        },
        Formula {
            name: "pti_max_payment".to_string(),
            version: "1.0.0".to_string(),
            description: "Calculate maximum payment based on PTI ratio".to_string(),
            script: r#"
                round(monthly_income * pti_ratio, 0)
            "#.to_string(),
            inputs: vec![
                FormulaInput {
                    name: "monthly_income".to_string(),
                    input_type: "number".to_string(),
                    description: "Monthly gross income".to_string(),
                    default: None,
                },
                FormulaInput {
                    name: "pti_ratio".to_string(),
                    input_type: "number".to_string(),
                    description: "Payment-to-income ratio (e.g., 0.12 for 12%)".to_string(),
                    default: Some(0.12),
                },
            ],
            output_type: "number".to_string(),
        },
        Formula {
            name: "dti_ratio".to_string(),
            version: "1.0.0".to_string(),
            description: "Calculate debt-to-income ratio".to_string(),
            script: r#"
                round((total_debt / monthly_income) * 100.0, 1)
            "#.to_string(),
            inputs: vec![
                FormulaInput {
                    name: "monthly_income".to_string(),
                    input_type: "number".to_string(),
                    description: "Monthly gross income".to_string(),
                    default: None,
                },
                FormulaInput {
                    name: "total_debt".to_string(),
                    input_type: "number".to_string(),
                    description: "Total monthly debt payments".to_string(),
                    default: None,
                },
            ],
            output_type: "number".to_string(),
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_formula_engine_creation() {
        let engine = FormulaEngine::new();
        assert!(engine.formulas.is_empty());
    }

    #[test]
    fn test_register_and_execute() {
        let mut engine = FormulaEngine::new();

        let formula = Formula {
            name: "simple_add".to_string(),
            version: "1.0.0".to_string(),
            description: "Add two numbers".to_string(),
            script: "a + b".to_string(),
            inputs: vec![
                FormulaInput {
                    name: "a".to_string(),
                    input_type: "number".to_string(),
                    description: "First number".to_string(),
                    default: None,
                },
                FormulaInput {
                    name: "b".to_string(),
                    input_type: "number".to_string(),
                    description: "Second number".to_string(),
                    default: None,
                },
            ],
            output_type: "number".to_string(),
        };

        engine.register_formula(formula).unwrap();

        let mut inputs = HashMap::new();
        inputs.insert("a".to_string(), 10.0);
        inputs.insert("b".to_string(), 20.0);

        let result = engine.execute("simple_add", inputs).unwrap();
        assert_eq!(result.value, 30.0);
    }

    #[test]
    fn test_pmt_function() {
        // $30,000 loan at 6% for 60 months
        let payment = pmt(0.06 / 12.0, 60.0, 30000.0);
        // Should be approximately $580
        assert!(payment > 575.0 && payment < 585.0);
    }

    #[test]
    fn test_pv_function() {
        // $500/month at 6% for 60 months
        let present = pv(0.06 / 12.0, 60.0, 500.0);
        // Should be approximately $25,862
        assert!(present > 25000.0 && present < 26500.0);
    }

    #[test]
    fn test_default_formulas() {
        let mut engine = FormulaEngine::new();

        for formula in default_formulas() {
            engine.register_formula(formula).unwrap();
        }

        // Test income projection
        let mut inputs = HashMap::new();
        inputs.insert("ytd_income".to_string(), 50000.0);
        inputs.insert("days_worked".to_string(), 182.0);

        let result = engine.execute("income_projection", inputs).unwrap();
        let expected = (50000.0 / 182.0) * 365.0;
        assert!((result.value - expected.round()).abs() < 1.0);
    }

    #[test]
    fn test_eval_one_off() {
        let engine = FormulaEngine::new();

        let mut inputs = HashMap::new();
        inputs.insert("x".to_string(), 5.0);

        let result = engine.eval("x * x + 10.0", inputs).unwrap();
        assert_eq!(result, 35.0);
    }
}
