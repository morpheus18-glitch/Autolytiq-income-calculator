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
	"github.com/autolytiq/income-calculator/internal/data"
	"github.com/autolytiq/income-calculator/internal/db"
)

// Handler holds dependencies for HTTP handlers.
type Handler struct {
	tmpl *template.Template
	db   *db.DB
}

// New creates a new Handler with the given template and optional database.
func New(tmpl *template.Template, database ...*db.DB) *Handler {
	h := &Handler{tmpl: tmpl}
	if len(database) > 0 {
		h.db = database[0]
	}
	return h
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
		Title:       "Free Income Calculator 2026 | Calculate Annual Salary from YTD Pay | Autolytiq",
		Description: "Calculate your projected annual income from year-to-date earnings in seconds. Free salary calculator for W2 employees, hourly workers & contractors. No signup required.",
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

func (h *Handler) BlogArticle(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	article := data.GetArticle(slug)
	if article == nil {
		http.NotFound(w, r)
		return
	}

	// Get related articles (same category, different slug, max 3)
	var related []data.BlogArticle
	for _, s := range data.AllBlogSlugs() {
		if s != slug {
			if a := data.GetArticle(s); a != nil {
				related = append(related, *a)
				if len(related) >= 3 {
					break
				}
			}
		}
	}

	pageData := map[string]interface{}{
		"Slug":            article.Slug,
		"Title":           article.Title,
		"Description":     article.Description,
		"Category":        article.Category,
		"ReadTime":        article.ReadTime,
		"Date":            article.Date,
		"DateFormatted":   formatDate(article.Date),
		"RelatedTool":     article.RelatedTool,
		"HTMLContent":     template.HTML(article.Content),
		"FAQSchema":       article.FAQs,
		"RelatedArticles": related,
	}

	h.renderPage(w, PageMeta{
		Title:       article.MetaTitle,
		Description: article.Description,
		Canonical:   baseURL + "/blog/" + article.Slug,
	}, "blog-article-content", pageData)
}

func formatDate(dateStr string) string {
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return dateStr
	}
	return t.Format("January 2, 2006")
}

func (h *Handler) FreeTools(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Free Financial Calculators & Tools | Autolytiq",
		Description: "Free online financial calculators: income projector, 50/30/20 budget planner, mortgage calculator, auto loan calculator, gig income tracker.",
		Canonical:   baseURL + "/free-tools",
	}, "free-tools-content", nil)
}

func (h *Handler) Taxes(w http.ResponseWriter, r *http.Request) {
	// Build state list for browse section
	type stateLink struct {
		Slug string
		Code string
		Name string
		Rate float64
		NoTax bool
	}
	var noTaxStates, taxStates []stateLink
	for _, slug := range data.AllStateSlugs() {
		s := data.GetState(slug)
		if s == nil {
			continue
		}
		sl := stateLink{Slug: s.Slug, Code: s.Code, Name: s.Name, Rate: s.TopRate, NoTax: !s.HasStateTax}
		if s.HasStateTax {
			taxStates = append(taxStates, sl)
		} else {
			noTaxStates = append(noTaxStates, sl)
		}
	}
	h.renderPage(w, PageMeta{
		Title:       "Federal & State Tax Calculator - Estimate Take-Home Pay | Autolytiq",
		Description: "Estimate your take-home pay after federal, state, Social Security, and Medicare taxes. Free tax calculator with 2024 brackets and deductions.",
		Canonical:   baseURL + "/taxes",
	}, "taxes-content", map[string]interface{}{"NoTaxStates": noTaxStates, "TaxStates": taxStates})
}

func (h *Handler) StateTax(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("state")
	s := data.GetState(slug)
	if s == nil {
		http.NotFound(w, r)
		return
	}

	// Estimate taxes on average salary
	avgSalary := float64(s.AverageSalary)
	// Rough federal estimate: ~12% effective rate for median incomes
	estFederal := int(avgSalary * 0.12)
	estState := int(avgSalary * s.TopRate / 100)
	estFICA := int(avgSalary * 0.0765)
	estNet := s.AverageSalary - estFederal - estState - estFICA

	// Related states: mix of no-tax states (if this is no-tax) or similar-rate states
	type relatedState struct {
		Slug string
		Code string
		Name string
		Rate float64
		NoTax bool
		COL  int
	}
	var related []relatedState
	allSlugs := data.AllStateSlugs()

	if !s.HasStateTax {
		// Show other no-tax states
		for _, rs := range allSlugs {
			if rs == slug { continue }
			other := data.GetState(rs)
			if other != nil && !other.HasStateTax {
				related = append(related, relatedState{Slug: other.Slug, Code: other.Code, Name: other.Name, NoTax: true, COL: other.CostOfLiving})
			}
		}
	}
	// Add states with similar cost of living or nearby rates until we have 8
	for _, rs := range allSlugs {
		if len(related) >= 8 { break }
		if rs == slug { continue }
		other := data.GetState(rs)
		if other == nil { continue }
		// Skip if already added
		alreadyAdded := false
		for _, r := range related {
			if r.Slug == other.Slug { alreadyAdded = true; break }
		}
		if alreadyAdded { continue }
		// Similar COL (within 15 points) or similar rate (within 2%)
		colDiff := other.CostOfLiving - s.CostOfLiving
		if colDiff < 0 { colDiff = -colDiff }
		rateDiff := other.TopRate - s.TopRate
		if rateDiff < 0 { rateDiff = -rateDiff }
		if colDiff <= 15 || rateDiff <= 2.0 {
			related = append(related, relatedState{Slug: other.Slug, Code: other.Code, Name: other.Name, Rate: other.TopRate, NoTax: !other.HasStateTax, COL: other.CostOfLiving})
		}
	}

	topRateStr := fmt.Sprintf("%.1f", s.TopRate)
	if !s.HasStateTax {
		topRateStr = "0"
	}

	pageData := map[string]interface{}{
		"Name":               s.Name,
		"Code":               s.Code,
		"Slug":               s.Slug,
		"NoTax":              !s.HasStateTax,
		"TopRate":            s.TopRate,
		"TopRateStr":         topRateStr,
		"LocalTaxes":         s.LocalTaxes,
		"CostOfLiving":       s.CostOfLiving,
		"AvgSalaryFormatted": formatMoney(s.AverageSalary),
		"AvgSalaryRaw":       formatMoney(s.AverageSalary),
		"Description":        s.Description,
		"Highlights":         s.Highlights,
		"Cities":             s.MajorCities,
		"EstFederalFormatted": formatMoney(estFederal),
		"EstStateFormatted":   formatMoney(estState),
		"EstFICAFormatted":    formatMoney(estFICA),
		"EstNetFormatted":     formatMoney(estNet),
		"EstMonthlyFormatted": formatMoney(estNet / 12),
		"RelatedStates":       related,
	}

	h.renderPage(w, PageMeta{
		Title:       fmt.Sprintf("%s Income Tax Calculator 2026 - Tax Rate & Take-Home Pay | Autolytiq", s.Name),
		Description: fmt.Sprintf("%s income tax guide: top rate %.1f%%, average salary $%s, cost of living %d. Calculate your %s take-home pay.", s.Name, s.TopRate, formatMoney(s.AverageSalary), s.CostOfLiving, s.Name),
		Canonical:   baseURL + "/taxes/" + s.Slug,
	}, "taxes-state-content", pageData)
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

func (h *Handler) Privacy(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Privacy Policy | Autolytiq",
		Description: "Learn how Autolytiq protects your data. Our income calculator stores data locally in your browser for maximum privacy.",
		Canonical:   baseURL + "/privacy",
	}, "privacy-content", nil)
}

func (h *Handler) Terms(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Terms of Service | Autolytiq",
		Description: "Terms of Service for using Autolytiq income calculator and financial tools.",
		Canonical:   baseURL + "/terms",
	}, "terms-content", nil)
}

func (h *Handler) AffordIndex(w http.ResponseWriter, r *http.Request) {
	type levelView struct {
		Slug               string
		Display            string
		TakeHomeFormatted  string
		MonthlyNetFormatted string
		MaxRentFormatted   string
	}
	var levels []levelView
	for _, slug := range data.AllAffordSlugs() {
		d := data.GetAffordBySlug(slug)
		if d != nil {
			levels = append(levels, levelView{
				Slug:               d.Slug,
				Display:            d.Display,
				TakeHomeFormatted:  formatMoney(d.TakeHome),
				MonthlyNetFormatted: formatMoney(d.MonthlyNet),
				MaxRentFormatted:   formatMoney(d.MaxRent),
			})
		}
	}
	h.renderPage(w, PageMeta{
		Title:       "Salary Budget Guides 2026 - What Can You Afford? | Autolytiq",
		Description: "See what you can afford on any salary from $30K to $200K. Budget breakdowns, take-home pay, housing and car affordability limits.",
		Canonical:   baseURL + "/afford",
	}, "afford-index-content", map[string]interface{}{"Levels": levels})
}

func (h *Handler) Afford(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("salary")
	d := data.GetAffordBySlug(slug)
	if d == nil {
		http.NotFound(w, r)
		return
	}

	type relatedView struct {
		Slug               string
		Display            string
		MonthlyNetFormatted string
	}
	var related []relatedView
	allSlugs := data.AllAffordSlugs()
	for _, s := range allSlugs {
		rd := data.GetAffordBySlug(s)
		if rd != nil && rd.Slug != slug {
			diff := rd.Salary - d.Salary
			if diff < 0 { diff = -diff }
			if diff <= 30000 {
				related = append(related, relatedView{Slug: rd.Slug, Display: rd.Display, MonthlyNetFormatted: formatMoney(rd.MonthlyNet)})
				if len(related) >= 4 { break }
			}
		}
	}

	// Prev/next navigation
	var prevSlug, prevDisplay, nextSlug, nextDisplay string
	for i, s := range allSlugs {
		if s == slug {
			if i > 0 {
				pd := data.GetAffordBySlug(allSlugs[i-1])
				if pd != nil { prevSlug = pd.Slug; prevDisplay = pd.Display }
			}
			if i < len(allSlugs)-1 {
				nd := data.GetAffordBySlug(allSlugs[i+1])
				if nd != nil { nextSlug = nd.Slug; nextDisplay = nd.Display }
			}
			break
		}
	}

	pageData := map[string]interface{}{
		"Display":              d.Display,
		"Slug":                 d.Slug,
		"TakeHomeFormatted":    formatMoney(d.TakeHome),
		"MonthlyNetFormatted":  formatMoney(d.MonthlyNet),
		"MaxRentFormatted":     formatMoney(d.MaxRent),
		"SavingsFormatted":     formatMoney(d.Savings),
		"NeedsFormatted":       formatMoney(d.Needs),
		"WantsFormatted":       formatMoney(d.Wants),
		"MaxMortgageFormatted": formatMoney(d.MaxMortgage),
		"MaxCarFormatted":      formatMoney(d.MaxCar),
		"EmergencyFundFormatted": formatMoney(d.EmergencyFund),
		"HourlyFormatted":      formatMoney(d.HourlyRate),
		"WeeklyFormatted":      formatMoney(d.WeeklyPay),
		"Related":              related,
		"PrevSlug":             prevSlug,
		"PrevDisplay":          prevDisplay,
		"NextSlug":             nextSlug,
		"NextDisplay":          nextDisplay,
	}

	h.renderPage(w, PageMeta{
		Title:       fmt.Sprintf("Budget on %s Salary - What Can You Afford? | Autolytiq", d.Display),
		Description: fmt.Sprintf("Complete budget breakdown for a %s salary. Take-home pay: $%s, max rent: $%s/mo, savings: $%s/mo.", d.Display, formatMoney(d.TakeHome), formatMoney(d.MaxRent), formatMoney(d.Savings)),
		Canonical:   baseURL + "/afford/" + d.Slug,
	}, "afford-content", pageData)
}

func (h *Handler) SalaryIndex(w http.ResponseWriter, r *http.Request) {
	type jobView struct {
		Slug           string
		Title          string
		Category       string
		GrowthOutlook  string
		MedianFormatted string
		EntryFormatted string
		SeniorFormatted string
	}
	var jobs []jobView
	for _, slug := range data.AllSalarySlugs() {
		s := data.GetSalary(slug)
		if s != nil {
			jobs = append(jobs, jobView{
				Slug:           s.Slug,
				Title:          s.Title,
				Category:       s.Category,
				GrowthOutlook:  s.GrowthOutlook,
				MedianFormatted: formatMoney(s.Median),
				EntryFormatted: formatMoney(s.Entry),
				SeniorFormatted: formatMoney(s.Senior),
			})
		}
	}
	h.renderPage(w, PageMeta{
		Title:       "Salary Guide 2026 - How Much Do Jobs Pay? | Autolytiq",
		Description: "Explore 2026 salary data for 20+ jobs. See median pay, entry-to-senior ranges, top states, and growth outlook.",
		Canonical:   baseURL + "/salary",
	}, "salary-index-content", map[string]interface{}{"Jobs": jobs})
}

func (h *Handler) Salary(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("job")
	s := data.GetSalary(slug)
	if s == nil {
		http.NotFound(w, r)
		return
	}

	type stateView struct {
		Rank            int
		State           string
		SalaryFormatted string
	}
	var topStates []stateView
	for i, ts := range s.TopStates {
		topStates = append(topStates, stateView{Rank: i + 1, State: ts.State, SalaryFormatted: formatMoney(ts.Salary)})
	}

	type relatedJobView struct {
		Slug           string
		Title          string
		MedianFormatted string
	}
	var relatedJobs []relatedJobView
	for _, rSlug := range s.RelatedJobs {
		rj := data.GetSalary(rSlug)
		if rj != nil {
			relatedJobs = append(relatedJobs, relatedJobView{Slug: rj.Slug, Title: rj.Title, MedianFormatted: formatMoney(rj.Median)})
		}
	}

	// Affordability data for sidebar
	type affordView struct {
		Slug               string
		MaxRentFormatted   string
		MaxCarFormatted    string
		SavingsFormatted   string
	}
	var afford *affordView
	ad := data.GetAffordBySlug(data.ClosestAffordSlug(s.Median))
	if ad != nil {
		afford = &affordView{
			Slug:             ad.Slug,
			MaxRentFormatted: formatMoney(ad.MaxRent),
			MaxCarFormatted:  formatMoney(ad.MaxCar),
			SavingsFormatted: formatMoney(ad.Savings),
		}
	}

	growthLabels := map[string]string{
		"declining": "Declining", "stable": "Stable",
		"growing": "Above Average", "fast": "Much Faster Than Average",
	}

	pageData := map[string]interface{}{
		"Title":           s.Title,
		"TitleLower":      strings.ToLower(s.Title),
		"Description":     s.Description,
		"Category":        s.Category,
		"Education":       s.Education,
		"GrowthRate":      s.GrowthRate,
		"GrowthLabel":     growthLabels[s.GrowthOutlook],
		"MedianFormatted": formatMoney(s.Median),
		"EntryFormatted":  formatMoney(s.Entry),
		"MidFormatted":    formatMoney(s.Mid),
		"SeniorFormatted": formatMoney(s.Senior),
		"P10Formatted":    formatMoney(s.Percentile10),
		"P25Formatted":    formatMoney(s.Percentile25),
		"P75Formatted":    formatMoney(s.Percentile75),
		"P90Formatted":    formatMoney(s.Percentile90),
		"TopStates":       topStates,
		"RelatedJobs":     relatedJobs,
		"Afford":          afford,
	}

	h.renderPage(w, PageMeta{
		Title:       fmt.Sprintf("%s Salary 2026 - How Much Do %ss Make? | Autolytiq", s.Title, s.Title),
		Description: fmt.Sprintf("%s salary guide for 2026. Median salary: $%s. Entry-level to senior pay ranges, top-paying states, and job outlook.", s.Title, formatMoney(s.Median)),
		Canonical:   baseURL + "/salary/" + s.Slug,
	}, "salary-content", pageData)
}

func (h *Handler) BestIndex(w http.ResponseWriter, r *http.Request) {
	type catView struct {
		Slug         string
		Name         string
		Description  string
		WinnerName   string
		WinnerRating float64
		ProductCount int
	}
	var cats []catView
	for _, c := range data.AllCategories() {
		winnerName := ""
		var winnerRating float64
		for _, p := range c.Products {
			if p.ID == c.WinnerID {
				winnerName = p.Name
				winnerRating = p.Rating
				break
			}
		}
		cats = append(cats, catView{
			Slug:         c.Slug,
			Name:         c.Name,
			Description:  c.Description,
			WinnerName:   winnerName,
			WinnerRating: winnerRating,
			ProductCount: len(c.Products),
		})
	}

	type vsView struct {
		Slug  string
		Title string
	}
	var versus []vsView
	for _, v := range data.AllVersusComparisons() {
		versus = append(versus, vsView{Slug: v.Slug, Title: v.Title})
	}

	h.renderPage(w, PageMeta{
		Title:       "Best Financial Products 2026 - Expert Comparisons | Autolytiq",
		Description: "Compare the best budgeting apps, credit monitoring, savings accounts, auto loans, personal loans, and investment apps of 2026.",
		Canonical:   baseURL + "/best",
	}, "best-index-content", map[string]interface{}{"Categories": cats, "Versus": versus})
}

func (h *Handler) BestCategory(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("category")
	cat := data.GetCategory(slug)
	if cat == nil {
		http.NotFound(w, r)
		return
	}

	type prodView struct {
		Name        string
		Description string
		Rating      float64
		Pricing     string
		Pros        []string
		Cons        []string
		BestFor     []string
		AffURL      string
		IsWinner    bool
		IsRunnerUp  bool
	}
	var products []prodView
	for _, p := range cat.Products {
		products = append(products, prodView{
			Name: p.Name, Description: p.Description, Rating: p.Rating,
			Pricing: p.Pricing, Pros: p.Pros, Cons: p.Cons, BestFor: p.BestFor,
			AffURL: p.AffURL, IsWinner: p.ID == cat.WinnerID, IsRunnerUp: p.ID == cat.RunnerUpID,
		})
	}

	type featureRow struct {
		Name   string
		Values []string
	}
	var features []featureRow
	for _, fname := range cat.ComparisonFeatures {
		row := featureRow{Name: fname}
		for _, p := range cat.Products {
			v := p.Features[fname]
			if v == "" {
				v = "—"
			}
			row.Values = append(row.Values, v)
		}
		features = append(features, row)
	}

	type relatedCat struct {
		Slug string
		Name string
	}
	var related []relatedCat
	for _, c := range data.AllCategories() {
		if c.Slug != slug {
			related = append(related, relatedCat{Slug: c.Slug, Name: c.Name})
		}
	}

	h.renderPage(w, PageMeta{
		Title:       cat.MetaTitle,
		Description: cat.MetaDescription,
		Canonical:   baseURL + "/best/" + cat.Slug,
	}, "best-category-content", map[string]interface{}{
		"Name":               cat.Name,
		"Description":        cat.Description,
		"Products":           products,
		"Features":           features,
		"RelatedCategories":  related,
	})
}

func (h *Handler) CompareIndex(w http.ResponseWriter, r *http.Request) {
	type vsView struct {
		Slug     string
		Title    string
		Verdict  string
		Category string
	}
	var versus []vsView
	for _, v := range data.AllVersusComparisons() {
		catName := ""
		cat := data.GetCategory(v.RelatedCategory)
		if cat != nil {
			catName = cat.Name
		}
		versus = append(versus, vsView{Slug: v.Slug, Title: v.Title, Verdict: v.Verdict, Category: catName})
	}

	type catView struct {
		Slug string
		Name string
	}
	var cats []catView
	for _, c := range data.AllCategories() {
		cats = append(cats, catView{Slug: c.Slug, Name: c.Name})
	}

	h.renderPage(w, PageMeta{
		Title:       "Product Comparisons 2026 - Head-to-Head Reviews | Autolytiq",
		Description: "Side-by-side comparisons of popular financial products. YNAB vs Mint, Credit Karma vs Experian, SoFi vs Marcus, and more.",
		Canonical:   baseURL + "/compare",
	}, "compare-index-content", map[string]interface{}{"Versus": versus, "Categories": cats})
}

func (h *Handler) CompareDetail(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	vs := data.GetVersus(slug)
	if vs == nil {
		http.NotFound(w, r)
		return
	}

	type prodView struct {
		Name        string
		Description string
		Rating      float64
		Pricing     string
		Pros        []string
		Cons        []string
		AffURL      string
	}

	type relatedVS struct {
		Slug  string
		Title string
	}
	var related []relatedVS
	for _, v := range data.AllVersusComparisons() {
		if v.Slug != slug {
			related = append(related, relatedVS{Slug: v.Slug, Title: v.Title})
		}
	}

	h.renderPage(w, PageMeta{
		Title:       vs.MetaTitle,
		Description: vs.MetaDescription,
		Canonical:   baseURL + "/compare/" + vs.Slug,
	}, "compare-detail-content", map[string]interface{}{
		"Title":           vs.Title,
		"Verdict":         vs.Verdict,
		"ProductA":        prodView{Name: vs.ProductA.Name, Description: vs.ProductA.Description, Rating: vs.ProductA.Rating, Pricing: vs.ProductA.Pricing, Pros: vs.ProductA.Pros, Cons: vs.ProductA.Cons, AffURL: vs.ProductA.AffURL},
		"ProductB":        prodView{Name: vs.ProductB.Name, Description: vs.ProductB.Description, Rating: vs.ProductB.Rating, Pricing: vs.ProductB.Pricing, Pros: vs.ProductB.Pros, Cons: vs.ProductB.Cons, AffURL: vs.ProductB.AffURL},
		"ChooseAIf":       vs.ChooseAIf,
		"ChooseBIf":       vs.ChooseBIf,
		"RelatedCategory": vs.RelatedCategory,
		"RelatedVersus":   related,
	})
}

func (h *Handler) RentVsBuy(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Rent vs Buy Calculator - Should You Rent or Buy a Home? | Autolytiq",
		Description: "Compare the true cost of renting versus buying a home over time. See monthly costs, equity building, and which option saves you more money.",
		Canonical:   baseURL + "/rent-vs-buy",
	}, "rent-vs-buy-content", nil)
}

func (h *Handler) CalculateRentVsBuy(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	homePrice, _ := strconv.ParseFloat(cleanMoney(r.FormValue("home_price")), 64)
	downPct, _ := strconv.ParseFloat(r.FormValue("down_payment_pct"), 64)
	mortgageRate, _ := strconv.ParseFloat(r.FormValue("mortgage_rate"), 64)
	appreciation, _ := strconv.ParseFloat(r.FormValue("home_appreciation"), 64)
	monthlyRent, _ := strconv.ParseFloat(cleanMoney(r.FormValue("monthly_rent")), 64)
	rentIncrease, _ := strconv.ParseFloat(r.FormValue("rent_increase"), 64)
	years, _ := strconv.Atoi(r.FormValue("years"))

	if homePrice <= 0 || monthlyRent <= 0 {
		h.renderError(w, "Please enter a valid home price and rent", http.StatusBadRequest)
		return
	}
	if years <= 0 {
		years = 5
	}

	// Buy calculations
	downPayment := homePrice * downPct / 100
	loanAmount := homePrice - downPayment
	monthlyMortgage := calc.CalculateMonthlyPayment(loanAmount, mortgageRate, 360)
	propertyTax := int(homePrice * 0.011 / 12)      // 1.1% annually
	insurance := 100                                  // ~$1200/yr
	maintenance := int(homePrice * 0.01 / 12)         // 1% annually
	pmi := 0
	if downPct < 20 {
		pmi = int(loanAmount * 0.005 / 12) // ~0.5% PMI
	}
	buyMonthly := monthlyMortgage + propertyTax + insurance + maintenance + pmi
	buyTotalPaid := buyMonthly * years * 12 + int(downPayment)

	// Home value after appreciation
	futureHomeValue := homePrice
	for i := 0; i < years; i++ {
		futureHomeValue *= (1 + appreciation/100)
	}

	// Simplified equity: down payment + appreciation gain + ~30% of mortgage payments go to principal in early years
	principalPaid := int(float64(monthlyMortgage*years*12) * 0.30) // rough estimate
	equity := int(downPayment) + int(futureHomeValue-homePrice) + principalPaid
	buyNetCost := buyTotalPaid - equity

	// Rent calculations
	totalRent := 0
	currentRent := monthlyRent
	finalRent := monthlyRent
	for y := 0; y < years; y++ {
		totalRent += int(currentRent * 12)
		finalRent = currentRent
		currentRent *= (1 + rentIncrease/100)
	}

	// Investment returns: down payment invested + monthly savings invested
	investReturn := 0.07 // 7% annual stock market return
	savedDP := downPayment
	for y := 0; y < years; y++ {
		savedDP *= (1 + investReturn)
	}
	investmentReturns := int(savedDP - downPayment)
	rentNetCost := totalRent - investmentReturns

	buyWins := buyNetCost < rentNetCost
	var savings int
	if buyWins {
		savings = rentNetCost - buyNetCost
	} else {
		savings = buyNetCost - rentNetCost
	}

	priceToRent := homePrice / (monthlyRent * 12)

	result := map[string]interface{}{
		"BuyWins":                    buyWins,
		"SavingsFormatted":           formatMoney(savings),
		"Years":                      years,
		"BuyMonthlyFormatted":        formatMoney(buyMonthly),
		"DownPaymentFormatted":       formatMoney(int(downPayment)),
		"BuyTotalPaidFormatted":      formatMoney(buyTotalPaid),
		"HomeValueFormatted":         formatMoney(int(futureHomeValue)),
		"EquityFormatted":            formatMoney(equity),
		"BuyNetCostFormatted":        formatMoney(buyNetCost),
		"RentStartFormatted":         formatMoney(int(monthlyRent)),
		"RentEndFormatted":           formatMoney(int(finalRent)),
		"RentTotalFormatted":         formatMoney(totalRent),
		"InvestmentReturnsFormatted": formatMoney(investmentReturns),
		"RentNetCostFormatted":       formatMoney(rentNetCost),
		"PriceToRent":                priceToRent,
		"PriceToRentStr":             fmt.Sprintf("%.1f", priceToRent),
	}
	h.renderPartial(w, "rent-vs-buy-results", result)
}

func (h *Handler) Share(w http.ResponseWriter, r *http.Request) {
	annual, _ := strconv.Atoi(r.URL.Query().Get("a"))
	monthly, _ := strconv.Atoi(r.URL.Query().Get("m"))
	weekly, _ := strconv.Atoi(r.URL.Query().Get("w"))
	daily, _ := strconv.Atoi(r.URL.Query().Get("d"))

	if annual <= 0 {
		http.Redirect(w, r, "/calculator", http.StatusFound)
		return
	}

	pageData := map[string]interface{}{
		"AnnualFormatted":  formatMoney(annual),
		"MonthlyFormatted": "",
		"WeeklyFormatted":  "",
		"DailyFormatted":   "",
	}
	if monthly > 0 {
		pageData["MonthlyFormatted"] = formatMoney(monthly)
	}
	if weekly > 0 {
		pageData["WeeklyFormatted"] = formatMoney(weekly)
	}
	if daily > 0 {
		pageData["DailyFormatted"] = formatMoney(daily)
	}

	h.renderPage(w, PageMeta{
		Title:       fmt.Sprintf("$%s Annual Income Breakdown | Autolytiq", formatMoney(annual)),
		Description: fmt.Sprintf("Income breakdown: $%s annual, $%s monthly. Calculate your own projected income at Autolytiq.", formatMoney(annual), formatMoney(monthly)),
		Canonical:   baseURL + "/share",
	}, "share-content", pageData)
}

func (h *Handler) Quiz(w http.ResponseWriter, r *http.Request) {
	q := data.QuizQuestions[0]
	stepData := map[string]interface{}{
		"StepNum":     1,
		"TotalSteps":  len(data.QuizQuestions),
		"ProgressPct": 10,
		"Question":    q.Question,
		"Options":     q.Options,
		"PrevAnswers": []int{},
	}
	h.renderPage(w, PageMeta{
		Title:       "Financial Personality Quiz - What's Your Money Type? | Autolytiq",
		Description: "Take our free 10-question quiz to discover your financial personality type. Get personalized money tips, strengths, and recommended tools.",
		Canonical:   baseURL + "/quiz",
	}, "quiz-content", stepData)
}

func (h *Handler) QuizAnswer(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	// Collect all answers from form
	answerStrs := r.Form["answers"]
	var answers []int
	for _, a := range answerStrs {
		v, err := strconv.Atoi(a)
		if err != nil {
			continue
		}
		answers = append(answers, v)
	}

	stepNum, _ := strconv.Atoi(r.FormValue("step"))
	totalQ := len(data.QuizQuestions)

	// If we have all answers, show result
	if len(answers) >= totalQ {
		resultID := data.CalculateQuizResult(answers)
		p := data.GetQuizPersonality(resultID)
		if p == nil {
			p = data.GetQuizPersonality("balanced")
		}
		resultData := map[string]interface{}{
			"Title":       p.Title,
			"Emoji":       p.Emoji,
			"Color":       p.Color,
			"Description": p.Description,
			"Strengths":   p.Strengths,
			"WatchOuts":   p.WatchOuts,
			"Tips":        p.Tips,
			"Tools":       p.Tools,
		}
		h.renderPartial(w, "quiz-result", resultData)
		return
	}

	// Show next question
	nextStep := stepNum + 1
	if nextStep > totalQ {
		nextStep = totalQ
	}
	q := data.QuizQuestions[nextStep-1]
	pct := (nextStep * 100) / totalQ

	stepData := map[string]interface{}{
		"StepNum":     nextStep,
		"TotalSteps":  totalQ,
		"ProgressPct": pct,
		"Question":    q.Question,
		"Options":     q.Options,
		"PrevAnswers": answers,
	}
	h.renderPartial(w, "quiz-step", stepData)
}

func (h *Handler) IncomeStreams(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Income Streams Tracker - Multiple Income Calculator | Autolytiq",
		Description: "Track and total all your income sources: salary, freelance, investments, and rental income. See your complete annual and monthly picture.",
		Canonical:   baseURL + "/income-streams",
	}, "income-streams-content", nil)
}

func (h *Handler) Subscribe(w http.ResponseWriter, r *http.Request) {
	if h.db == nil {
		h.renderError(w, "Service unavailable", http.StatusServiceUnavailable)
		return
	}
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}
	email := r.FormValue("email")
	source := r.FormValue("source")
	if source == "" {
		source = "newsletter"
	}
	_, isNew, err := h.db.CreateLead(email, "", "", source)
	if err != nil {
		h.renderError(w, "Please enter a valid email address", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if isNew {
		fmt.Fprint(w, `<div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center">
			<p class="text-emerald-600 dark:text-emerald-400 font-medium">You're subscribed! Check your inbox for tips.</p>
		</div>`)
	} else {
		fmt.Fprint(w, `<div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
			<p class="text-blue-600 dark:text-blue-400 font-medium">You're already subscribed!</p>
		</div>`)
	}
}

func (h *Handler) Unsubscribe(w http.ResponseWriter, r *http.Request) {
	token := r.PathValue("token")
	if h.db == nil {
		http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
		return
	}
	email, err := h.db.Unsubscribe(token)
	if err != nil {
		h.renderPage(w, PageMeta{
			Title: "Unsubscribe | Autolytiq",
		}, "unsubscribe-content", map[string]interface{}{
			"Success": false,
			"Message": "Invalid or expired unsubscribe link.",
		})
		return
	}
	h.renderPage(w, PageMeta{
		Title: "Unsubscribed | Autolytiq",
	}, "unsubscribe-content", map[string]interface{}{
		"Success": true,
		"Email":   email,
		"Message": "You have been unsubscribed.",
	})
}

func (h *Handler) Sitemap(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/xml")
	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://autolytiqs.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://autolytiqs.com/calculator</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://autolytiqs.com/smart-money</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://autolytiqs.com/housing</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://autolytiqs.com/auto</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://autolytiqs.com/gig-calculator</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://autolytiqs.com/income-streams</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://autolytiqs.com/taxes</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://autolytiqs.com/free-tools</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://autolytiqs.com/quiz</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://autolytiqs.com/rent-vs-buy</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://autolytiqs.com/inflation</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://autolytiqs.com/blog</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>
  <url><loc>https://autolytiqs.com/afford</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://autolytiqs.com/salary</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
	// Blog articles
	for _, slug := range data.AllBlogSlugs() {
		fmt.Fprintf(&b, "\n  <url><loc>https://autolytiqs.com/blog/%s</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>", slug)
	}
	// Afford pages
	for _, slug := range data.AllAffordSlugs() {
		fmt.Fprintf(&b, "\n  <url><loc>https://autolytiqs.com/afford/%s</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>", slug)
	}
	// Salary pages
	for _, slug := range data.AllSalarySlugs() {
		fmt.Fprintf(&b, "\n  <url><loc>https://autolytiqs.com/salary/%s</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>", slug)
	}
	// State tax pages
	for _, slug := range data.AllStateSlugs() {
		fmt.Fprintf(&b, "\n  <url><loc>https://autolytiqs.com/taxes/%s</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>", slug)
	}
	// Best/Compare pages
	b.WriteString("\n  <url><loc>https://autolytiqs.com/best</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>")
	b.WriteString("\n  <url><loc>https://autolytiqs.com/compare</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>")
	for _, slug := range data.AllCategorySlugs() {
		fmt.Fprintf(&b, "\n  <url><loc>https://autolytiqs.com/best/%s</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>", slug)
	}
	for _, slug := range data.AllVersusSlugs() {
		fmt.Fprintf(&b, "\n  <url><loc>https://autolytiqs.com/compare/%s</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>", slug)
	}
	b.WriteString(`
  <url><loc>https://autolytiqs.com/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://autolytiqs.com/terms</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>`)
	w.Write([]byte(b.String()))
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

func (h *Handler) Inflation(w http.ResponseWriter, r *http.Request) {
	h.renderPage(w, PageMeta{
		Title:       "Inflation & Compound Interest Calculator | Autolytiq",
		Description: "Calculate how inflation erodes your purchasing power and how compound interest grows your wealth over time. Free financial calculator.",
		Canonical:   baseURL + "/inflation",
	}, "inflation-content", nil)
}

func (h *Handler) CalculateInflation(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}
	amount, _ := strconv.ParseFloat(cleanMoney(r.FormValue("amount")), 64)
	rate, _ := strconv.ParseFloat(r.FormValue("rate"), 64)
	years, _ := strconv.Atoi(r.FormValue("years"))
	if amount <= 0 || years <= 0 {
		h.renderError(w, "Please enter valid values", http.StatusBadRequest)
		return
	}

	futureValue := amount
	for i := 0; i < years; i++ {
		futureValue /= (1 + rate/100)
	}
	lost := amount - futureValue
	retainedPct := futureValue / amount * 100

	result := map[string]interface{}{
		"OriginalFormatted":   formatMoney(int(amount)),
		"FutureValueFormatted": formatMoney(int(futureValue)),
		"LostFormatted":        formatMoney(int(lost)),
		"RetainedPct":          fmt.Sprintf("%.0f", retainedPct),
		"Years":                years,
	}
	h.renderPartial(w, "inflation-results", result)
}

func (h *Handler) CalculateCompound(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.renderError(w, "Invalid form data", http.StatusBadRequest)
		return
	}
	principal, _ := strconv.ParseFloat(cleanMoney(r.FormValue("principal")), 64)
	monthly, _ := strconv.ParseFloat(cleanMoney(r.FormValue("monthly")), 64)
	rate, _ := strconv.ParseFloat(r.FormValue("rate"), 64)
	years, _ := strconv.Atoi(r.FormValue("years"))
	if principal <= 0 || years <= 0 {
		h.renderError(w, "Please enter valid values", http.StatusBadRequest)
		return
	}

	monthlyRate := rate / 100 / 12
	months := years * 12
	balance := principal
	for m := 0; m < months; m++ {
		balance = balance*(1+monthlyRate) + monthly
	}
	totalInvested := principal + monthly*float64(months)
	interestEarned := balance - totalInvested
	growthMult := balance / totalInvested

	result := map[string]interface{}{
		"FutureValueFormatted":    formatMoney(int(balance)),
		"TotalInvestedFormatted":  formatMoney(int(totalInvested)),
		"InterestEarnedFormatted": formatMoney(int(interestEarned)),
		"GrowthMultiple":          fmt.Sprintf("%.1f", growthMult),
		"Years":                   years,
	}
	h.renderPartial(w, "compound-results", result)
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
