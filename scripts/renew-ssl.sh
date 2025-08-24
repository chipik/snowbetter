#!/bin/bash

# SSL Certificate Renewal Script for Let's Encrypt
# This script should be run via cron job: 0 12 * * * /path/to/renew-ssl.sh

set -e

# Configuration
DOMAIN=${DOMAIN:-snowbetter.ru}
CERTBOT_EMAIL=${CERTBOT_EMAIL:-admin@snowbetter.ru}
COMPOSE_FILE="docker-compose.prod.yml"
WEBROOT_PATH="./nginx/webroot"
SSL_PATH="./nginx/ssl"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
   exit 1
fi

# Check if docker-compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
    error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Create necessary directories
mkdir -p "$WEBROOT_PATH"
mkdir -p "$SSL_PATH"

log "Starting SSL certificate renewal for domain: $DOMAIN"

# Check if certificates exist and are valid
if [[ -d "$SSL_PATH/live/$DOMAIN" ]]; then
    # Check certificate expiration
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in "$SSL_PATH/live/$DOMAIN/cert.pem" | cut -d= -f2)
    CERT_EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( ($CERT_EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    log "Certificate expires in $DAYS_UNTIL_EXPIRY days"
    
    # Only renew if certificate expires in less than 30 days
    if [[ $DAYS_UNTIL_EXPIRY -gt 30 ]]; then
        log "Certificate is still valid for more than 30 days. No renewal needed."
        exit 0
    fi
fi

log "Certificate needs renewal or doesn't exist. Starting renewal process..."

# Stop nginx temporarily to free up port 80
log "Stopping Nginx temporarily..."
docker-compose -f "$COMPOSE_FILE" stop nginx

# Wait a moment for port to be freed
sleep 5

# Run certbot to renew certificates
log "Running Certbot for certificate renewal..."
docker-compose -f "$COMPOSE_FILE" run --rm certbot \
    certonly \
    --webroot \
    --webroot-path=/var/www/html \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# Check if renewal was successful
if [[ $? -eq 0 ]]; then
    log "SSL certificate renewal successful!"
    
    # Set proper permissions
    log "Setting proper permissions for SSL certificates..."
    sudo chown -R root:root "$SSL_PATH"
    sudo chmod -R 600 "$SSL_PATH"
    sudo chmod -R 755 "$SSL_PATH/live"
    sudo chmod -R 755 "$SSL_PATH/archive"
    
    # Restart nginx
    log "Restarting Nginx..."
    docker-compose -f "$COMPOSE_FILE" up -d nginx
    
    # Test nginx configuration
    if docker-compose -f "$COMPOSE_FILE" exec nginx nginx -t; then
        log "Nginx configuration test passed"
        
        # Reload nginx configuration
        docker-compose -f "$COMPOSE_FILE" exec nginx nginx -s reload
        log "Nginx configuration reloaded successfully"
    else
        error "Nginx configuration test failed"
        exit 1
    fi
    
    log "SSL certificate renewal completed successfully!"
    
else
    error "SSL certificate renewal failed!"
    
    # Restart nginx even if renewal failed
    log "Restarting Nginx..."
    docker-compose -f "$COMPOSE_FILE" up -d nginx
    
    exit 1
fi

log "SSL renewal process completed"
