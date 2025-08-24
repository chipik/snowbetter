#!/bin/bash

# Production Deployment Script
# Usage: ./scripts/deploy.sh [start|stop|restart|logs|status]

set -e

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

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

# Check if docker-compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
    error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check if .env file exists
if [[ ! -f "$ENV_FILE" ]]; then
    warning "Environment file .env not found. Please create it from env.production.example"
    info "Example: cp env.production.example .env && nano .env"
    exit 1
fi

# Function to check if services are healthy
check_health() {
    local max_attempts=30
    local attempt=1
    
    log "Checking services health..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
            log "Services are running. Checking health..."
            
            # Check backend health
            if curl -f "http://localhost:8000/health" > /dev/null 2>&1; then
                log "Backend is healthy"
                return 0
            else
                warning "Backend health check failed (attempt $attempt/$max_attempts)"
            fi
        else
            warning "Services are not running yet (attempt $attempt/$max_attempts)"
        fi
        
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Function to start services
start_services() {
    log "Starting production services..."
    
    # Create necessary directories
    mkdir -p nginx/ssl nginx/webroot logs backups uploads
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 15
    
    # Check health
    if check_health; then
        log "All services started successfully!"
        
        # Show status
        docker-compose -f "$COMPOSE_FILE" ps
        
        # Show URLs
        if [[ -n "$DOMAIN" ]]; then
            log "Your application should be available at:"
            log "  Frontend: https://$DOMAIN"
            log "  API: https://$DOMAIN/api"
        else
            log "Your application should be available at:"
            log "  Frontend: http://localhost"
            log "  API: http://localhost:8000/api"
        fi
    else
        error "Failed to start services properly"
        docker-compose -f "$COMPOSE_FILE" logs
        exit 1
    fi
}

# Function to stop services
stop_services() {
    log "Stopping production services..."
    docker-compose -f "$COMPOSE_FILE" down
    
    log "Services stopped"
}

# Function to restart services
restart_services() {
    log "Restarting production services..."
    stop_services
    sleep 5
    start_services
}

# Function to show logs
show_logs() {
    log "Showing logs for all services..."
    docker-compose -f "$COMPOSE_FILE" logs -f
}

# Function to show status
show_status() {
    log "Service status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo
    log "Resource usage:"
    docker stats --no-stream
}

# Function to update and redeploy
update_and_deploy() {
    log "Updating and redeploying application..."
    
    # Pull latest changes
    log "Pulling latest changes..."
    git pull origin main
    
    # Stop services
    stop_services
    
    # Rebuild and start
    log "Rebuilding and starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d --build
    
    # Wait and check health
    sleep 15
    if check_health; then
        log "Update completed successfully!"
    else
        error "Update failed"
        exit 1
    fi
}

# Function to backup
backup() {
    log "Creating backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backups/backup_$timestamp"
    
    mkdir -p "$backup_dir"
    
    # Backup database
    log "Backing up database..."
    docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U ushe_luche_user ushe_luche_prod > "$backup_dir/database.sql"
    
    # Backup uploads
    log "Backing up uploads..."
    tar -czf "$backup_dir/uploads.tar.gz" uploads/
    
    # Backup configuration
    log "Backing up configuration..."
    cp "$ENV_FILE" "$backup_dir/"
    cp "$COMPOSE_FILE" "$backup_dir/"
    
    log "Backup completed: $backup_dir"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start     - Start all production services"
    echo "  stop      - Stop all production services"
    echo "  restart   - Restart all production services"
    echo "  status    - Show services status and resource usage"
    echo "  logs      - Show logs for all services"
    echo "  update    - Update code and redeploy"
    echo "  backup    - Create backup of database and uploads"
    echo "  help      - Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start      # Start services"
    echo "  $0 status     # Check status"
    echo "  $0 logs       # View logs"
    echo "  $0 update     # Update and redeploy"
}

# Main script logic
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    update)
        update_and_deploy
        ;;
    backup)
        backup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
