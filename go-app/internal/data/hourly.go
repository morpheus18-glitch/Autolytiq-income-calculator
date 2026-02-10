package data

import "math"

// HourlyData holds pre-calculated salary breakdown for an hourly rate.
type HourlyData struct {
	Rate        int
	Slug        string
	Annual      int
	Monthly     int
	Biweekly    int
	Weekly      int
	Daily       int
	TakeHome    int
	MonthlyNet  int
	FederalTax  int
	StateTax    int
	FICA        int
	TotalTaxes  int
	EffRate     float64 // effective tax rate percentage
	AffordSlug  string  // closest afford page slug
}

// HourlyRates defines the rates for programmatic pages ($10-$100).
var HourlyRates []int

func init() {
	for r := 10; r <= 100; r++ {
		HourlyRates = append(HourlyRates, r)
	}
}

// CalculateHourly generates salary breakdown data for a given hourly rate.
func CalculateHourly(rate int) HourlyData {
	annual := rate * 2080 // 40 hrs/week * 52 weeks
	monthly := annual / 12
	biweekly := annual / 26
	weekly := annual / 52
	daily := annual / 260

	federalTax := calcFederalTax(annual)
	stateTax := int(math.Round(float64(annual) * 0.05))
	fica := calcFICA(annual)
	totalTaxes := federalTax + stateTax + fica
	takeHome := annual - totalTaxes
	monthlyNet := takeHome / 12

	effRate := 0.0
	if annual > 0 {
		effRate = math.Round(float64(totalTaxes)/float64(annual)*1000) / 10
	}

	return HourlyData{
		Rate:       rate,
		Slug:       formatInt(rate),
		Annual:     annual,
		Monthly:    monthly,
		Biweekly:   biweekly,
		Weekly:     weekly,
		Daily:      daily,
		TakeHome:   takeHome,
		MonthlyNet: monthlyNet,
		FederalTax: federalTax,
		StateTax:   stateTax,
		FICA:       fica,
		TotalTaxes: totalTaxes,
		EffRate:    effRate,
		AffordSlug: ClosestAffordSlug(annual),
	}
}

// AllHourlySlugs returns all hourly rate slugs.
func AllHourlySlugs() []string {
	slugs := make([]string, len(HourlyRates))
	for i, r := range HourlyRates {
		slugs[i] = formatInt(r)
	}
	return slugs
}

// GetHourlyBySlug returns hourly data for a slug, or nil if not found.
func GetHourlyBySlug(slug string) *HourlyData {
	for _, r := range HourlyRates {
		if formatInt(r) == slug {
			d := CalculateHourly(r)
			return &d
		}
	}
	return nil
}
