// Package calc provides financial calculation functions for income projection,
// loan amortization, mortgage calculations, tax breakdowns, and budget allocation.
package calc

import (
	"errors"
	"math"
	"time"
)

// IncomeData represents projected income calculations from YTD data.
type IncomeData struct {
	GrossAnnual    int `json:"gross_annual"`
	GrossMonthly   int `json:"gross_monthly"`
	GrossWeekly    int `json:"gross_weekly"`
	GrossDaily     int `json:"gross_daily"`
	DaysWorked     int `json:"days_worked"`
	MaxAutoPayment int `json:"max_auto_payment"`
	MaxRent        int `json:"max_rent"`
}

// PITIBreakdown represents the Principal, Interest, Taxes, and Insurance breakdown.
type PITIBreakdown struct {
	PrincipalInterest int `json:"principal_interest"`
	PropertyTax       int `json:"property_tax"`
	Insurance         int `json:"insurance"`
	PMI               int `json:"pmi"`
	TotalMonthly      int `json:"total_monthly"`
}

// MortgageResult represents the full mortgage calculation result.
type MortgageResult struct {
	HomePrice          float64       `json:"home_price"`
	DownPayment        int           `json:"down_payment"`
	DownPaymentPercent float64       `json:"down_payment_percent"`
	LoanAmount         int           `json:"loan_amount"`
	InterestRate       float64       `json:"interest_rate"`
	TermYears          int           `json:"term_years"`
	PITI               PITIBreakdown `json:"piti"`
	TotalPayments      int           `json:"total_payments"`
	TotalInterest      int           `json:"total_interest"`
}

// TaxBreakdown represents the federal, state, and FICA tax calculations.
type TaxBreakdown struct {
	GrossAnnual      int     `json:"gross_annual"`
	FederalTax       int     `json:"federal_tax"`
	StateTax         int     `json:"state_tax"`
	FICATax          int     `json:"fica_tax"`
	SocialSecurity   int     `json:"social_security"`
	Medicare         int     `json:"medicare"`
	Retirement401k   int     `json:"retirement_401k"`
	HealthInsurance  int     `json:"health_insurance"`
	TotalDeductions  int     `json:"total_deductions"`
	NetAnnual        int     `json:"net_annual"`
	NetMonthly       int     `json:"net_monthly"`
	EffectiveTaxRate float64 `json:"effective_tax_rate"`
}

// Subcategory represents a budget subcategory allocation.
type Subcategory struct {
	Name    string `json:"name"`
	Percent int    `json:"percent"`
	Monthly int    `json:"monthly"`
}

// BudgetCategory represents a main budget category (needs, wants, or savings).
type BudgetCategory struct {
	Name          string        `json:"name"`
	Percent       int           `json:"percent"`
	Monthly       int           `json:"monthly"`
	Weekly        int           `json:"weekly"`
	Daily         int           `json:"daily"`
	Subcategories []Subcategory `json:"subcategories"`
}

// BudgetAllocation represents the 50/30/20 budget allocation.
type BudgetAllocation struct {
	NetMonthly int            `json:"net_monthly"`
	Needs      BudgetCategory `json:"needs"`
	Wants      BudgetCategory `json:"wants"`
	Savings    BudgetCategory `json:"savings"`
}

// 2024 Federal Tax Brackets (Single filer)
var taxBrackets = []struct {
	Min  float64
	Max  float64
	Rate float64
}{
	{0, 11600, 0.10},
	{11600, 47150, 0.12},
	{47150, 100525, 0.22},
	{100525, 191950, 0.24},
	{191950, 243725, 0.32},
	{243725, 609350, 0.35},
	{609350, math.MaxFloat64, 0.37},
}

const (
	// StandardDeduction is the 2024 standard deduction for single filers.
	StandardDeduction = 14600.0
	// SSWageBase is the 2024 Social Security wage base limit.
	SSWageBase = 168600.0
)

// CalculateIncome projects annual income from year-to-date income data.
// It calculates daily rate based on the period from startDate to checkDate,
// then extrapolates to annual, monthly, and weekly amounts.
func CalculateIncome(ytdIncome float64, startDate, checkDate time.Time) (*IncomeData, error) {
	yearStart := time.Date(checkDate.Year(), 1, 1, 0, 0, 0, 0, checkDate.Location())

	// Use effective start date (either startDate or Jan 1 of check year, whichever is later)
	effectiveStart := startDate
	if startDate.Before(yearStart) {
		effectiveStart = yearStart
	}

	// Calculate days worked (inclusive of both start and end dates)
	days := int(checkDate.Sub(effectiveStart).Hours()/24) + 1

	if days <= 0 {
		return nil, errors.New("check date must be after start date")
	}

	daily := ytdIncome / float64(days)
	annual := daily * 365
	monthly := annual / 12
	weekly := annual / 52

	return &IncomeData{
		GrossAnnual:    int(math.Round(annual)),
		GrossMonthly:   int(math.Round(monthly)),
		GrossWeekly:    int(math.Round(weekly)),
		GrossDaily:     int(math.Round(daily)),
		DaysWorked:     days,
		MaxAutoPayment: int(math.Round(monthly * 0.12)),
		MaxRent:        int(math.Round(monthly * 0.30)),
	}, nil
}

// CalculateLoanAmount performs reverse amortization to determine the loan principal
// that corresponds to a given monthly payment at a specified interest rate and term.
func CalculateLoanAmount(monthlyPayment, annualRate float64, termMonths int) int {
	monthlyRate := annualRate / 100 / 12

	// Handle zero interest rate case
	if monthlyRate == 0 {
		return int(math.Round(monthlyPayment * float64(termMonths)))
	}

	// Present value of annuity formula: PV = PMT * [(1 - (1 + r)^-n) / r]
	principal := monthlyPayment * ((1 - math.Pow(1+monthlyRate, float64(-termMonths))) / monthlyRate)

	return int(math.Round(principal))
}

// CalculateMonthlyPayment calculates the monthly payment for a loan using
// the standard amortization formula.
func CalculateMonthlyPayment(principal, annualRate float64, termMonths int) int {
	monthlyRate := annualRate / 100 / 12

	// Handle zero interest rate case
	if monthlyRate == 0 {
		return int(math.Round(principal / float64(termMonths)))
	}

	// Monthly payment formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
	factor := math.Pow(1+monthlyRate, float64(termMonths))
	payment := principal * (monthlyRate * factor) / (factor - 1)

	return int(math.Round(payment))
}

// CalculateMortgage computes a full PITI (Principal, Interest, Taxes, Insurance)
// breakdown for a mortgage.
func CalculateMortgage(
	homePrice float64,
	downPaymentPercent float64,
	interestRate float64,
	termYears int,
	propertyTaxRate float64,
	annualInsurance float64,
) *MortgageResult {
	downPayment := homePrice * (downPaymentPercent / 100)
	loanAmount := homePrice - downPayment
	termMonths := termYears * 12

	monthlyRate := interestRate / 100 / 12

	var principalInterest float64
	if monthlyRate == 0 {
		principalInterest = loanAmount / float64(termMonths)
	} else {
		factor := math.Pow(1+monthlyRate, float64(termMonths))
		principalInterest = loanAmount * (monthlyRate * factor) / (factor - 1)
	}

	propertyTax := (homePrice * (propertyTaxRate / 100)) / 12
	insurance := annualInsurance / 12

	// PMI is required if down payment is less than 20%
	var pmi float64
	if downPaymentPercent < 20 {
		pmi = (loanAmount * 0.005) / 12
	}

	totalMonthly := principalInterest + propertyTax + insurance + pmi
	totalPayments := principalInterest * float64(termMonths)

	return &MortgageResult{
		HomePrice:          homePrice,
		DownPayment:        int(math.Round(downPayment)),
		DownPaymentPercent: downPaymentPercent,
		LoanAmount:         int(math.Round(loanAmount)),
		InterestRate:       interestRate,
		TermYears:          termYears,
		PITI: PITIBreakdown{
			PrincipalInterest: int(math.Round(principalInterest)),
			PropertyTax:       int(math.Round(propertyTax)),
			Insurance:         int(math.Round(insurance)),
			PMI:               int(math.Round(pmi)),
			TotalMonthly:      int(math.Round(totalMonthly)),
		},
		TotalPayments: int(math.Round(totalPayments)),
		TotalInterest: int(math.Round(totalPayments - loanAmount)),
	}
}

// CalculateTaxes computes federal, state, and FICA taxes based on gross annual income.
// Uses 2024 tax brackets for federal calculations.
func CalculateTaxes(
	grossAnnual float64,
	retirement401kPercent float64,
	healthInsuranceAnnual float64,
	stateTaxRate float64,
) *TaxBreakdown {
	// Calculate pre-tax deductions
	retirement := grossAnnual * (retirement401kPercent / 100)
	agi := grossAnnual - retirement - healthInsuranceAnnual

	// Federal tax calculation with standard deduction
	taxableIncome := math.Max(0, agi-StandardDeduction)
	var federalTax float64
	remaining := taxableIncome

	for _, bracket := range taxBrackets {
		if remaining <= 0 {
			break
		}
		taxableInBracket := math.Min(remaining, bracket.Max-bracket.Min)
		federalTax += taxableInBracket * bracket.Rate
		remaining -= taxableInBracket
	}

	// State tax calculation (flat rate on AGI)
	stateTax := agi * (stateTaxRate / 100)

	// FICA calculations
	ssTaxable := math.Min(grossAnnual, SSWageBase)
	socialSecurity := ssTaxable * 0.062
	medicare := grossAnnual * 0.0145
	fica := socialSecurity + medicare

	// Total deductions and net income
	totalDeductions := federalTax + stateTax + fica + retirement + healthInsuranceAnnual
	netAnnual := grossAnnual - totalDeductions

	// Effective tax rate (taxes only, not retirement/health)
	taxOnly := federalTax + stateTax + fica
	effectiveTaxRate := math.Round((taxOnly/grossAnnual)*1000) / 10

	return &TaxBreakdown{
		GrossAnnual:      int(math.Round(grossAnnual)),
		FederalTax:       int(math.Round(federalTax)),
		StateTax:         int(math.Round(stateTax)),
		FICATax:          int(math.Round(fica)),
		SocialSecurity:   int(math.Round(socialSecurity)),
		Medicare:         int(math.Round(medicare)),
		Retirement401k:   int(math.Round(retirement)),
		HealthInsurance:  int(math.Round(healthInsuranceAnnual)),
		TotalDeductions:  int(math.Round(totalDeductions)),
		NetAnnual:        int(math.Round(netAnnual)),
		NetMonthly:       int(math.Round(netAnnual / 12)),
		EffectiveTaxRate: effectiveTaxRate,
	}
}

// CalculateBudgetAllocation creates a 50/30/20 budget allocation based on
// net monthly income.
func CalculateBudgetAllocation(netMonthly float64) *BudgetAllocation {
	needsMonthly := netMonthly * 0.5
	wantsMonthly := netMonthly * 0.3
	savingsMonthly := netMonthly * 0.2

	return &BudgetAllocation{
		NetMonthly: int(math.Round(netMonthly)),
		Needs: BudgetCategory{
			Name:    "Needs",
			Percent: 50,
			Monthly: int(math.Round(needsMonthly)),
			Weekly:  int(math.Round(needsMonthly / 4.33)),
			Daily:   int(math.Round(needsMonthly / 30)),
			Subcategories: []Subcategory{
				{Name: "Housing", Percent: 25, Monthly: int(math.Round(netMonthly * 0.25))},
				{Name: "Utilities", Percent: 5, Monthly: int(math.Round(netMonthly * 0.05))},
				{Name: "Groceries", Percent: 10, Monthly: int(math.Round(netMonthly * 0.10))},
				{Name: "Transportation", Percent: 10, Monthly: int(math.Round(netMonthly * 0.10))},
			},
		},
		Wants: BudgetCategory{
			Name:    "Wants",
			Percent: 30,
			Monthly: int(math.Round(wantsMonthly)),
			Weekly:  int(math.Round(wantsMonthly / 4.33)),
			Daily:   int(math.Round(wantsMonthly / 30)),
			Subcategories: []Subcategory{
				{Name: "Dining Out", Percent: 5, Monthly: int(math.Round(netMonthly * 0.05))},
				{Name: "Subscriptions", Percent: 5, Monthly: int(math.Round(netMonthly * 0.05))},
				{Name: "Travel/Fun", Percent: 10, Monthly: int(math.Round(netMonthly * 0.10))},
				{Name: "Personal", Percent: 10, Monthly: int(math.Round(netMonthly * 0.10))},
			},
		},
		Savings: BudgetCategory{
			Name:    "Savings",
			Percent: 20,
			Monthly: int(math.Round(savingsMonthly)),
			Weekly:  int(math.Round(savingsMonthly / 4.33)),
			Daily:   int(math.Round(savingsMonthly / 30)),
			Subcategories: []Subcategory{
				{Name: "Emergency Fund", Percent: 10, Monthly: int(math.Round(netMonthly * 0.10))},
				{Name: "Investments", Percent: 5, Monthly: int(math.Round(netMonthly * 0.05))},
				{Name: "Goals", Percent: 5, Monthly: int(math.Round(netMonthly * 0.05))},
			},
		},
	}
}
