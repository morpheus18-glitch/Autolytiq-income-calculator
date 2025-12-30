#!/bin/bash
# Run this script after DNS is updated to point to this server (159.203.143.174)

set -e

echo "Checking DNS..."
CURRENT_IP=$(dig +short autolytiqs.com | head -1)
SERVER_IP="159.203.143.174"

if [ "$CURRENT_IP" != "$SERVER_IP" ]; then
    echo "ERROR: DNS not yet pointing to this server"
    echo "Current IP: $CURRENT_IP"
    echo "Expected:   $SERVER_IP"
    echo ""
    echo "Update your DNS records and wait for propagation (can take up to 48 hours)"
    exit 1
fi

echo "DNS verified! Obtaining SSL certificates..."

certbot --nginx \
    -d autolytiqs.com \
    -d www.autolytiqs.com \
    --non-interactive \
    --agree-tos \
    --email admin@autolytiqs.com \
    --redirect

echo ""
echo "SSL certificates installed successfully!"
echo "Your site is now available at: https://autolytiqs.com"

# Set up auto-renewal cron job
echo "Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo "Done! Certificates will auto-renew before expiration."
