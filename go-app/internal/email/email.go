// Package email sends transactional emails via SMTP.
package email

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

// Config holds SMTP configuration loaded from environment variables.
type Config struct {
	Host     string // SMTP_HOST
	Port     string // SMTP_PORT (default "587")
	User     string // SMTP_USER
	Pass     string // SMTP_PASS
	From     string // SMTP_FROM (e.g. "Autolytiq <hello@autolytiqs.com>")
	Enabled  bool
}

// LoadConfig reads SMTP settings from environment variables.
func LoadConfig() *Config {
	c := &Config{
		Host: os.Getenv("SMTP_HOST"),
		Port: os.Getenv("SMTP_PORT"),
		User: os.Getenv("SMTP_USER"),
		Pass: os.Getenv("SMTP_PASS"),
		From: os.Getenv("SMTP_FROM"),
	}
	if c.Port == "" {
		c.Port = "587"
	}
	if c.From == "" {
		c.From = "Autolytiq <hello@autolytiqs.com>"
	}
	c.Enabled = c.Host != "" && c.User != "" && c.Pass != ""
	return c
}

// Send sends an HTML email via SMTP.
func Send(cfg *Config, to, subject, htmlBody string) error {
	if !cfg.Enabled {
		return fmt.Errorf("SMTP not configured")
	}

	// Build email with proper headers
	var msg strings.Builder
	msg.WriteString("From: " + cfg.From + "\r\n")
	msg.WriteString("To: " + to + "\r\n")
	msg.WriteString("Subject: " + subject + "\r\n")
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	msg.WriteString("List-Unsubscribe: <https://autolytiqs.com/unsubscribe>\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	auth := smtp.PlainAuth("", cfg.User, cfg.Pass, cfg.Host)
	addr := cfg.Host + ":" + cfg.Port

	// Extract sender email from "Name <email>" format
	from := cfg.From
	if idx := strings.Index(from, "<"); idx != -1 {
		from = strings.TrimRight(from[idx+1:], ">")
	}

	return smtp.SendMail(addr, auth, from, []string{to}, []byte(msg.String()))
}

// WrapInLayout wraps email body HTML in a styled layout.
func WrapInLayout(body, unsubscribeURL string) string {
	return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:100%">
<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px">
<a href="https://autolytiqs.com" style="color:#fff;text-decoration:none;font-size:20px;font-weight:700">Autolytiq</a>
</td></tr>
<tr><td style="padding:32px;color:#374151;font-size:15px;line-height:1.6">
` + body + `
</td></tr>
<tr><td style="padding:24px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#9ca3af">
<p>Autolytiq - Free Financial Calculators</p>
<p><a href="` + unsubscribeURL + `" style="color:#9ca3af">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
