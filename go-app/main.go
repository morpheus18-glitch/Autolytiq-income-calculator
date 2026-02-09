package main

import (
	"embed"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/autolytiq/income-calculator/internal/db"
	"github.com/autolytiq/income-calculator/internal/handlers"
	"github.com/autolytiq/income-calculator/internal/middleware"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

//go:embed static/*
var staticFS embed.FS

//go:embed templates/*.html templates/**/*.html
var templatesFS embed.FS

func main() {
	// Template functions
	funcMap := template.FuncMap{
		"formatNumber": func(n interface{}) string {
			p := message.NewPrinter(language.English)
			switch v := n.(type) {
			case int:
				return p.Sprintf("%d", v)
			case int64:
				return p.Sprintf("%d", v)
			case float64:
				return p.Sprintf("%.0f", v)
			default:
				return p.Sprintf("%v", n)
			}
		},
	}

	// Parse templates with functions
	tmpl, err := template.New("").Funcs(funcMap).ParseFS(templatesFS, "templates/*.html", "templates/partials/*.html")
	if err != nil {
		log.Fatal("Failed to parse templates:", err)
	}

	// Open database for lead capture
	database, err := db.Open()
	if err != nil {
		log.Printf("Warning: could not open leads database: %v (lead capture disabled)", err)
	}

	// Create handler with templates and database
	h := handlers.New(tmpl, database)

	// Create router
	mux := http.NewServeMux()

	// Static files
	staticSub, _ := fs.Sub(staticFS, "static")
	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticSub))))

	// Pages
	mux.HandleFunc("GET /{$}", h.Home)
	mux.HandleFunc("GET /calculator", h.Calculator)
	mux.HandleFunc("GET /smart-money", h.SmartMoney)
	mux.HandleFunc("GET /housing", h.Housing)
	mux.HandleFunc("GET /auto", h.Auto)
	mux.HandleFunc("GET /taxes", h.Taxes)
	mux.HandleFunc("GET /taxes/{state}", h.StateTax)
	mux.HandleFunc("GET /blog", h.Blog)
	mux.HandleFunc("GET /blog/{slug}", h.BlogArticle)
	mux.HandleFunc("GET /free-tools", h.FreeTools)
	mux.HandleFunc("GET /gig-calculator", h.GigCalculator)
	mux.HandleFunc("GET /income-streams", h.IncomeStreams)
	mux.HandleFunc("GET /rent-vs-buy", h.RentVsBuy)
	mux.HandleFunc("GET /inflation", h.Inflation)
	mux.HandleFunc("GET /share", h.Share)
	mux.HandleFunc("GET /income-calculator", h.CalcVariantIndex)
	mux.HandleFunc("GET /income-calculator/{variant}", h.CalcVariant)
	mux.HandleFunc("GET /quiz", h.Quiz)
	mux.HandleFunc("GET /desk", h.Desk)
	mux.HandleFunc("GET /best", h.BestIndex)
	mux.HandleFunc("GET /best/{category}", h.BestCategory)
	mux.HandleFunc("GET /compare", h.CompareIndex)
	mux.HandleFunc("GET /compare/{slug}", h.CompareDetail)
	mux.HandleFunc("GET /privacy", h.Privacy)
	mux.HandleFunc("GET /terms", h.Terms)
	mux.HandleFunc("GET /afford", h.AffordIndex)
	mux.HandleFunc("GET /afford/{salary}", h.Afford)
	mux.HandleFunc("GET /salary", h.SalaryIndex)
	mux.HandleFunc("GET /salary/{job}", h.Salary)
	mux.HandleFunc("GET /pricing", h.Pricing)
	mux.HandleFunc("GET /checkout/success", h.CheckoutSuccess)
	mux.HandleFunc("GET /checkout/cancel", h.CheckoutCancel)

	// HTMX API endpoints (partials)
	mux.HandleFunc("POST /api/calculate-income", h.CalculateIncome)
	mux.HandleFunc("POST /api/calculate-budget", h.CalculateBudget)
	mux.HandleFunc("POST /api/calculate-mortgage", h.CalculateMortgage)
	mux.HandleFunc("POST /api/calculate-auto", h.CalculateAuto)
	mux.HandleFunc("POST /api/calculate-taxes", h.CalculateTaxes)
	mux.HandleFunc("POST /api/calculate-gig", h.CalculateGig)
	mux.HandleFunc("POST /api/calculate-streams", h.CalculateStreams)
	mux.HandleFunc("POST /api/calculate-rent-vs-buy", h.CalculateRentVsBuy)
	mux.HandleFunc("POST /api/calculate-inflation", h.CalculateInflation)
	mux.HandleFunc("POST /api/calculate-compound", h.CalculateCompound)
	mux.HandleFunc("POST /api/quiz-answer", h.QuizAnswer)
	mux.HandleFunc("POST /api/subscribe", h.Subscribe)
	mux.HandleFunc("POST /api/create-checkout", h.CreateCheckout)
	mux.HandleFunc("POST /api/webhooks/stripe", h.StripeWebhook)
	mux.HandleFunc("GET /unsubscribe/{token}", h.Unsubscribe)

	// Admin
	mux.HandleFunc("GET /admin", h.AdminDashboard)
	mux.HandleFunc("GET /admin/login", h.AdminLogin)
	mux.HandleFunc("POST /admin/login", h.AdminLoginPost)
	mux.HandleFunc("GET /admin/logout", h.AdminLogout)
	mux.HandleFunc("GET /admin/export-csv", h.AdminExportCSV)
	mux.HandleFunc("POST /admin/toggle/{id}", h.AdminToggleLead)
	mux.HandleFunc("DELETE /admin/delete/{id}", h.AdminDeleteLead)
	mux.HandleFunc("GET /api/track-affiliate", h.TrackAffiliate)
	mux.HandleFunc("POST /admin/drip-trigger", h.AdminDripTrigger)
	mux.HandleFunc("GET /admin/drip-stats", h.AdminDripStats)

	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// robots.txt
	mux.HandleFunc("GET /robots.txt", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte("User-agent: *\nAllow: /\n\nSitemap: https://autolytiqs.com/sitemap.xml\n"))
	})

	// sitemap.xml (dynamic: includes programmatic afford/salary/blog pages)
	mux.HandleFunc("GET /sitemap.xml", h.Sitemap)

	// Apply middleware
	chain := middleware.Chain(
		middleware.Logger(nil),
		middleware.Recover(nil),
		middleware.SecurityHeaders,
		middleware.CSRFToken,
		middleware.RateLimiter(30, time.Minute), // 30 POST requests per IP per minute
		middleware.Compress,
	)
	handler := chain(mux)

	// Wrap with page view tracking
	if database != nil {
		inner := handler
		handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			p := r.URL.Path
			if r.Method == "GET" && !strings.HasPrefix(p, "/static/") && !strings.HasPrefix(p, "/api/") &&
				!strings.HasPrefix(p, "/admin") && p != "/health" && p != "/robots.txt" && p != "/sitemap.xml" {
				go database.TrackPageView(p, r.Referer(), r.UserAgent(), r.RemoteAddr)
			}
			inner.ServeHTTP(w, r)
		})
	}

	// Background drip campaign processor (runs every hour)
	go func() {
		time.Sleep(30 * time.Second) // Wait for server to fully start
		for {
			sent := h.ProcessDrip()
			if sent > 0 {
				log.Printf("Drip campaign: sent %d emails", sent)
			}
			time.Sleep(1 * time.Hour)
		}
	}()

	// Get port from env or default
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	log.Printf("Server starting on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
