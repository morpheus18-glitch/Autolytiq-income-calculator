// Package handlers provides HTTP handlers for the income calculator application.
package handlers

import (
	"fmt"
	"html/template"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/autolytiq/income-calculator/internal/calc"
)

// Handler holds dependencies for HTTP handlers.
type Handler struct {
	tmpl *template.Template
}

// New creates a new Handler with the given template.
func New(tmpl *template.Template) *Handler {
	return &Handler{tmpl: tmpl}
}

// PageMeta holds SEO and layout metadata for a page.
type PageMeta struct {
	Title       string
	Description string
	Canonical   string
}

// renderPage renders a page using the base template with page-specific content
func (h *Handler) renderPage(w http.ResponseWriter, meta PageMeta, contentTemplate string, data interface{}) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// Execute the content template to get the HTML
	var contentBuf strings.Builder
	if err := h.tmpl.ExecuteTemplate(&contentBuf, contentTemplate, data); err != nil {
		http.Error(w, "Template error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create page data with the rendered content
	pageData := struct {
		Title       string
		Description string
		Canonical   string
		Content     template.HTML
	}{
		Title:       meta.Title,
		Description: meta.Description,
		Canonical:   meta.Canonical,
		Content:     template.HTML(contentBuf.String()),
	}

	// Execute the base template
	if err := h.tmpl.ExecuteTemplate(w, "base", pageData); err != nil {
		http.Error(w, "Base template error: "+err.Error(), http.StatusInternalServerError)
	}
}

// renderPartial renders an HTMX partial
func (h *Handler) renderPartial(w http.ResponseWriter, name string, data interface{}) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := h.tmpl.ExecuteTemplate(w, name, data); err != nil {
		http.Error(w, "Template error", http.StatusInternalServerError)
	}
}

// renderError renders an error message as an HTML partial
func (h *Handler) renderError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	fmt.Fprintf(w, `<div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
		<p class="text-red-600 dark:text-red-400 font-medium">%s</p>
	</div>`, template.HTMLEscapeString(message))
}

// =============================================================================
// Page Handlers
// =============================================================================

const baseURL = "https://autolytiqs.com"

func (h *Handler) Home(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Free Income Calculator - Know Your True Take-Home Pay | Autolytiq",
		Description: "Calculate your real take-home pay from your YTD income. Free income projector with tax breakdown, budget planner, and housing affordability tools.",
		Canonical:   baseURL + "/",
	}, "home-content", nil)
}

func (h *Handler) Calculator(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	data := map[string]interface{}{
		"Year":             now.Year(),
		"Today":            now.Format("2006-01-02"),
		"DefaultStartDate": time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location()).Format("2006-01-02"),
	}
	h.renderPage(w, PageMeta{
		Title:       fmt.Sprintf("Free Income Calculator %d - Project Your Annual Salary", now.Year()),
		Description: fmt.Sprintf("Enter your year-to-date income and get an instant %d salary projection with daily rate, tax breakdown, and budget recommendations.", now.Year()),
		Canonical:   baseURL + "/calculator",
	}, "calculator-content", data)
}

func (h *Handler) SmartMoney(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "50/30/20 Budget Calculator - Free Budget Planner | Autolytiq",
		Description: "Use the 50/30/20 budget rule to allocate your income. Get instant needs, wants, and savings breakdowns with weekly and daily spending targets.",
		Canonical:   baseURL + "/smart-money",
	}, "smart-money-content", nil)
}

func (h *Handler) Housing(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Mortgage & Housing Affordability Calculator | Autolytiq",
		Description: "Calculate your monthly mortgage payment with PITI breakdown. See principal, interest, taxes, insurance, and PMI for any home price.",
		Canonical:   baseURL + "/housing",
	}, "housing-content", nil)
}

func (h *Handler) Auto(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Auto Loan Calculator - Monthly Car Payment Estimator | Autolytiq",
		Description: "Calculate your monthly car payment with trade-in and down payment. See total interest cost and find the right auto loan for your budget.",
		Canonical:   baseURL + "/auto",
	}, "auto-content", nil)
}

func (h *Handler) Blog(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Financial Tips & Guides - Money Management Blog | Autolytiq",
		Description: "Practical financial advice on budgeting, saving, housing, auto loans, and gig work. Free guides to help you make smarter money decisions.",
		Canonical:   baseURL + "/blog",
	}, "blog-content", nil)
}

func (h *Handler) FreeTools(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Free Financial Calculators & Tools | Autolytiq",
		Description: "Free online financial calculators: income projector, 50/30/20 budget planner, mortgage calculator, auto loan calculator, gig income tracker.",
		Canonical:   baseURL + "/free-tools",
	}, "free-tools-content", nil)
}

func (h *Handler) Taxes(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Federal & State Tax Calculator - Estimate Take-Home Pay | Autolytiq",
		Description: "Estimate your take-home pay after federal, state, Social Security, and Medicare taxes. Free tax calculator with 2024 brackets and deductions.",
		Canonical:   baseURL + "/taxes",
	}, "taxes-content", nil)
}

func (h *Handler) GigCalculator(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	data := map[string]interface{}{
		"Today":            now.Format("2006-01-02"),
		"DefaultStartDate": time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location()).Format("2006-01-02"),
	}
	h.renderPage(w, PageMeta{
		Title:       "Gig Worker Income Calculator - Uber, DoorDash, Freelance | Autolytiq",
		Description: "Calculate your gig income after expenses and self-employment tax. Track mileage deductions and project annual earnings from YTD data.",
		Canonical:   baseURL + "/gig-calculator",
	}, "gig-calculator-content", data)
}

func (h *Handler) IncomeStreams(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Income Streams Tracker - Multiple Income Calculator | Autolytiq",
		Description: "Track and total all your income sources: salary, freelance, investments, and rental income. See your complete annual and monthly picture.",
		Canonical:   baseURL + "/income-streams",
	}, "income-streams-content", nil)
}

// =============================================================================
// HTMX API Handlers
// =============================================================================

// cleanMoney strips $, commas, and spaces from money input strings.
func cleanMoney(s string) string {
	s = strings.ReplaceAll(s, ",", "")
	s = strings.ReplaceAll(s, "$", "")
	s = strings.TrimSpace(s)
	return s
}

// formatMoney formats an integer as a comma-separated number string (e.g. 1234 -> "1,234").
func formatMoney(n int) string {
	if n < 0 {
		return "-" + formatMoney(-n)
	}
	s := strconv.Itoa(n)
	if len(s) <= 3 {
		return s
	}
	var result strings.Builder
	remainder := len(s) % 3
	if remainder > 0 {
		result.WriteString(s[:remainder])
	}
	for i := remainder; i < len(s); i += 3 {
		if result.Len() > 0 {
			result.WriteByte(',')
		}
		result.WriteString(s[i : i+3])
	}
	return result.String()
}

func (h *Handler) CalculateIncome(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	// Parse YTD income
	ytdIncome, err := strconv.ParseFloat(cleanMoney(r.FormValue("ytd_income")), 64)
	if err != nil || ytdIncome <= 0 {
		h.renderError(w, "Please enter a valid YTD income", http.StatusBadRequest)
		return
	}

	// Parse dates
	startDate, err := time.Parse("2006-01-02", r.FormValue("start_date"))
	if err != nil {
		h.renderError(w, "Please enter a valid start date", http.StatusBadRequest)
		return
	}

	checkDate, err := time.Parse("2006-01-02", r.FormValue("check_date"))
	if err != nil {
		h.renderError(w, "Please enter a valid paystub date", http.StatusBadRequest)
		return
	}

	// Calculate
	result, err := calc.CalculateIncome(ytdIncome, startDate, checkDate)
	if err != nil {
		h.renderError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Render results
	h.renderPartial(w, "income-results", result)
}

func (h *Handler) CalculateBudget(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	netMonthly, _ := strconv.ParseFloat(cleanMoney(r.FormValue("monthly_income")), 64)
	if netMonthly <= 0 {
		h.renderError(w, "Please enter a valid monthly income", http.StatusBadRequest)
		return
	}

	b := calc.CalculateBudgetAllocation(netMonthly)
	annualSavings := b.Savings.Monthly * 12

	result := map[string]interface{}{
		"MonthlyIncomeFormatted":   formatMoney(b.NetMonthly),
		"NeedsFormatted":           formatMoney(b.Needs.Monthly),
		"WantsFormatted":           formatMoney(b.Wants.Monthly),
		"SavingsFormatted":         formatMoney(b.Savings.Monthly),
		"AnnualSavingsFormatted":   formatMoney(annualSavings),
		"FiveYearSavingsFormatted": formatMoney(annualSavings * 5),
	}
	h.renderPartial(w, "budget-results", result)
}

func (h *Handler) CalculateMortgage(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	homePrice, _ := strconv.ParseFloat(cleanMoney(r.FormValue("home_price")), 64)
	downPaymentDollars, _ := strconv.ParseFloat(cleanMoney(r.FormValue("down_payment")), 64)
	interestRate, _ := strconv.ParseFloat(r.FormValue("interest_rate"), 64)
	termYears, _ := strconv.Atoi(r.FormValue("loan_term"))
	propertyTaxRate, _ := strconv.ParseFloat(r.FormValue("property_tax_rate"), 64)
	annualInsurance, _ := strconv.ParseFloat(cleanMoney(r.FormValue("annual_insurance")), 64)
	annualIncome, _ := strconv.ParseFloat(cleanMoney(r.FormValue("annual_income")), 64)

	if homePrice <= 0 {
		h.renderError(w, "Please enter a valid home price", http.StatusBadRequest)
		return
	}

	// Convert down payment dollars to percentage
	var downPaymentPct float64
	if homePrice > 0 && downPaymentDollars > 0 {
		downPaymentPct = (downPaymentDollars / homePrice) * 100
	}

	// Defaults
	if termYears == 0 {
		termYears = 30
	}
	if propertyTaxRate == 0 {
		propertyTaxRate = 1.1
	}
	if annualInsurance == 0 {
		annualInsurance = 1200
	}

	m := calc.CalculateMortgage(homePrice, downPaymentPct, interestRate, termYears, propertyTaxRate, annualInsurance)

	// Affordability ratios (use annual income if provided, else assume not affordable)
	var housingRatio, dtiRatio float64
	affordable := false
	if annualIncome > 0 {
		monthlyIncome := annualIncome / 12
		housingRatio = float64(m.PITI.TotalMonthly) / monthlyIncome * 100
		dtiRatio = housingRatio // simplified: only housing debt
		affordable = housingRatio <= 28
	}

	result := map[string]interface{}{
		"Affordable":                affordable,
		"MonthlyPaymentFormatted":   formatMoney(m.PITI.TotalMonthly),
		"PrincipalInterestFormatted": formatMoney(m.PITI.PrincipalInterest),
		"TaxesFormatted":            formatMoney(m.PITI.PropertyTax),
		"InsuranceFormatted":        formatMoney(m.PITI.Insurance),
		"HasPMI":                    m.PITI.PMI > 0,
		"PMIFormatted":              formatMoney(m.PITI.PMI),
		"HomePriceFormatted":        formatMoney(int(homePrice)),
		"DownPaymentFormatted":      formatMoney(m.DownPayment),
		"DownPaymentPercent":        fmt.Sprintf("%.0f", downPaymentPct),
		"LoanAmountFormatted":       formatMoney(m.LoanAmount),
		"TotalPaymentsFormatted":    formatMoney(m.TotalPayments),
		"TotalInterestFormatted":    formatMoney(m.TotalInterest),
		"InterestRate":              interestRate,
		"HousingRatio":              math.Round(housingRatio*10) / 10,
		"DTIRatio":                  math.Round(dtiRatio*10) / 10,
	}
	h.renderPartial(w, "mortgage-results", result)
}

func (h *Handler) CalculateAuto(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	vehiclePrice, _ := strconv.ParseFloat(cleanMoney(r.FormValue("vehicle_price")), 64)
	downPayment, _ := strconv.ParseFloat(cleanMoney(r.FormValue("down_payment")), 64)
	tradeIn, _ := strconv.ParseFloat(cleanMoney(r.FormValue("trade_in")), 64)
	interestRate, _ := strconv.ParseFloat(r.FormValue("interest_rate"), 64)
	termMonths, _ := strconv.Atoi(r.FormValue("loan_term"))
	monthlyIncome, _ := strconv.ParseFloat(cleanMoney(r.FormValue("monthly_income")), 64)
	annualIncome := monthlyIncome * 12

	if vehiclePrice <= 0 {
		h.renderError(w, "Please enter a valid vehicle price", http.StatusBadRequest)
		return
	}

	// Defaults
	if termMonths == 0 {
		termMonths = 60
	}

	loanAmount := vehiclePrice - downPayment - tradeIn
	if loanAmount <= 0 {
		h.renderError(w, "Loan amount must be positive", http.StatusBadRequest)
		return
	}

	monthlyPayment := calc.CalculateMonthlyPayment(loanAmount, interestRate, termMonths)
	totalPayments := monthlyPayment * termMonths
	totalInterest := totalPayments - int(loanAmount)
	trueCost := int(vehiclePrice) + totalInterest

	// 12% rule: max auto payment is 12% of gross monthly income
	var maxPayment int
	var paymentPercent float64
	affordable := false
	if annualIncome > 0 {
		maxPayment = int(annualIncome / 12 * 0.12)
		if maxPayment > 0 {
			paymentPercent = float64(monthlyPayment) / float64(maxPayment) * 100
		}
		affordable = monthlyPayment <= maxPayment
	}

	result := map[string]interface{}{
		"Affordable":              affordable,
		"MonthlyPaymentFormatted": formatMoney(monthlyPayment),
		"MaxPaymentFormatted":     formatMoney(maxPayment),
		"PaymentPercent":          math.Round(paymentPercent*10) / 10,
		"LoanAmountFormatted":     formatMoney(int(loanAmount)),
		"InterestRate":            interestRate,
		"LoanTermMonths":          termMonths,
		"VehiclePriceFormatted":   formatMoney(int(vehiclePrice)),
		"DownPaymentFormatted":    formatMoney(int(downPayment)),
		"TradeInValue":            int(tradeIn),
		"TradeInFormatted":        formatMoney(int(tradeIn)),
		"TotalPaymentsFormatted":  formatMoney(totalPayments),
		"TotalInterestFormatted":  formatMoney(totalInterest),
		"TrueCostFormatted":       formatMoney(trueCost),
	}
	h.renderPartial(w, "auto-results", result)
}

func (h *Handler) CalculateTaxes(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	grossAnnual, _ := strconv.ParseFloat(cleanMoney(r.FormValue("gross_annual")), 64)
	retirement401kPct, _ := strconv.ParseFloat(r.FormValue("retirement_pct"), 64)
	healthInsurance, _ := strconv.ParseFloat(cleanMoney(r.FormValue("health_insurance")), 64)
	stateTaxRate, _ := strconv.ParseFloat(r.FormValue("state_tax_rate"), 64)

	if grossAnnual <= 0 {
		h.renderError(w, "Please enter a valid gross income", http.StatusBadRequest)
		return
	}

	t := calc.CalculateTaxes(grossAnnual, retirement401kPct, healthInsurance, stateTaxRate)

	totalTaxes := t.FederalTax + t.StateTax + t.SocialSecurity + t.Medicare
	biweeklyNet := t.NetAnnual / 26
	weeklyNet := t.NetAnnual / 52
	takeHomeRate := 100.0 - t.EffectiveTaxRate

	// Calculate tax percentages relative to gross for progress bars
	var fedPct, statePct, ssPct, medPct float64
	if t.GrossAnnual > 0 {
		fedPct = float64(t.FederalTax) / float64(t.GrossAnnual) * 100
		statePct = float64(t.StateTax) / float64(t.GrossAnnual) * 100
		ssPct = float64(t.SocialSecurity) / float64(t.GrossAnnual) * 100
		medPct = float64(t.Medicare) / float64(t.GrossAnnual) * 100
	}

	result := map[string]interface{}{
		"NetIncomeFormatted":       formatMoney(t.NetAnnual),
		"MonthlyNetFormatted":      formatMoney(t.NetMonthly),
		"BiweeklyNetFormatted":     formatMoney(biweeklyNet),
		"WeeklyNetFormatted":       formatMoney(weeklyNet),
		"GrossIncomeFormatted":     formatMoney(t.GrossAnnual),
		"TotalTaxesFormatted":      formatMoney(totalTaxes),
		"FederalTaxFormatted":      formatMoney(t.FederalTax),
		"FederalTaxPercent":        math.Round(fedPct*10) / 10,
		"State":                    fmt.Sprintf("%.1f%%", stateTaxRate),
		"StateTaxFormatted":        formatMoney(t.StateTax),
		"StateTaxPercent":          math.Round(statePct*10) / 10,
		"SocialSecurityFormatted":  formatMoney(t.SocialSecurity),
		"SocialSecurityPercent":    math.Round(ssPct*10) / 10,
		"MedicareFormatted":        formatMoney(t.Medicare),
		"MedicarePercent":          math.Round(medPct*10) / 10,
		"EffectiveRate":            t.EffectiveTaxRate,
		"TakeHomeRate":             math.Round(takeHomeRate*10) / 10,
	}
	h.renderPartial(w, "tax-results", result)
}

func (h *Handler) CalculateGig(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	gig1Income, _ := strconv.ParseFloat(cleanMoney(r.FormValue("gig1_income")), 64)
	gig2Income, _ := strconv.ParseFloat(cleanMoney(r.FormValue("gig2_income")), 64)
	milesDriven, _ := strconv.ParseFloat(cleanMoney(r.FormValue("miles_driven")), 64)
	otherExpenses, _ := strconv.ParseFloat(cleanMoney(r.FormValue("other_expenses")), 64)

	totalYTD := gig1Income + gig2Income
	if totalYTD <= 0 {
		h.renderError(w, "Please enter at least one gig income source", http.StatusBadRequest)
		return
	}

	startDate, err := time.Parse("2006-01-02", r.FormValue("start_date"))
	if err != nil {
		h.renderError(w, "Please enter a valid start date", http.StatusBadRequest)
		return
	}

	checkDate, err := time.Parse("2006-01-02", r.FormValue("check_date"))
	if err != nil {
		h.renderError(w, "Please enter a valid as-of date", http.StatusBadRequest)
		return
	}

	// Project annual income
	incomeResult, err := calc.CalculateIncome(totalYTD, startDate, checkDate)
	if err != nil {
		h.renderError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Calculate deductions
	mileageDeduction := milesDriven * 0.67
	totalExpenses := mileageDeduction + otherExpenses
	selfEmploymentTax := float64(incomeResult.GrossAnnual) * 0.153
	netAfterExpenses := float64(incomeResult.GrossAnnual) - totalExpenses
	netAfterTax := netAfterExpenses - selfEmploymentTax

	result := map[string]interface{}{
		"Gig1Name":          r.FormValue("gig1_name"),
		"Gig1Income":        int(gig1Income),
		"Gig2Name":          r.FormValue("gig2_name"),
		"Gig2Income":        int(gig2Income),
		"TotalYTD":          int(totalYTD),
		"GrossAnnual":       incomeResult.GrossAnnual,
		"GrossMonthly":      incomeResult.GrossMonthly,
		"DaysWorked":        incomeResult.DaysWorked,
		"MilesDriven":       int(milesDriven),
		"MileageDeduction":  int(mileageDeduction),
		"OtherExpenses":     int(otherExpenses),
		"TotalExpenses":     int(totalExpenses),
		"SelfEmploymentTax": int(selfEmploymentTax),
		"NetAfterExpenses":  int(netAfterExpenses),
		"NetAfterTax":       int(netAfterTax),
		"NetMonthly":        int(netAfterTax / 12),
		"EffectiveHourly":   int(netAfterTax / 2080),
	}
	h.renderPartial(w, "gig-results", result)
}

func (h *Handler) CalculateStreams(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	type Stream struct {
		Name   string
		Annual int
	}

	var streams []Stream
	var totalAnnual float64

	for i := 1; i <= 4; i++ {
		name := r.FormValue(fmt.Sprintf("stream%d_name", i))
		incomeStr := cleanMoney(r.FormValue(fmt.Sprintf("stream%d_income", i)))
		income, _ := strconv.ParseFloat(incomeStr, 64)
		if income > 0 {
			streams = append(streams, Stream{Name: name, Annual: int(income)})
			totalAnnual += income
		}
	}

	if totalAnnual <= 0 {
		h.renderError(w, "Please enter at least one income stream", http.StatusBadRequest)
		return
	}

	monthlyTotal := int(totalAnnual / 12)

	// Add percentage of total to each stream
	type StreamResult struct {
		Name    string
		Annual  int
		Monthly int
		Percent int
	}
	var streamResults []StreamResult
	for _, s := range streams {
		pct := int((float64(s.Annual) / totalAnnual) * 100)
		streamResults = append(streamResults, StreamResult{
			Name:    s.Name,
			Annual:  s.Annual,
			Monthly: s.Annual / 12,
			Percent: pct,
		})
	}

	result := map[string]interface{}{
		"Streams":      streamResults,
		"TotalAnnual":  int(totalAnnual),
		"TotalMonthly": monthlyTotal,
		"TotalWeekly":  int(totalAnnual / 52),
		"StreamCount":  len(streams),
	}
	h.renderPartial(w, "streams-results", result)
}
