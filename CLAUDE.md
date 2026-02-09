# Project Overview

**Autolytiqs** — a personal finance income calculator app deployed at **autolytiqs.com**.

**What it does:** Helps users calculate annual income from YTD earnings, analyze affordability (housing, auto), build budgets, estimate taxes, compare financial products, and plan gig/freelance income. Includes programmatic SEO pages, blog content, affiliate monetization, email drip campaigns, and an admin dashboard.

**Target users:** W2 employees, gig workers, freelancers who need to project annual income from partial-year data for loan applications, budgeting, and financial planning.

# Tech Stack

**Primary:** Go + HTMX (server-rendered). The Go app in `go-app/` is the production server. Always make changes here first.

**Legacy (not active):** TypeScript (React + Express) in `packages/`. Not currently deployed.

| Layer | Technology |
|-------|-----------|
| Server | Go standard library (`net/http`) |
| Frontend | HTMX + Alpine.js + HTML templates + Tailwind CSS (CDN) |
| Templates | Go `html/template` with embedded FS |
| Middleware | Custom Go (logger, recover, security headers, rate limiter, gzip) |
| Calculations | Go (`internal/calc/`) |
| Database | SQLite (`leads.db`) — leads, page views, affiliate clicks, drip sends |
| Email | SMTP via `net/smtp` (`internal/email/`) |
| SSL | Let's Encrypt (certbot) |
| DNS | Cloudflare |
| Build | `go build -o server .` |

# Architecture

## Project Structure

```
/
├── go-app/                  # PRIMARY — Go+HTMX production server
│   ├── main.go              # Entry point (port 5000), template parsing, routing
│   ├── server               # Compiled binary
│   ├── leads.db             # SQLite database (leads, page views, affiliate clicks, drip sends)
│   ├── internal/
│   │   ├── handlers/        # HTTP handlers (pages + HTMX partials + admin)
│   │   ├── middleware/       # Logger, recover, security headers, rate limiter, CSRF, gzip
│   │   ├── calc/            # Calculation logic + tests
│   │   ├── data/            # Static data (blog articles, calculator variants, afford/salary pages, drip emails)
│   │   ├── db/              # SQLite database access (leads, page views, affiliate, drip)
│   │   └── email/           # SMTP email sender
│   ├── static/              # Embedded CSS/JS assets
│   └── templates/           # HTML templates
│       └── partials/        # HTMX partial result templates
├── packages/                # LEGACY — Node/React app (not currently deployed)
├── client/                  # Legacy client
├── setup-ssl.sh             # Let's Encrypt SSL setup
└── ecosystem.config.cjs     # PM2 config (legacy Node)
```

## Data Flow (Go App)

```
Browser Request → Middleware Chain (Logger → Recover → SecurityHeaders → RateLimiter → Compress)
→ ServeMux Router → Handler → Execute Template → HTML Response
```

For HTMX partials: POST to `/api/calculate-*` → Handler runs calc → Returns partial HTML template.

Background: Drip campaign processor runs every hour, sending due emails to subscribers.

## Routes (Go App)

### Pages

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | Home | Landing page |
| GET | `/calculator` | Calculator | Income calculator |
| GET | `/smart-money` | SmartMoney | 50/30/20 budget planner |
| GET | `/housing` | Housing | Mortgage/housing affordability |
| GET | `/auto` | Auto | Auto affordability |
| GET | `/taxes` | Taxes | Tax estimator hub |
| GET | `/taxes/{state}` | StateTax | State-specific tax pages (50 states) |
| GET | `/blog` | Blog | Blog index |
| GET | `/blog/{slug}` | BlogArticle | Individual blog articles |
| GET | `/free-tools` | FreeTools | Tools directory |
| GET | `/gig-calculator` | GigCalculator | Gig/freelance income calculator |
| GET | `/income-streams` | IncomeStreams | Multi-income aggregator |
| GET | `/rent-vs-buy` | RentVsBuy | Rent vs buy comparison |
| GET | `/inflation` | Inflation | Inflation & compound interest calculator |
| GET | `/income-calculator` | CalcVariantIndex | Calculator variants index (programmatic SEO) |
| GET | `/income-calculator/{variant}` | CalcVariant | 8 calculator variants (hourly, salary-to-hourly, 1099, etc.) |
| GET | `/quiz` | Quiz | Financial literacy quiz |
| GET | `/desk` | Desk | Financial command center (checklist, quick access) |
| GET | `/best` | BestIndex | Product comparison hub |
| GET | `/best/{category}` | BestCategory | Best-of category pages |
| GET | `/compare` | CompareIndex | Product vs product hub |
| GET | `/compare/{slug}` | CompareDetail | Head-to-head comparisons |
| GET | `/afford` | AffordIndex | Salary affordability hub |
| GET | `/afford/{salary}` | Afford | "What can I afford on $X" pages |
| GET | `/salary` | SalaryIndex | Salary breakdown hub |
| GET | `/salary/{job}` | Salary | Job-specific salary breakdowns |
| GET | `/pricing` | Pricing | Free vs Pro comparison |
| GET | `/checkout/success` | CheckoutSuccess | Stripe payment success |
| GET | `/checkout/cancel` | CheckoutCancel | Stripe payment cancelled |
| GET | `/share` | Share | Share results page |
| GET | `/privacy` | Privacy | Privacy policy |
| GET | `/terms` | Terms | Terms of service |

### HTMX API Endpoints (POST → partial HTML)

| Path | Handler |
|------|---------|
| `/api/calculate-income` | CalculateIncome |
| `/api/calculate-budget` | CalculateBudget |
| `/api/calculate-mortgage` | CalculateMortgage |
| `/api/calculate-auto` | CalculateAuto |
| `/api/calculate-taxes` | CalculateTaxes |
| `/api/calculate-gig` | CalculateGig |
| `/api/calculate-streams` | CalculateStreams |
| `/api/calculate-rent-vs-buy` | CalculateRentVsBuy |
| `/api/calculate-inflation` | CalculateInflation |
| `/api/calculate-compound` | CalculateCompound |
| `/api/quiz-answer` | QuizAnswer |
| `/api/subscribe` | Subscribe (lead capture) |
| `/api/create-checkout` | CreateCheckout (Stripe) |
| `/api/webhooks/stripe` | StripeWebhook |

### Admin

| Method | Path | Handler |
|--------|------|---------|
| GET | `/admin` | AdminDashboard |
| GET/POST | `/admin/login` | AdminLogin/AdminLoginPost |
| GET | `/admin/logout` | AdminLogout |
| GET | `/admin/export-csv` | AdminExportCSV |
| POST | `/admin/toggle/{id}` | AdminToggleLead |
| DELETE | `/admin/delete/{id}` | AdminDeleteLead |
| POST | `/admin/drip-trigger` | AdminDripTrigger (manual send) |
| GET | `/admin/drip-stats` | AdminDripStats (JSON stats) |
| GET | `/api/track-affiliate` | TrackAffiliate |

### Utility

| Path | Description |
|------|-------------|
| `/health` | Health check (returns "OK") |
| `/robots.txt` | Robots file |
| `/sitemap.xml` | Dynamic sitemap (all pages including programmatic) |
| `/unsubscribe/{token}` | Email unsubscribe |

# Conventions

- **Templates:** Go `html/template` with embedded FS. Pages in `templates/`, partials in `templates/partials/`.
- **Styling:** Tailwind CSS via CDN. Alpine.js for client-side interactivity (dark mode, localStorage, toggles).
- **Handlers:** One function per page/action in `internal/handlers/`. Full pages for GET, HTMX partials for POST.
- **Middleware:** Chained via `middleware.Chain()`. Custom `responseWriter` for status capture.
- **Rate Limiting:** IP-based, 30 POST requests per minute. Checks X-Forwarded-For for Cloudflare.
- **Calculations:** Pure Go in `internal/calc/`. Tests via `go test`.
- **Data:** Static content (blog articles, calculator variants, salary/afford pages, drip emails) in `internal/data/`.
- **Database:** SQLite in `internal/db/`. Tables: `leads`, `page_views`, `affiliate_clicks`, `drip_sends`.
- **Static assets:** Embedded in binary via `//go:embed static/*`.
- **Testing:** `go test ./...` for Go.
- **Analytics:** GA4 (`G-WY4FDJP3MW`) via gtag in templates.
- **SEO:** JSON-LD schemas (FAQPage, Product, CollectionPage) on relevant pages. Dynamic sitemap.
- **Share bars:** All calculator result partials include Copy Link, Twitter, Facebook, Print/PDF buttons.

# Infrastructure

- **Server:** VPS at 159.203.143.174
- **Domain:** autolytiqs.com (Cloudflare DNS, Let's Encrypt SSL)
- **Process:** PM2 (`autolytiq-go`), fork mode, single Go binary
- **Build:** `cd go-app && go build -o server .`
- **Run:** `pm2 restart autolytiq-go` (or `./go-app/server` directly)
- **Deploy:** Build binary in `go-app/` → `pm2 restart autolytiq-go`
- **PM2 saved:** Config persists across reboots via `pm2 save`

## Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default 5000) |
| `ADMIN_KEY` | Admin dashboard password (default: `autolytiq-admin-2026`) |
| `STRIPE_SECRET_KEY` | Stripe API secret key (optional, enables checkout) |
| `STRIPE_PRICE_ID` | Stripe price ID for Pro Report (optional) |
| `SMTP_HOST` | SMTP server hostname (optional, enables drip emails) |
| `SMTP_PORT` | SMTP port (default 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Sender address (default: `Autolytiq <hello@autolytiqs.com>`) |

## Build & Deploy Commands

```bash
cd go-app && go build -o server .       # Build Go binary
cd go-app && go test ./...              # Run Go tests
pm2 restart autolytiq-go                # Restart production server
pm2 logs autolytiq-go                   # View logs
pm2 save                                # Persist PM2 config
```

# Current State

**Go app is the active production server** (PM2 process `autolytiq-go` on port 5000).

**Fully working:**
- All calculator pages with HTMX-powered results (income, budget, mortgage, auto, taxes, gig, streams, rent-vs-buy, inflation, compound interest)
- Share/export bars on all calculator results (copy link, social share, print)
- 8 programmatic calculator variant pages (`/income-calculator/*`)
- 50 state-specific tax pages (`/taxes/*`)
- Programmatic afford pages (`/afford/*`) and salary pages (`/salary/*`)
- Product comparison pages (`/best/*`, `/compare/*`)
- Blog with multiple articles
- Financial literacy quiz
- Financial desk/command center with checklist
- Lead capture with email subscribe/unsubscribe
- Admin dashboard (leads, page views, affiliate stats, CSV export)
- Rate limiting (30 POST/min per IP)
- CSRF token support (built, not wired to middleware chain)
- Stripe checkout flow (pricing page, create-checkout, success/cancel)
- Email drip campaign system (8-week series, background hourly processor)
- Affiliate click tracking (Awin integration)
- Cookie consent banner
- Dark mode toggle
- Dynamic sitemap and robots.txt
- SEO: meta tags, JSON-LD schemas, canonical URLs
- GA4 analytics

**Legacy (not deployed):**
- Node/React app in `packages/` — kept for reference only
- Chrome extension in `packages/extension/`

# Remaining TODOs

## High Priority
- **Configure SMTP:** Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` env vars to enable drip emails
- **Configure Stripe:** Set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` to enable checkout
- **Stripe webhook signature verification:** `StripeWebhook` handler currently logs events but doesn't verify signatures with `STRIPE_WEBHOOK_SECRET`
- **Wire CSRF middleware:** `CSRFToken` middleware is built but not in the chain; HTMX forms need CSRF token injection first

## Medium Priority
- **Build Pro Report PDF:** The product being sold via Stripe — actual report generation and delivery
- **Add drip stats to admin dashboard:** Currently only available via JSON endpoint `/admin/drip-stats`
- **Savings goals tracker:** React app had a savings goals feature (localStorage-based)
- **Transaction tracker:** React app had a transaction log/categorization feature
- **Chrome extension:** Port the extension from `packages/extension/` if desired

## Low Priority
- **A/B testing framework:** For optimizing conversion on pricing/landing pages
- **Social login / user accounts:** Currently no auth for end users
- **API rate limit dashboard:** Show rate limit stats in admin
- **Email template preview:** Admin preview of drip email sequence
- **Mobile app / PWA:** Progressive web app support

# DO NOT

- Don't create disconnected files — always edit the actual files in use
- Don't propose multiple architectures or org structures — pick the simplest and build it
- Don't create implementation plans without executing them
- Don't use placeholder or mock implementations — build the real thing
- Don't add features beyond what was asked
- Don't skip verification — always run build/test/dev to confirm changes work
- Don't commit `.env` or files containing secrets
- Don't modify `internal/data/` files without `git add -f` (directory is gitignored)

# Session Protocol

1. Read this file first to understand the project
2. Edit existing files rather than creating new standalone files
3. After every change, verify it works (build, test, curl, or dev server)
4. Do NOT move to the next task until the current one is confirmed working
5. If something fails, fix it before proceeding
6. Remember context from earlier in this session — don't ask redundant questions
7. If you need clarification, ask ONE focused question
