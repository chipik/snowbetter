#!/bin/bash

# Initial SSL Setup Script for Let's Encrypt
# Run this script once to get your first SSL certificate

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
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
   exit 1
fi

# Check if domain is configured
if [[ "$DOMAIN" == "snowbetter.ru" ]]; then
    info "Using default domain: snowbetter.ru"
fi

# Check if email is configured
if [[ "$CERTBOT_EMAIL" == "admin@snowbetter.ru" ]]; then
    info "Using default email: admin@snowbetter.ru"
fi

# Check if docker-compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
    error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

log "Starting initial SSL setup for domain: $DOMAIN"
log "Email: $CERTBOT_EMAIL"

# Create necessary directories
log "Creating necessary directories..."
mkdir -p "$WEBROOT_PATH"
mkdir -p "$SSL_PATH"

# Check if domain is accessible
log "Checking if domain $DOMAIN is accessible..."
if ! nslookup "$DOMAIN" > /dev/null 2>&1; then
    error "Domain $DOMAIN is not accessible. Please check your DNS configuration."
    exit 1
fi

# Check if ports 80 and 443 are open
log "Checking if ports 80 and 443 are accessible..."
if ! nc -z "$DOMAIN" 80; then
    error "Port 80 is not accessible on $DOMAIN. Please check your firewall configuration."
    exit 1
fi

if ! nc -z "$DOMAIN" 443; then
    warning "Port 443 is not accessible on $DOMAIN. This is normal for initial setup."
fi

# Start services (excluding nginx initially)
log "Starting backend and frontend services..."
docker-compose -f "$COMPOSE_FILE" up -d postgres backend frontend

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 10

# Test if backend is responding
log "Testing backend connectivity..."
if ! curl -f "http://localhost:8000/health" > /dev/null 2>&1; then
    error "Backend is not responding. Please check the logs."
    docker-compose -f "$COMPOSE_FILE" logs backend
    exit 1
fi

# Test if frontend is responding
log "Testing frontend connectivity..."
if ! curl -f "http://localhost:3000" > /dev/null 2>&1; then
    error "Frontend is not responding. Please check the logs."
    docker-compose -f "$COMPOSE_FILE" logs frontend
    exit 1
fi

# Start nginx temporarily for Let's Encrypt challenge
log "Starting Nginx for Let's Encrypt challenge..."
docker-compose -f "$COMPOSE_FILE" up -d nginx

# Wait for nginx to be ready
sleep 5

# Test nginx
if ! curl -f "http://$DOMAIN" > /dev/null 2>&1; then
    error "Nginx is not accessible on $DOMAIN. Please check the configuration."
    docker-compose -f "$COMPOSE_FILE" logs nginx
    exit 1
fi

log "Nginx is accessible. Proceeding with SSL certificate generation..."

# Generate initial SSL certificate
log "Generating initial SSL certificate with Let's Encrypt..."
docker-compose -f "$COMPOSE_FILE" run --rm certbot \
    certonly \
    --webroot \
    --webroot-path=/var/www/html \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# Check if certificate generation was successful
if [[ $? -eq 0 ]]; then
    log "SSL certificate generated successfully!"
    
    # Set proper permissions
    log "Setting proper permissions for SSL certificates..."
    sudo chown -R root:root "$SSL_PATH"
    sudo chmod -R 600 "$SSL_PATH"
    sudo chmod -R 755 "$SSL_PATH/live"
    sudo chmod -R 755 "$SSL_PATH/archive"
    
    # Update nginx configuration with actual domain
    log "Updating Nginx configuration with actual domain..."
    sed -i "s/snowbetter.ru/$DOMAIN/g" nginx/nginx.conf
    
    # Test nginx configuration
    log "Testing Nginx configuration..."
    if docker-compose -f "$COMPOSE_FILE" exec nginx nginx -t; then
        log "Nginx configuration test passed"
        
        # Reload nginx configuration
        docker-compose -f "$COMPOSE_FILE" exec nginx nginx -s reload
        log "Nginx configuration reloaded successfully"
        
        # Test HTTPS
        log "Testing HTTPS connection..."
        sleep 5
        if curl -f "https://$DOMAIN" > /dev/null 2>&1; then
            log "HTTPS is working correctly!"
        else
            warning "HTTPS test failed. Please check the configuration."
        fi
        
    else
        error "Nginx configuration test failed"
        exit 1
    fi
    
    log "Initial SSL setup completed successfully!"
    log "Your site is now accessible at: https://$DOMAIN"
    
    # Setup cron job for automatic renewal
    log "Setting up automatic SSL renewal..."
    CRON_JOB="0 12 * * * cd $(pwd) && ./scripts/renew-ssl.sh >> ./logs/ssl-renewal.log 2>&1"
    
    if ! crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        log "Cron job for SSL renewal added successfully"
    else
        log "Cron job for SSL renewal already exists"
    fi
    
else
    error "SSL certificate generation failed!"
    error "Please check the logs and ensure your domain is properly configured."
    exit 1
fi

log "Initial SSL setup process completed"
log "Remember to:"
log "1. Update your DNS records to point to this server"
log "2. Configure your firewall to allow ports 80 and 443"
log "3. Test your site at https://$DOMAIN"
