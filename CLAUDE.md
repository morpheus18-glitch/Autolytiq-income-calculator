# Project Overview

**Autolytiqs** — a personal finance income calculator app deployed at **autolytiqs.com**.

**What it does:** Helps users calculate annual income from YTD earnings, analyze affordability (housing, auto), build budgets, track transactions, and compare financial products. Includes programmatic SEO pages, blog content, affiliate monetization, and a Chrome extension.

**Target users:** W2 employees, gig workers, freelancers who need to project annual income from partial-year data for loan applications, budgeting, and financial planning.

# Tech Stack

**Primary:** Go + HTMX (server-rendered). The Go app in `go-app/` is the production server. Always make changes here first.

**Legacy (not active):** TypeScript (React + Express) in `packages/`. Not currently deployed.

| Layer | Technology |
|-------|-----------|
| Server | Go standard library (`net/http`) |
| Frontend | HTMX + HTML templates + Tailwind CSS (CDN) |
| Templates | Go `html/template` with embedded FS |
| Middleware | Custom Go (logger, recover, security headers, gzip) |
| Calculations | Go (`internal/calc/`) |
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
│   ├── internal/
│   │   ├── handlers/        # HTTP handlers (pages + HTMX partials)
│   │   ├── middleware/       # Logger, recover, security headers, gzip
│   │   └── calc/            # Calculation logic + tests
│   ├── static/              # Embedded CSS/JS assets
│   └── templates/           # HTML templates
│       └── partials/        # HTMX partial templates
├── packages/                # LEGACY — Node/React app (not currently deployed)
│   ├── web/                 # React SPA (Vite)
│   ├── server/              # Express.js backend
│   ├── calc-core/           # Rust calculation engine
│   └── calc-wasm/           # WASM wrapper
├── client/                  # Legacy client
├── setup-ssl.sh             # Let's Encrypt SSL setup
└── ecosystem.config.cjs     # PM2 config (legacy Node)
```

## Data Flow (Go App)

```
Browser Request → Middleware Chain (Logger → Recover → SecurityHeaders → Compress)
→ ServeMux Router → Handler → Execute Template → HTML Response
```

For HTMX partials: POST to `/api/calculate-*` → Handler runs calc → Returns partial HTML template.

## Routes (Go App)

| Method | Path | Handler |
|--------|------|---------|
| GET | `/` | Home |
| GET | `/calculator` | Calculator |
| GET | `/smart-money` | SmartMoney |
| GET | `/housing` | Housing |
| GET | `/auto` | Auto |
| GET | `/blog` | Blog |
| GET | `/free-tools` | FreeTools |
| GET | `/gig-calculator` | GigCalculator |
| GET | `/income-streams` | IncomeStreams |
| POST | `/api/calculate-income` | CalculateIncome (HTMX partial) |
| POST | `/api/calculate-budget` | CalculateBudget (HTMX partial) |
| POST | `/api/calculate-mortgage` | CalculateMortgage (HTMX partial) |
| POST | `/api/calculate-auto` | CalculateAuto (HTMX partial) |
| POST | `/api/calculate-taxes` | CalculateTaxes (HTMX partial) |
| GET | `/health` | Health check |

# Conventions

- **Templates:** Go `html/template` with embedded FS. Pages in `templates/`, partials in `templates/partials/`.
- **Styling:** Tailwind CSS via CDN. Inline styles where needed.
- **Handlers:** One function per page/action in `internal/handlers/`. Full pages for GET, HTMX partials for POST.
- **Middleware:** Chained via `middleware.Chain()`. Custom `responseWriter` for status capture.
- **Calculations:** Pure Go in `internal/calc/`. Tests via `go test`.
- **Static assets:** Embedded in binary via `//go:embed static/*`.
- **Testing:** `go test ./...` for Go. `cargo test` for Rust (legacy calc-core).
- **Analytics:** GA4 (`G-WY4FDJP3MW`) via gtag in templates.

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

**Working routes:**
- `/` — Home page
- `/calculator` — Income calculator
- `/smart-money` — Budget planner
- `/housing` — Mortgage calculator
- `/auto` — Auto affordability
- `/blog` — Blog
- `/free-tools` — Tools directory
- `/gig-calculator` — Gig income calculator
- `/income-streams` — Multi-income aggregator
- `/health` — Health check
- All HTMX `/api/calculate-*` endpoints

**Legacy (not deployed):**
- Node/React app in `packages/` — kept for reference only
- Chrome extension in `packages/extension/`

# DO NOT

- Don't create disconnected files — always edit the actual files in use
- Don't propose multiple architectures or org structures — pick the simplest and build it
- Don't create implementation plans without executing them
- Don't use placeholder or mock implementations — build the real thing
- Don't add features beyond what was asked
- Don't skip verification — always run build/test/dev to confirm changes work
- Don't commit `.env` or files containing secrets

# Session Protocol

1. Read this file first to understand the project
2. Edit existing files rather than creating new standalone files
3. After every change, verify it works (build, test, curl, or dev server)
4. Do NOT move to the next task until the current one is confirmed working
5. If something fails, fix it before proceeding
6. Remember context from earlier in this session — don't ask redundant questions
7. If you need clarification, ask ONE focused question
