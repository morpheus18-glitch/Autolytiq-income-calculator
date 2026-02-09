// Package middleware provides HTTP middleware functions for the income calculator app.
package middleware

import (
	"compress/gzip"
	"crypto/rand"
	"encoding/hex"
	"io"
	"log"
	"net"
	"net/http"
	"runtime/debug"
	"strings"
	"sync"
	"time"
)

// Middleware represents a function that wraps an http.Handler.
type Middleware func(http.Handler) http.Handler

// Chain chains multiple middleware together, executing them in order.
// The first middleware in the list wraps the outermost layer.
func Chain(middlewares ...Middleware) Middleware {
	return func(next http.Handler) http.Handler {
		for i := len(middlewares) - 1; i >= 0; i-- {
			next = middlewares[i](next)
		}
		return next
	}
}

// responseWriter wraps http.ResponseWriter to capture the status code.
type responseWriter struct {
	http.ResponseWriter
	statusCode int
	written    bool
}

func newResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{
		ResponseWriter: w,
		statusCode:     http.StatusOK,
	}
}

func (rw *responseWriter) WriteHeader(code int) {
	if !rw.written {
		rw.statusCode = code
		rw.written = true
		rw.ResponseWriter.WriteHeader(code)
	}
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	if !rw.written {
		rw.written = true
	}
	return rw.ResponseWriter.Write(b)
}

// Logger logs HTTP requests with method, path, status code, and duration.
func Logger(logger *log.Logger) Middleware {
	if logger == nil {
		logger = log.Default()
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rw := newResponseWriter(w)

			next.ServeHTTP(rw, r)

			duration := time.Since(start)
			logger.Printf(
				"%s %s %d %v",
				r.Method,
				r.URL.Path,
				rw.statusCode,
				duration,
			)
		})
	}
}

// Recover recovers from panics and returns a 500 Internal Server Error.
// It logs the panic and stack trace for debugging.
func Recover(logger *log.Logger) Middleware {
	if logger == nil {
		logger = log.Default()
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					logger.Printf(
						"panic recovered: %v\n%s",
						err,
						debug.Stack(),
					)
					http.Error(
						w,
						http.StatusText(http.StatusInternalServerError),
						http.StatusInternalServerError,
					)
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// SecurityHeaders adds security-related HTTP headers to responses.
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Prevent MIME type sniffing
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// Prevent clickjacking
		w.Header().Set("X-Frame-Options", "DENY")

		// Enable XSS filter in older browsers
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// Control referrer information
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions policy (formerly Feature-Policy)
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		// Content Security Policy - allow CDN scripts for Tailwind, Alpine.js, HTMX, GA, Awin
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://www.dwin1.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.dwin1.com")

		next.ServeHTTP(w, r)
	})
}

// ============================================================================
// Rate Limiter
// ============================================================================

type visitor struct {
	count    int
	lastSeen time.Time
}

// RateLimiter limits requests per IP address. It allows `limit` requests per
// `window` duration. Expired entries are cleaned up periodically.
func RateLimiter(limit int, window time.Duration) Middleware {
	var mu sync.Mutex
	visitors := make(map[string]*visitor)

	// Background cleanup every minute
	go func() {
		for {
			time.Sleep(time.Minute)
			mu.Lock()
			for ip, v := range visitors {
				if time.Since(v.lastSeen) > window {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Only rate-limit POST requests
			if r.Method != http.MethodPost {
				next.ServeHTTP(w, r)
				return
			}

			ip := extractIP(r)

			mu.Lock()
			v, exists := visitors[ip]
			if !exists || time.Since(v.lastSeen) > window {
				visitors[ip] = &visitor{count: 1, lastSeen: time.Now()}
				mu.Unlock()
				next.ServeHTTP(w, r)
				return
			}

			v.count++
			v.lastSeen = time.Now()

			if v.count > limit {
				mu.Unlock()
				w.Header().Set("Retry-After", "60")
				http.Error(w, "Rate limit exceeded. Please wait before trying again.", http.StatusTooManyRequests)
				return
			}
			mu.Unlock()

			next.ServeHTTP(w, r)
		})
	}
}

func extractIP(r *http.Request) string {
	// Check X-Forwarded-For (behind proxy/Cloudflare)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.SplitN(xff, ",", 2)
		return strings.TrimSpace(parts[0])
	}
	// Check X-Real-IP
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}
	// Fall back to remote address
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// ============================================================================
// CSRF Protection
// ============================================================================

// CSRFToken generates and validates CSRF tokens using double-submit cookies.
// It sets a csrf_token cookie on GET requests and validates the token on POST
// requests by comparing the cookie value with the X-CSRF-Token header or
// _csrf form field. Webhook endpoints are exempted since they use their own
// signature verification.
func CSRFToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip CSRF for webhook endpoints (they verify signatures independently)
		if strings.HasPrefix(r.URL.Path, "/api/webhooks/") {
			next.ServeHTTP(w, r)
			return
		}

		if r.Method == http.MethodGet || r.Method == http.MethodHead {
			// Set CSRF cookie if not present
			if _, err := r.Cookie("csrf_token"); err != nil {
				token := generateToken()
				http.SetCookie(w, &http.Cookie{
					Name:     "csrf_token",
					Value:    token,
					Path:     "/",
					HttpOnly: false, // JS needs to read it for HTMX
					Secure:   true,
					SameSite: http.SameSiteLaxMode,
					MaxAge:   3600,
				})
			}
			next.ServeHTTP(w, r)
			return
		}

		// For POST/PUT/DELETE, validate CSRF token
		if r.Method == http.MethodPost || r.Method == http.MethodPut || r.Method == http.MethodDelete {
			cookie, err := r.Cookie("csrf_token")
			if err != nil {
				http.Error(w, "CSRF token missing", http.StatusForbidden)
				return
			}

			// Check header first, then form field
			token := r.Header.Get("X-CSRF-Token")
			if token == "" {
				if err := r.ParseForm(); err == nil {
					token = r.FormValue("_csrf")
				}
			}

			if token == "" || token != cookie.Value {
				http.Error(w, "CSRF token invalid", http.StatusForbidden)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

func generateToken() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// gzipResponseWriter wraps http.ResponseWriter with gzip compression.
type gzipResponseWriter struct {
	http.ResponseWriter
	writer *gzip.Writer
}

func (grw *gzipResponseWriter) Write(b []byte) (int, error) {
	return grw.writer.Write(b)
}

func (grw *gzipResponseWriter) Flush() {
	grw.writer.Flush()
	if flusher, ok := grw.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

// gzipWriterPool reduces allocations by reusing gzip writers.
var gzipWriterPool = sync.Pool{
	New: func() interface{} {
		w, _ := gzip.NewWriterLevel(io.Discard, gzip.DefaultCompression)
		return w
	},
}

// Compress applies gzip compression to responses when the client supports it.
// It compresses responses for text-based content types.
func Compress(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if client accepts gzip encoding
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}

		// Get a gzip writer from the pool
		gz := gzipWriterPool.Get().(*gzip.Writer)
		gz.Reset(w)
		defer func() {
			gz.Close()
			gzipWriterPool.Put(gz)
		}()

		// Set the Content-Encoding header
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Vary", "Accept-Encoding")

		// Remove Content-Length as it will change with compression
		w.Header().Del("Content-Length")

		grw := &gzipResponseWriter{
			ResponseWriter: w,
			writer:         gz,
		}

		next.ServeHTTP(grw, r)
	})
}
