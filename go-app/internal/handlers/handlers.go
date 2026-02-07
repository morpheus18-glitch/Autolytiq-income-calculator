// Package handlers provides HTTP handlers for the income calculator application.
package handlers

import (
	"fmt"
	"html/template"
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

// PageData holds common data for all pages
type PageData struct {
	Title   string
	Content template.HTML
}

// renderPage renders a page using the base template with page-specific content
func (h *Handler) renderPage(w http.ResponseWriter, title, contentTemplate string, data interface{}) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// Execute the content template to get the HTML
	var contentBuf strings.Builder
	if err := h.tmpl.ExecuteTemplate(&contentBuf, contentTemplate, data); err != nil {
		http.Error(w, "Template error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create page data with the rendered content
	pageData := struct {
		Title   string
		Content template.HTML
	}{
		Title:   title,
		Content: template.HTML(contentBuf.String()),
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

func (h *Handler) Home(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, "Autolytiq - Know Your True Take-Home Pay", "home-content", nil)
}

func (h *Handler) Calculator(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	data := map[string]interface{}{
		"Year":             now.Year(),
		"Today":            now.Format("2006-01-02"),
		"DefaultStartDate": time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location()).Format("2006-01-02"),
	}
	h.renderPage(w, "Free Income Calculator 2026", "calculator-content", data)
}

func (h *Handler) SmartMoney(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, "50/30/20 Budget Calculator", "smart-money-content", nil)
}

func (h *Handler) Housing(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, "Housing Affordability Calculator", "housing-content", nil)
}

func (h *Handler) Auto(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, "Auto Loan Calculator", "auto-content", nil)
}

func (h *Handler) Blog(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, "Financial Tips & Guides", "blog-content", nil)
}

func (h *Handler) FreeTools(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, "Free Financial Tools", "free-tools-content", nil)
}

func (h *Handler) GigCalculator(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, "Gig Worker Income Calculator", "gig-calculator-content", nil)
}

func (h *Handler) IncomeStreams(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, "Income Streams Tracker", "income-streams-content", nil)
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

	result := calc.CalculateBudgetAllocation(netMonthly)
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

	result := calc.CalculateMortgage(homePrice, downPaymentPct, interestRate, termYears, propertyTaxRate, annualInsurance)
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
	totalCost := monthlyPayment * termMonths

	result := map[string]interface{}{
		"VehiclePrice":   int(vehiclePrice),
		"DownPayment":    int(downPayment),
		"TradeIn":        int(tradeIn),
		"LoanAmount":     int(loanAmount),
		"InterestRate":   interestRate,
		"TermMonths":     termMonths,
		"MonthlyPayment": monthlyPayment,
		"TotalCost":      totalCost,
		"TotalInterest":  totalCost - int(loanAmount),
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

	result := calc.CalculateTaxes(grossAnnual, retirement401kPct, healthInsurance, stateTaxRate)
	h.renderPartial(w, "tax-results", result)
}
