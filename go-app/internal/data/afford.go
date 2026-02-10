package data

import "math"

// AffordabilityData holds pre-calculated budget/affordability data for a salary level.
type AffordabilityData struct {
	Salary      int
	Slug        string
	Display     string
	TakeHome    int
	MonthlyNet  int
	MonthlyGross int
	Needs       int
	Wants       int
	Savings     int
	MaxRent     int
	MaxCar      int
	MaxMortgage int
	EmergencyFund int
	HourlyRate  int
	WeeklyPay   int
}

// SalaryLevels defines the salary points for programmatic pages.
var SalaryLevels = []int{
	25000, 28000, 30000, 32000, 35000, 37000, 40000, 42000, 45000, 48000,
	50000, 52000, 55000, 57000, 60000, 62000, 65000, 67000, 70000, 72000,
	75000, 78000, 80000, 82000, 85000, 88000, 90000, 92000, 95000, 100000,
	105000, 110000, 115000, 120000, 125000, 130000, 140000, 150000, 160000, 175000,
	200000, 250000, 300000, 400000, 500000,
}

func salarySlug(s int) string {
	if s >= 1000 {
		k := s / 1000
		return formatInt(k) + "k"
	}
	return formatInt(s)
}

func salaryDisplay(s int) string {
	return "$" + formatCommas(s)
}

func formatInt(n int) string {
	if n < 0 {
		return "-" + formatInt(-n)
	}
	s := ""
	for n > 0 {
		s = string(rune('0'+n%10)) + s
		n /= 10
	}
	if s == "" {
		return "0"
	}
	return s
}

func formatCommas(n int) string {
	s := formatInt(n)
	if len(s) <= 3 {
		return s
	}
	result := ""
	rem := len(s) % 3
	if rem > 0 {
		result = s[:rem]
	}
	for i := rem; i < len(s); i += 3 {
		if result != "" {
			result += ","
		}
		result += s[i : i+3]
	}
	return result
}

func calcFederalTax(income int) int {
	standardDeduction := 14600
	taxable := income - standardDeduction
	if taxable < 0 {
		taxable = 0
	}

	brackets := []struct{ limit int; rate float64 }{
		{11600, 0.10}, {47150, 0.12}, {100525, 0.22},
		{191950, 0.24}, {243725, 0.32}, {609350, 0.35},
		{math.MaxInt32, 0.37},
	}

	tax := 0.0
	remaining := float64(taxable)
	prev := 0

	for _, b := range brackets {
		bracket := float64(b.limit - prev)
		if remaining <= 0 {
			break
		}
		taxableInBracket := math.Min(remaining, bracket)
		tax += taxableInBracket * b.rate
		remaining -= taxableInBracket
		prev = b.limit
	}

	return int(math.Round(tax))
}

func calcFICA(income int) int {
	ssCap := 168600
	ssRate := 0.062
	medicareRate := 0.0145
	ssTaxable := income
	if ssTaxable > ssCap {
		ssTaxable = ssCap
	}
	ss := float64(ssTaxable) * ssRate
	medicare := float64(income) * medicareRate
	return int(math.Round(ss + medicare))
}

// CalculateAffordability generates affordability data for a given salary.
func CalculateAffordability(salary int) AffordabilityData {
	federalTax := calcFederalTax(salary)
	stateTax := int(math.Round(float64(salary) * 0.05))
	fica := calcFICA(salary)
	totalTaxes := federalTax + stateTax + fica
	takeHome := salary - totalTaxes

	monthlyGross := salary / 12
	monthlyNet := takeHome / 12

	return AffordabilityData{
		Salary:        salary,
		Slug:          salarySlug(salary),
		Display:       salaryDisplay(salary),
		TakeHome:      takeHome,
		MonthlyNet:    monthlyNet,
		MonthlyGross:  monthlyGross,
		Needs:         int(float64(monthlyNet) * 0.5),
		Wants:         int(float64(monthlyNet) * 0.3),
		Savings:       int(float64(monthlyNet) * 0.2),
		MaxRent:       int(float64(monthlyGross) * 0.3),
		MaxCar:        int(float64(monthlyGross) * 0.12),
		MaxMortgage:   int(float64(monthlyGross) * 0.28),
		EmergencyFund: monthlyNet * 6,
		HourlyRate:    salary / 2080,
		WeeklyPay:     takeHome / 52,
	}
}

// AllAffordSlugs returns slugs for all salary levels.
func AllAffordSlugs() []string {
	slugs := make([]string, len(SalaryLevels))
	for i, s := range SalaryLevels {
		slugs[i] = salarySlug(s)
	}
	return slugs
}

// GetAffordBySlug returns affordability data for a salary slug.
func GetAffordBySlug(slug string) *AffordabilityData {
	for _, s := range SalaryLevels {
		if salarySlug(s) == slug {
			a := CalculateAffordability(s)
			return &a
		}
	}
	return nil
}

// ClosestAffordSlug returns the slug of the closest salary level.
func ClosestAffordSlug(salary int) string {
	best := SalaryLevels[0]
	bestDiff := salary - best
	if bestDiff < 0 {
		bestDiff = -bestDiff
	}
	for _, s := range SalaryLevels[1:] {
		diff := salary - s
		if diff < 0 {
			diff = -diff
		}
		if diff < bestDiff {
			best = s
			bestDiff = diff
		}
	}
	return salarySlug(best)
}
