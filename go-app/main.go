package main

import (
	"embed"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"os"

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

	// Create handler with templates
	h := handlers.New(tmpl)

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
	mux.HandleFunc("GET /blog", h.Blog)
	mux.HandleFunc("GET /free-tools", h.FreeTools)
	mux.HandleFunc("GET /gig-calculator", h.GigCalculator)
	mux.HandleFunc("GET /income-streams", h.IncomeStreams)

	// HTMX API endpoints (partials)
	mux.HandleFunc("POST /api/calculate-income", h.CalculateIncome)
	mux.HandleFunc("POST /api/calculate-budget", h.CalculateBudget)
	mux.HandleFunc("POST /api/calculate-mortgage", h.CalculateMortgage)
	mux.HandleFunc("POST /api/calculate-auto", h.CalculateAuto)
	mux.HandleFunc("POST /api/calculate-taxes", h.CalculateTaxes)

	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Apply middleware
	chain := middleware.Chain(
		middleware.Logger(nil),
		middleware.Recover(nil),
		middleware.SecurityHeaders,
		middleware.Compress,
	)
	handler := chain(mux)

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
