package calc

import (
	"math"
	"testing"
	"time"
)

func TestCalculateIncome(t *testing.T) {
	// Test case: $50,000 YTD from Jan 1 to June 30 (181 days)
	startDate := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	checkDate := time.Date(2024, 6, 30, 0, 0, 0, 0, time.UTC)

	result, err := CalculateIncome(50000, startDate, checkDate)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.DaysWorked != 182 {
		t.Errorf("expected 182 days worked, got %d", result.DaysWorked)
	}

	// Expected annual: (50000 / 182) * 365 = ~100,274
	expectedAnnual := int(math.Round((50000.0 / 182.0) * 365.0))
	if result.GrossAnnual != expectedAnnual {
		t.Errorf("expected gross annual %d, got %d", expectedAnnual, result.GrossAnnual)
	}
}

func TestCalculateIncome_ErrorCase(t *testing.T) {
	// Check date before start date should error
	startDate := time.Date(2024, 6, 30, 0, 0, 0, 0, time.UTC)
	checkDate := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)

	_, err := CalculateIncome(50000, startDate, checkDate)
	if err == nil {
		t.Error("expected error when check date is before start date")
	}
}

func TestCalculateLoanAmount(t *testing.T) {
	tests := []struct {
		name           string
		monthlyPayment float64
		annualRate     float64
		termMonths     int
		wantApprox     int
	}{
		{
			name:           "typical auto loan",
			monthlyPayment: 500,
			annualRate:     6.0,
			termMonths:     60,
			wantApprox:     25863, // ~$25,863
		},
		{
			name:           "zero interest",
			monthlyPayment: 500,
			annualRate:     0,
			termMonths:     60,
			wantApprox:     30000, // $500 * 60
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateLoanAmount(tt.monthlyPayment, tt.annualRate, tt.termMonths)
			// Allow 1% tolerance for rounding
			tolerance := float64(tt.wantApprox) * 0.01
			if math.Abs(float64(got-tt.wantApprox)) > tolerance {
				t.Errorf("CalculateLoanAmount() = %d, want ~%d", got, tt.wantApprox)
			}
		})
	}
}

func TestCalculateMonthlyPayment(t *testing.T) {
	tests := []struct {
		name       string
		principal  float64
		annualRate float64
		termMonths int
		wantApprox int
	}{
		{
			name:       "typical auto loan",
			principal:  25000,
			annualRate: 6.0,
			termMonths: 60,
			wantApprox: 483, // ~$483
		},
		{
			name:       "zero interest",
			principal:  30000,
			annualRate: 0,
			termMonths: 60,
			wantApprox: 500, // $30,000 / 60
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateMonthlyPayment(tt.principal, tt.annualRate, tt.termMonths)
			// Allow $5 tolerance for rounding
			if math.Abs(float64(got-tt.wantApprox)) > 5 {
				t.Errorf("CalculateMonthlyPayment() = %d, want ~%d", got, tt.wantApprox)
			}
		})
	}
}

func TestCalculateMortgage(t *testing.T) {
	result := CalculateMortgage(
		400000, // home price
		20,     // down payment percent
		6.5,    // interest rate
		30,     // term years
		1.2,    // property tax rate
		1500,   // annual insurance
	)

	// Verify down payment
	if result.DownPayment != 80000 {
		t.Errorf("expected down payment 80000, got %d", result.DownPayment)
	}

	// Verify loan amount
	if result.LoanAmount != 320000 {
		t.Errorf("expected loan amount 320000, got %d", result.LoanAmount)
	}

	// PMI should be 0 since down payment is 20%
	if result.PITI.PMI != 0 {
		t.Errorf("expected PMI 0 for 20%% down, got %d", result.PITI.PMI)
	}

	// Verify total monthly is sum of components
	expectedTotal := result.PITI.PrincipalInterest + result.PITI.PropertyTax +
		result.PITI.Insurance + result.PITI.PMI
	if result.PITI.TotalMonthly != expectedTotal {
		t.Errorf("total monthly %d doesn't match sum of components %d",
			result.PITI.TotalMonthly, expectedTotal)
	}
}

func TestCalculateMortgage_WithPMI(t *testing.T) {
	result := CalculateMortgage(
		400000, // home price
		10,     // down payment percent (less than 20%)
		6.5,    // interest rate
		30,     // term years
		1.2,    // property tax rate
		1500,   // annual insurance
	)

	// PMI should be present since down payment is less than 20%
	if result.PITI.PMI == 0 {
		t.Error("expected PMI > 0 for 10% down payment")
	}
}

func TestCalculateTaxes(t *testing.T) {
	result := CalculateTaxes(
		100000, // gross annual
		6,      // 401k contribution %
		3600,   // health insurance annual
		5,      // state tax rate %
	)

	// Verify gross annual
	if result.GrossAnnual != 100000 {
		t.Errorf("expected gross annual 100000, got %d", result.GrossAnnual)
	}

	// Verify 401k deduction
	expected401k := 6000 // 6% of 100000
	if result.Retirement401k != expected401k {
		t.Errorf("expected 401k %d, got %d", expected401k, result.Retirement401k)
	}

	// Verify health insurance
	if result.HealthInsurance != 3600 {
		t.Errorf("expected health insurance 3600, got %d", result.HealthInsurance)
	}

	// Verify FICA components add up
	expectedFICA := result.SocialSecurity + result.Medicare
	if result.FICATax != expectedFICA {
		t.Errorf("FICA %d doesn't match SS + Medicare %d", result.FICATax, expectedFICA)
	}

	// Verify net annual is consistent
	expectedNet := result.GrossAnnual - result.TotalDeductions
	if result.NetAnnual != expectedNet {
		t.Errorf("net annual %d doesn't match gross - deductions %d",
			result.NetAnnual, expectedNet)
	}

	// Verify net monthly is within rounding tolerance of net annual / 12
	expectedNetMonthly := int(math.Round(float64(result.NetAnnual) / 12))
	if result.NetMonthly != expectedNetMonthly {
		t.Errorf("net monthly %d doesn't match net annual / 12 %d",
			result.NetMonthly, expectedNetMonthly)
	}
}

func TestCalculateTaxes_HighIncome(t *testing.T) {
	// Test with income above SS wage base
	result := CalculateTaxes(
		200000, // gross annual (above SS wage base of 168,600)
		0,      // no 401k
		0,      // no health insurance
		0,      // no state tax
	)

	// Social security should be capped at SS wage base
	expectedSS := int(math.Round(168600.0 * 0.062))
	if result.SocialSecurity != expectedSS {
		t.Errorf("expected SS capped at %d, got %d", expectedSS, result.SocialSecurity)
	}
}

func TestCalculateBudgetAllocation(t *testing.T) {
	result := CalculateBudgetAllocation(5000)

	// Verify net monthly
	if result.NetMonthly != 5000 {
		t.Errorf("expected net monthly 5000, got %d", result.NetMonthly)
	}

	// Verify 50/30/20 split
	if result.Needs.Percent != 50 {
		t.Errorf("expected needs percent 50, got %d", result.Needs.Percent)
	}
	if result.Wants.Percent != 30 {
		t.Errorf("expected wants percent 30, got %d", result.Wants.Percent)
	}
	if result.Savings.Percent != 20 {
		t.Errorf("expected savings percent 20, got %d", result.Savings.Percent)
	}

	// Verify monthly allocations
	if result.Needs.Monthly != 2500 {
		t.Errorf("expected needs monthly 2500, got %d", result.Needs.Monthly)
	}
	if result.Wants.Monthly != 1500 {
		t.Errorf("expected wants monthly 1500, got %d", result.Wants.Monthly)
	}
	if result.Savings.Monthly != 1000 {
		t.Errorf("expected savings monthly 1000, got %d", result.Savings.Monthly)
	}

	// Verify subcategories are present
	if len(result.Needs.Subcategories) != 4 {
		t.Errorf("expected 4 needs subcategories, got %d", len(result.Needs.Subcategories))
	}
	if len(result.Wants.Subcategories) != 4 {
		t.Errorf("expected 4 wants subcategories, got %d", len(result.Wants.Subcategories))
	}
	if len(result.Savings.Subcategories) != 3 {
		t.Errorf("expected 3 savings subcategories, got %d", len(result.Savings.Subcategories))
	}
}

// Verify loan amount and monthly payment are inverse operations
func TestLoanCalculations_Roundtrip(t *testing.T) {
	principal := 25000.0
	rate := 6.0
	term := 60

	// Calculate monthly payment
	payment := CalculateMonthlyPayment(principal, rate, term)

	// Calculate loan amount from that payment
	calculatedPrincipal := CalculateLoanAmount(float64(payment), rate, term)

	// Should be within $100 due to rounding
	if math.Abs(float64(calculatedPrincipal)-principal) > 100 {
		t.Errorf("roundtrip failed: original principal %.0f, calculated %d",
			principal, calculatedPrincipal)
	}
}
