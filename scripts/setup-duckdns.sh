#!/bin/bash
# DuckDNS Setup Script for Uzbek Talim
# Usage: ./setup-duckdns.sh YOUR_DUCKDNS_TOKEN

if [ -z "$1" ]; then
    echo "Usage: $0 YOUR_DUCKDNS_TOKEN"
    echo "Get your token from: https://www.duckdns.org/"
    exit 1
fi

TOKEN=$1
DOMAIN="uzbek-talim"
IP=$(curl -s ifconfig.me)

echo "Setting up DuckDNS for $DOMAIN.duckdns.org"
echo "Current IP: $IP"

# Update DuckDNS
curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip=$IP"

echo ""
echo "DuckDNS updated!"
echo "Your domain: https://$DOMAIN.duckdns.org/"
echo ""
echo "Next steps:"
echo "1. Update nginx config with domain: $DOMAIN.duckdns.org"
echo "2. Get Let's Encrypt certificate: sudo certbot --nginx -d $DOMAIN.duckdns.org"

