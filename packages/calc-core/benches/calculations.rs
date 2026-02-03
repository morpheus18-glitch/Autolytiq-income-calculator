//! Benchmarks for calculation performance

use criterion::{black_box, criterion_group, criterion_main, Criterion};
use calc_core::{income, auto, housing, budget};

fn bench_income_calculation(c: &mut Criterion) {
    let input = income::IncomeInput {
        ytd_income: 50000.0,
        start_date: "2024-01-01".to_string(),
        check_date: "2024-06-30".to_string(),
    };

    c.bench_function("income_calculation", |b| {
        b.iter(|| income::calculate_income(black_box(&input)))
    });
}

fn bench_loan_amount(c: &mut Criterion) {
    c.bench_function("loan_amount", |b| {
        b.iter(|| auto::calculate_loan_amount(black_box(600.0), black_box(5.99), black_box(60)))
    });
}

fn bench_monthly_payment(c: &mut Criterion) {
    c.bench_function("monthly_payment", |b| {
        b.iter(|| auto::calculate_monthly_payment(black_box(30000.0), black_box(5.99), black_box(60)))
    });
}

fn bench_amortization_schedule(c: &mut Criterion) {
    c.bench_function("amortization_60_months", |b| {
        b.iter(|| auto::generate_amortization_schedule(black_box(30000.0), black_box(5.99), black_box(60)))
    });

    c.bench_function("amortization_360_months", |b| {
        b.iter(|| housing::generate_mortgage_schedule(black_box(300000.0), black_box(6.5), black_box(30)))
    });
}

fn bench_mortgage_calculation(c: &mut Criterion) {
    c.bench_function("mortgage_piti", |b| {
        b.iter(|| housing::calculate_mortgage(
            black_box(400000.0),
            black_box(20.0),
            black_box(6.5),
            black_box(30),
            black_box(1.2),
            black_box(1500.0)
        ))
    });
}

fn bench_dti_calculation(c: &mut Criterion) {
    c.bench_function("dti_analysis", |b| {
        b.iter(|| housing::calculate_dti(
            black_box(8000.0),
            black_box(2000.0),
            black_box(500.0)
        ))
    });
}

fn bench_federal_tax(c: &mut Criterion) {
    c.bench_function("federal_tax_50k", |b| {
        b.iter(|| budget::calculate_federal_tax(black_box(50000.0)))
    });

    c.bench_function("federal_tax_150k", |b| {
        b.iter(|| budget::calculate_federal_tax(black_box(150000.0)))
    });
}

fn bench_full_tax_breakdown(c: &mut Criterion) {
    let deductions = budget::TaxDeductions {
        retirement_401k_percent: 6.0,
        health_insurance_annual: 2400.0,
        state_tax_rate: 5.0,
        other_pretax: 0.0,
    };

    c.bench_function("full_tax_breakdown", |b| {
        b.iter(|| budget::calculate_taxes(black_box(75000.0), black_box(&deductions)))
    });
}

fn bench_budget_allocation(c: &mut Criterion) {
    c.bench_function("budget_allocation", |b| {
        b.iter(|| budget::calculate_budget_allocation(black_box(4000.0)))
    });
}

fn bench_loan_estimates(c: &mut Criterion) {
    c.bench_function("loan_estimates_all_tiers", |b| {
        b.iter(|| auto::calculate_loan_estimates(black_box(600.0), black_box(60)))
    });
}

criterion_group!(
    benches,
    bench_income_calculation,
    bench_loan_amount,
    bench_monthly_payment,
    bench_amortization_schedule,
    bench_mortgage_calculation,
    bench_dti_calculation,
    bench_federal_tax,
    bench_full_tax_breakdown,
    bench_budget_allocation,
    bench_loan_estimates,
);

criterion_main!(benches);
