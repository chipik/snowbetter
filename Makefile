# Makefile for Уже лучше Application
# Usage: make <target>

.PHONY: help dev prod start stop restart logs status build clean backup ssl-setup ssl-renew

# Default target
help:
	@echo "🚀 Уже лучше - Makefile Commands"
	@echo ""
	@echo "Development:"
	@echo "  dev          - Start development environment"
	@echo "  dev-stop     - Stop development environment"
	@echo "  dev-logs     - Show development logs"
	@echo ""
	@echo "Production:"
	@echo "  prod         - Start production environment"
	@echo "  prod-stop    - Stop production environment"
	@echo "  prod-logs    - Show production logs"
	@echo "  prod-status  - Show production status"
	@echo ""
	@echo "SSL Management:"
	@echo "  ssl-setup    - Initial SSL setup with Let's Encrypt"
	@echo "  ssl-renew    - Renew SSL certificates"
	@echo ""
	@echo "Maintenance:"
	@echo "  build        - Build all Docker images"
	@echo "  clean        - Clean up Docker resources"
	@echo "  backup       - Create backup"
	@echo "  update       - Update and redeploy production"
	@echo ""
	@echo "Examples:"
	@echo "  make dev         # Start development"
	@echo "  make prod        # Start production"
	@echo "  make ssl-setup   # Setup SSL certificates"

# Development environment
dev:
	@echo "🚀 Starting development environment..."
	docker-compose up -d
	@echo "✅ Development environment started"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔧 Backend:  http://localhost:8000"
	@echo "🗄️  Database: localhost:5432"

dev-stop:
	@echo "🛑 Stopping development environment..."
	docker-compose down
	@echo "✅ Development environment stopped"

dev-logs:
	@echo "📋 Showing development logs..."
	docker-compose logs -f

# Production environment
prod:
	@echo "🚀 Starting production environment..."
	@if [ ! -f .env ]; then \
		echo "❌ .env file not found. Please create it from env.production.example"; \
		exit 1; \
	fi
	./scripts/deploy.sh start

prod-stop:
	@echo "🛑 Stopping production environment..."
	./scripts/deploy.sh stop

prod-logs:
	@echo "📋 Showing production logs..."
	./scripts/deploy.sh logs

prod-status:
	@echo "📊 Showing production status..."
	./scripts/deploy.sh status

# SSL Management
ssl-setup:
	@echo "🔒 Setting up SSL certificates..."
	@if [ -z "$$DOMAIN" ]; then \
		echo "ℹ️  Using default domain: snowbetter.ru"; \
		export DOMAIN=snowbetter.ru; \
	fi
	@if [ -z "$$CERTBOT_EMAIL" ]; then \
		echo "ℹ️  Using default email: admin@snowbetter.ru"; \
		export CERTBOT_EMAIL=admin@snowbetter.ru; \
	fi
	chmod +x scripts/*.sh
	./scripts/initial-ssl-setup.sh

ssl-renew:
	@echo "🔄 Renewing SSL certificates..."
	./scripts/renew-ssl.sh

# Maintenance
build:
	@echo "🔨 Building all Docker images..."
	docker-compose -f docker-compose.prod.yml build --no-cache
	@echo "✅ All images built successfully"

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker system prune -f
	docker volume prune -f
	docker image prune -f
	@echo "✅ Cleanup completed"

backup:
	@echo "💾 Creating backup..."
	./scripts/deploy.sh backup

update:
	@echo "🔄 Updating and redeploying..."
	./scripts/deploy.sh update

# Database operations
db-backup:
	@echo "💾 Creating database backup..."
	@if [ -f docker-compose.prod.yml ]; then \
		docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U ushe_luche_user ushe_luche_prod > backup_$(shell date +%Y%m%d_%H%M%S).sql; \
	else \
		docker-compose exec -T postgres pg_dump -U ushe_luche_user ushe_luche > backup_$(shell date +%Y%m%d_%H%M%S).sql; \
	fi
	@echo "✅ Database backup created"

db-restore:
	@echo "📥 Restoring database from backup..."
	@if [ -z "$(file)" ]; then \
		echo "❌ Please specify backup file: make db-restore file=backup_20231201_120000.sql"; \
		exit 1; \
	fi
	@if [ -f docker-compose.prod.yml ]; then \
		docker-compose -f docker-compose.prod.yml exec -T postgres psql -U ushe_luche_user ushe_luche_prod < $(file); \
	else \
		docker-compose exec -T postgres psql -U ushe_luche_user ushe_luche < $(file); \
	fi
	@echo "✅ Database restored from $(file)"

# Health checks
health:
	@echo "🏥 Checking application health..."
	@if [ -f docker-compose.prod.yml ]; then \
		curl -f http://localhost:8000/health > /dev/null 2>&1 && echo "✅ Backend: Healthy" || echo "❌ Backend: Unhealthy"; \
		curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend: Healthy" || echo "❌ Frontend: Unhealthy"; \
	else \
		curl -f http://localhost:8000/health > /dev/null 2>&1 && echo "✅ Backend: Healthy" || echo "❌ Backend: Unhealthy"; \
		curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend: Healthy" || echo "❌ Frontend: Unhealthy"; \
	fi

# Monitoring
monitor:
	@echo "📊 Application monitoring..."
	@if [ -f docker-compose.prod.yml ]; then \
		docker-compose -f docker-compose.prod.yml ps; \
		echo ""; \
		docker stats --no-stream; \
	else \
		docker-compose ps; \
		echo ""; \
		docker stats --no-stream; \
	fi

# Quick start for development
quick-dev: dev
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "🌐 Opening application in browser..."
	@if command -v xdg-open > /dev/null; then \
		xdg-open http://localhost:3000; \
	elif command -v open > /dev/null; then \
		open http://localhost:3000; \
	else \
		echo "Please open http://localhost:3000 in your browser"; \
	fi

# Production deployment checklist
checklist:
	@echo "🎯 Production Deployment Checklist"
	@echo ""
	@echo "Pre-deployment:"
	@echo "  ☐ System requirements met (2GB+ RAM, 20GB+ disk)"
	@echo "  ☐ Docker and Docker Compose installed"
	@echo "  ☐ Domain configured and pointing to server"
	@echo "  ☐ Firewall configured (ports 22, 80, 443)"
	@echo "  ☐ .env file created from env.production.example"
	@echo ""
	@echo "Deployment:"
	@echo "  ☐ SSL certificates obtained"
	@echo "  ☐ All services started"
	@echo "  ☐ HTTPS working correctly"
	@echo "  ☐ API responding"
	@echo "  ☐ Automatic SSL renewal configured"
	@echo "  ☐ Backups configured"
	@echo "  ☐ Monitoring configured"
	@echo ""
	@echo "Commands:"
	@echo "  make prod         # Start production"
	@echo "  make ssl-setup    # Setup SSL"
	@echo "  make checklist    # Show this checklist"
