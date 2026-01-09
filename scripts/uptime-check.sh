#!/bin/bash
# Self-hosted uptime monitoring script
# Checks site health and sends email alert if down

SITE_URL="https://autolytiqs.com"
HEALTH_URL="https://autolytiqs.com/api/health"
ALERT_EMAIL="dmarc@autolytiqs.com"
LOG_FILE="/root/income-calculator-autolytiq/logs/uptime.log"
STATE_FILE="/tmp/autolytiq_uptime_state"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Check health endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL" 2>/dev/null)

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if [ "$HTTP_CODE" = "200" ]; then
    echo "$TIMESTAMP - OK (HTTP $HTTP_CODE)" >> "$LOG_FILE"

    # If was down, send recovery alert
    if [ -f "$STATE_FILE" ]; then
        rm "$STATE_FILE"
        echo "$TIMESTAMP - RECOVERED - Site is back up" >> "$LOG_FILE"

        # Send recovery email via API
        curl -s -X POST "http://localhost:5000/api/internal/alert" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"recovery\",\"message\":\"Site is back online\"}" 2>/dev/null || true
    fi
else
    echo "$TIMESTAMP - DOWN (HTTP $HTTP_CODE)" >> "$LOG_FILE"

    # Only alert once (not every check)
    if [ ! -f "$STATE_FILE" ]; then
        touch "$STATE_FILE"
        echo "$TIMESTAMP - ALERT SENT - Site is down" >> "$LOG_FILE"

        # Send alert email via API
        curl -s -X POST "http://localhost:5000/api/internal/alert" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"down\",\"message\":\"Site returned HTTP $HTTP_CODE\"}" 2>/dev/null || true
    fi
fi

# Keep log file size manageable (last 1000 lines)
tail -1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
