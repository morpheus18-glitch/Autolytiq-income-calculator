// Package db provides SQLite database access for leads and site data.
package db

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// DB wraps the SQLite database connection.
type DB struct {
	conn *sql.DB
}

// Lead represents a captured lead/subscriber.
type Lead struct {
	ID               int
	Email            string
	Name             string
	IncomeRange      string
	Source           string
	Subscribed       bool
	UnsubscribeToken string
	LastEmailSent    int
	CreatedAt        string
	UpdatedAt        string
}

// LeadStats holds aggregate lead statistics.
type LeadStats struct {
	Total        int
	Subscribed   int
	Unsubscribed int
	Today        int
	ThisWeek     int
	ThisMonth    int
	BySource     []SourceCount
	ByIncome     []IncomeCount
}

// SourceCount is a source with its count.
type SourceCount struct {
	Source string
	Count  int
}

// IncomeCount is an income range with its count.
type IncomeCount struct {
	IncomeRange string
	Count       int
}

// LeadPage is a paginated list of leads.
type LeadPage struct {
	Leads      []Lead
	Total      int
	Page       int
	Limit      int
	TotalPages int
}

// Open opens or creates the SQLite database.
func Open() (*DB, error) {
	// Store db in the go-app directory
	exe, _ := os.Executable()
	dir := filepath.Dir(exe)
	dbPath := filepath.Join(dir, "leads.db")

	// Fallback: if running from go-app directory during development
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		dbPath = "leads.db"
	}

	conn, err := sql.Open("sqlite3", dbPath+"?_journal_mode=WAL")
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	db := &DB{conn: conn}
	if err := db.migrate(); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return db, nil
}

func (db *DB) migrate() error {
	_, err := db.conn.Exec(`
		CREATE TABLE IF NOT EXISTS leads (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT UNIQUE NOT NULL,
			name TEXT,
			income_range TEXT,
			source TEXT DEFAULT 'calculator',
			subscribed INTEGER DEFAULT 1,
			unsubscribe_token TEXT UNIQUE,
			last_email_sent INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
		CREATE INDEX IF NOT EXISTS idx_leads_token ON leads(unsubscribe_token);

		CREATE TABLE IF NOT EXISTS page_views (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			path TEXT NOT NULL,
			referrer TEXT,
			user_agent TEXT,
			ip TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path);
		CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at);

		CREATE TABLE IF NOT EXISTS affiliate_clicks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			affiliate TEXT NOT NULL,
			page TEXT,
			ip TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_ac_affiliate ON affiliate_clicks(affiliate);
		CREATE INDEX IF NOT EXISTS idx_ac_created ON affiliate_clicks(created_at);

		CREATE TABLE IF NOT EXISTS drip_sends (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			lead_id INTEGER NOT NULL,
			step INTEGER NOT NULL,
			sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(lead_id, step)
		);
		CREATE INDEX IF NOT EXISTS idx_ds_lead ON drip_sends(lead_id);
	`)
	return err
}

// TrackPageView records a page view.
func (db *DB) TrackPageView(path, referrer, userAgent, ip string) {
	db.conn.Exec("INSERT INTO page_views (path, referrer, user_agent, ip) VALUES (?, ?, ?, ?)",
		path, referrer, userAgent, ip)
}

// TrackAffiliateClick records an affiliate link click.
func (db *DB) TrackAffiliateClick(affiliate, page, ip string) {
	db.conn.Exec("INSERT INTO affiliate_clicks (affiliate, page, ip) VALUES (?, ?, ?)",
		affiliate, page, ip)
}

// PageViewStats holds page view analytics.
type PageViewStats struct {
	TotalViews    int
	TodayViews    int
	WeekViews     int
	MonthViews    int
	TopPages      []PageCount
	DailyViews    []DayCount
}

// PageCount is a page path with its view count.
type PageCount struct {
	Path  string
	Count int
}

// DayCount is a date with its count.
type DayCount struct {
	Date  string
	Count int
}

// AffiliateStats holds affiliate click analytics.
type AffiliateStats struct {
	TotalClicks int
	TodayClicks int
	WeekClicks  int
	ByAffiliate []AffiliateCount
	ByPage      []PageCount
}

// AffiliateCount is an affiliate with its click count.
type AffiliateCount struct {
	Affiliate string
	Count     int
}

// GetPageViewStats returns page view analytics.
func (db *DB) GetPageViewStats() (*PageViewStats, error) {
	s := &PageViewStats{}
	db.conn.QueryRow("SELECT COUNT(*) FROM page_views").Scan(&s.TotalViews)
	db.conn.QueryRow("SELECT COUNT(*) FROM page_views WHERE date(created_at) = date('now')").Scan(&s.TodayViews)
	db.conn.QueryRow("SELECT COUNT(*) FROM page_views WHERE created_at >= date('now', '-7 days')").Scan(&s.WeekViews)
	db.conn.QueryRow("SELECT COUNT(*) FROM page_views WHERE created_at >= date('now', '-30 days')").Scan(&s.MonthViews)

	rows, _ := db.conn.Query(`SELECT path, COUNT(*) as c FROM page_views WHERE created_at >= date('now', '-30 days') GROUP BY path ORDER BY c DESC LIMIT 20`)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var pc PageCount
			rows.Scan(&pc.Path, &pc.Count)
			s.TopPages = append(s.TopPages, pc)
		}
	}

	rows2, _ := db.conn.Query(`SELECT date(created_at) as d, COUNT(*) as c FROM page_views WHERE created_at >= date('now', '-14 days') GROUP BY d ORDER BY d ASC`)
	if rows2 != nil {
		defer rows2.Close()
		for rows2.Next() {
			var dc DayCount
			rows2.Scan(&dc.Date, &dc.Count)
			s.DailyViews = append(s.DailyViews, dc)
		}
	}

	return s, nil
}

// GetAffiliateStats returns affiliate click analytics.
func (db *DB) GetAffiliateStats() (*AffiliateStats, error) {
	s := &AffiliateStats{}
	db.conn.QueryRow("SELECT COUNT(*) FROM affiliate_clicks").Scan(&s.TotalClicks)
	db.conn.QueryRow("SELECT COUNT(*) FROM affiliate_clicks WHERE date(created_at) = date('now')").Scan(&s.TodayClicks)
	db.conn.QueryRow("SELECT COUNT(*) FROM affiliate_clicks WHERE created_at >= date('now', '-7 days')").Scan(&s.WeekClicks)

	rows, _ := db.conn.Query(`SELECT affiliate, COUNT(*) as c FROM affiliate_clicks GROUP BY affiliate ORDER BY c DESC`)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var ac AffiliateCount
			rows.Scan(&ac.Affiliate, &ac.Count)
			s.ByAffiliate = append(s.ByAffiliate, ac)
		}
	}

	rows2, _ := db.conn.Query(`SELECT page, COUNT(*) as c FROM affiliate_clicks WHERE page != '' GROUP BY page ORDER BY c DESC LIMIT 10`)
	if rows2 != nil {
		defer rows2.Close()
		for rows2.Next() {
			var pc PageCount
			rows2.Scan(&pc.Path, &pc.Count)
			s.ByPage = append(s.ByPage, pc)
		}
	}

	return s, nil
}

func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// CreateLead inserts or updates a lead. Returns the lead ID and whether it was new.
func (db *DB) CreateLead(email, name, incomeRange, source string) (int64, bool, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if !strings.Contains(email, "@") {
		return 0, false, fmt.Errorf("invalid email")
	}

	// Check if exists
	var existingID int64
	err := db.conn.QueryRow("SELECT id FROM leads WHERE email = ?", email).Scan(&existingID)
	if err == nil {
		// Update existing
		_, err = db.conn.Exec(`
			UPDATE leads SET
				name = COALESCE(NULLIF(?, ''), name),
				income_range = COALESCE(NULLIF(?, ''), income_range),
				source = COALESCE(NULLIF(?, ''), source),
				updated_at = CURRENT_TIMESTAMP
			WHERE email = ?
		`, name, incomeRange, source, email)
		return existingID, false, err
	}

	if source == "" {
		source = "calculator"
	}
	token := generateToken()

	result, err := db.conn.Exec(`
		INSERT INTO leads (email, name, income_range, source, unsubscribe_token)
		VALUES (?, ?, ?, ?, ?)
	`, email, nilIfEmpty(name), nilIfEmpty(incomeRange), source, token)
	if err != nil {
		return 0, false, err
	}

	id, _ := result.LastInsertId()
	return id, true, nil
}

// GetLeads returns a paginated, searchable list of leads.
func (db *DB) GetLeads(page, limit int, search string) (*LeadPage, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit

	where := ""
	var args []interface{}
	if search != "" {
		where = "WHERE email LIKE ? OR name LIKE ?"
		args = append(args, "%"+search+"%", "%"+search+"%")
	}

	var total int
	countArgs := make([]interface{}, len(args))
	copy(countArgs, args)
	err := db.conn.QueryRow("SELECT COUNT(*) FROM leads "+where, countArgs...).Scan(&total)
	if err != nil {
		return nil, err
	}

	queryArgs := append(args, limit, offset)
	rows, err := db.conn.Query(`
		SELECT id, email, COALESCE(name,''), COALESCE(income_range,''), COALESCE(source,''),
			subscribed, COALESCE(unsubscribe_token,''), last_email_sent,
			created_at, COALESCE(updated_at, created_at)
		FROM leads `+where+`
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leads []Lead
	for rows.Next() {
		var l Lead
		var sub int
		if err := rows.Scan(&l.ID, &l.Email, &l.Name, &l.IncomeRange, &l.Source,
			&sub, &l.UnsubscribeToken, &l.LastEmailSent, &l.CreatedAt, &l.UpdatedAt); err != nil {
			return nil, err
		}
		l.Subscribed = sub == 1
		leads = append(leads, l)
	}

	totalPages := (total + limit - 1) / limit
	return &LeadPage{
		Leads:      leads,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetStats returns aggregate lead statistics.
func (db *DB) GetStats() (*LeadStats, error) {
	s := &LeadStats{}

	db.conn.QueryRow("SELECT COUNT(*) FROM leads").Scan(&s.Total)
	db.conn.QueryRow("SELECT COUNT(*) FROM leads WHERE subscribed = 1").Scan(&s.Subscribed)
	s.Unsubscribed = s.Total - s.Subscribed
	db.conn.QueryRow("SELECT COUNT(*) FROM leads WHERE date(created_at) = date('now')").Scan(&s.Today)
	db.conn.QueryRow("SELECT COUNT(*) FROM leads WHERE created_at >= date('now', '-7 days')").Scan(&s.ThisWeek)
	db.conn.QueryRow("SELECT COUNT(*) FROM leads WHERE created_at >= date('now', '-30 days')").Scan(&s.ThisMonth)

	// By source
	rows, _ := db.conn.Query(`SELECT COALESCE(source,'unknown'), COUNT(*) FROM leads GROUP BY source ORDER BY COUNT(*) DESC`)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var sc SourceCount
			rows.Scan(&sc.Source, &sc.Count)
			s.BySource = append(s.BySource, sc)
		}
	}

	// By income range
	rows2, _ := db.conn.Query(`SELECT COALESCE(income_range,'unknown'), COUNT(*) FROM leads WHERE income_range IS NOT NULL AND income_range != '' GROUP BY income_range ORDER BY COUNT(*) DESC`)
	if rows2 != nil {
		defer rows2.Close()
		for rows2.Next() {
			var ic IncomeCount
			rows2.Scan(&ic.IncomeRange, &ic.Count)
			s.ByIncome = append(s.ByIncome, ic)
		}
	}

	return s, nil
}

// DeleteLead deletes a lead by ID.
func (db *DB) DeleteLead(id int) error {
	result, err := db.conn.Exec("DELETE FROM leads WHERE id = ?", id)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return fmt.Errorf("lead not found")
	}
	return nil
}

// ToggleSubscription toggles a lead's subscription status.
func (db *DB) ToggleSubscription(id int) (bool, error) {
	var sub int
	err := db.conn.QueryRow("SELECT subscribed FROM leads WHERE id = ?", id).Scan(&sub)
	if err != nil {
		return false, fmt.Errorf("lead not found")
	}
	newSub := 1 - sub
	_, err = db.conn.Exec("UPDATE leads SET subscribed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", newSub, id)
	return newSub == 1, err
}

// ExportCSV returns all leads formatted as CSV.
func (db *DB) ExportCSV() (string, error) {
	rows, err := db.conn.Query(`
		SELECT email, COALESCE(name,''), COALESCE(income_range,''), COALESCE(source,''),
			subscribed, created_at
		FROM leads ORDER BY created_at DESC
	`)
	if err != nil {
		return "", err
	}
	defer rows.Close()

	var buf strings.Builder
	buf.WriteString("email,name,income_range,source,subscribed,created_at\n")
	for rows.Next() {
		var email, name, incomeRange, source, createdAt string
		var sub int
		rows.Scan(&email, &name, &incomeRange, &source, &sub, &createdAt)
		subStr := "yes"
		if sub == 0 {
			subStr = "no"
		}
		buf.WriteString(fmt.Sprintf("%s,%s,%s,%s,%s,%s\n",
			escapeCSV(email), escapeCSV(name), escapeCSV(incomeRange),
			escapeCSV(source), subStr, createdAt))
	}
	return buf.String(), nil
}

// Unsubscribe unsubscribes a lead by token.
func (db *DB) Unsubscribe(token string) (string, error) {
	if len(token) != 64 {
		return "", fmt.Errorf("invalid token")
	}
	var email string
	var sub int
	err := db.conn.QueryRow("SELECT email, subscribed FROM leads WHERE unsubscribe_token = ?", token).Scan(&email, &sub)
	if err != nil {
		return "", fmt.Errorf("not found")
	}
	if sub == 0 {
		return email, nil // already unsubscribed
	}
	_, err = db.conn.Exec("UPDATE leads SET subscribed = 0, updated_at = CURRENT_TIMESTAMP WHERE unsubscribe_token = ?", token)
	return email, err
}

// DueLead is a subscriber due for their next drip email.
type DueLead struct {
	ID               int
	Email            string
	Name             string
	UnsubscribeToken string
	NextStep         int
}

// GetDueEmails finds subscribers who are due for their next drip email.
// delayDays maps step number to the delay in days after signup.
func (db *DB) GetDueEmails(delayDays map[int]int) ([]DueLead, error) {
	// Get all subscribed leads who haven't completed the sequence
	rows, err := db.conn.Query(`
		SELECT l.id, l.email, COALESCE(l.name,''), l.unsubscribe_token, l.last_email_sent, l.created_at
		FROM leads l
		WHERE l.subscribed = 1
		  AND l.last_email_sent < 8
		ORDER BY l.created_at ASC
		LIMIT 50
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var due []DueLead
	now := time.Now()
	for rows.Next() {
		var id, lastSent int
		var email, name, token, createdAt string
		rows.Scan(&id, &email, &name, &token, &lastSent, &createdAt)

		nextStep := lastSent + 1
		delay, ok := delayDays[nextStep]
		if !ok {
			continue
		}

		signupTime, err := time.Parse("2006-01-02 15:04:05", createdAt)
		if err != nil {
			continue
		}

		// Check if enough days have passed since signup
		dueDate := signupTime.Add(time.Duration(delay) * 24 * time.Hour)
		if now.After(dueDate) {
			due = append(due, DueLead{
				ID:               id,
				Email:            email,
				Name:             name,
				UnsubscribeToken: token,
				NextStep:         nextStep,
			})
		}
	}
	return due, nil
}

// RecordDripSend records that a drip email was sent to a lead.
func (db *DB) RecordDripSend(leadID, step int) error {
	tx, err := db.conn.Begin()
	if err != nil {
		return err
	}
	_, err = tx.Exec("INSERT OR IGNORE INTO drip_sends (lead_id, step) VALUES (?, ?)", leadID, step)
	if err != nil {
		tx.Rollback()
		return err
	}
	_, err = tx.Exec("UPDATE leads SET last_email_sent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", step, leadID)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

// DripStats returns stats about the drip campaign.
type DripStats struct {
	TotalSent   int
	Step1Sent   int
	Step8Sent   int
	Pending     int // subscribed leads who haven't finished
}

// GetDripStats returns drip campaign statistics.
func (db *DB) GetDripStats() (*DripStats, error) {
	s := &DripStats{}
	db.conn.QueryRow("SELECT COUNT(*) FROM drip_sends").Scan(&s.TotalSent)
	db.conn.QueryRow("SELECT COUNT(*) FROM drip_sends WHERE step = 1").Scan(&s.Step1Sent)
	db.conn.QueryRow("SELECT COUNT(*) FROM drip_sends WHERE step = 8").Scan(&s.Step8Sent)
	db.conn.QueryRow("SELECT COUNT(*) FROM leads WHERE subscribed = 1 AND last_email_sent < 8").Scan(&s.Pending)
	return s, nil
}

// Close closes the database connection.
func (db *DB) Close() error {
	return db.conn.Close()
}

// RecentLeads returns the N most recent leads for display.
func (db *DB) RecentLeads(n int) ([]Lead, error) {
	rows, err := db.conn.Query(`
		SELECT id, email, COALESCE(name,''), COALESCE(source,''), created_at
		FROM leads ORDER BY created_at DESC LIMIT ?
	`, n)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leads []Lead
	for rows.Next() {
		var l Lead
		rows.Scan(&l.ID, &l.Email, &l.Name, &l.Source, &l.CreatedAt)
		leads = append(leads, l)
	}
	return leads, nil
}

// TimeAgo returns a human-readable time difference.
func TimeAgo(dateStr string) string {
	t, err := time.Parse("2006-01-02 15:04:05", dateStr)
	if err != nil {
		return dateStr
	}
	d := time.Since(t)
	switch {
	case d < time.Minute:
		return "just now"
	case d < time.Hour:
		return fmt.Sprintf("%dm ago", int(d.Minutes()))
	case d < 24*time.Hour:
		return fmt.Sprintf("%dh ago", int(d.Hours()))
	default:
		return fmt.Sprintf("%dd ago", int(d.Hours()/24))
	}
}

func nilIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func escapeCSV(s string) string {
	if strings.ContainsAny(s, ",\"\n") {
		return `"` + strings.ReplaceAll(s, `"`, `""`) + `"`
	}
	return s
}
