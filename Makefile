# ===========================================
# UZBEK TA'LIM - Makefile
# ===========================================

.PHONY: help install dev build test lint format clean docker-up docker-down migrate

# Use `python3` by default (some systems don't ship `python`)
PYTHON ?= python3

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

help: ## Show this help
	@echo "$(BLUE)Uzbek Ta'lim - Development Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# ===========================================
# Installation
# ===========================================

install: ## Install all dependencies
	@echo "$(BLUE)Installing Python dependencies...$(RESET)"
	pip install -e "packages/shared[dev]"
	pip install -e "packages/db[dev]"
	pip install -e "apps/api[dev]"
	pip install -e "apps/bot[dev]"
	@echo "$(BLUE)Installing Node.js dependencies...$(RESET)"
	cd apps/web && npm install
	@echo "$(GREEN)Installation complete!$(RESET)"

install-api: ## Install API dependencies only
	pip install -e "packages/shared[dev]"
	pip install -e "packages/db[dev]"
	pip install -e "apps/api[dev]"

install-bot: ## Install Bot dependencies only
	pip install -e "packages/shared[dev]"
	pip install -e "packages/db[dev]"
	pip install -e "apps/bot[dev]"

install-web: ## Install Web dependencies only
	cd apps/web && npm install

# ===========================================
# Development
# ===========================================

dev: ## Run all services in development mode
	@echo "$(BLUE)Starting development environment...$(RESET)"
	docker-compose -f docker-compose.dev.yml up -d db redis
	@sleep 2
	$(MAKE) -j3 dev-api dev-bot dev-web

dev-api: ## Run API server
	cd apps/api && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

dev-bot: ## Run Telegram bot
	cd apps/bot && $(PYTHON) -m src.main

dev-web: ## Run frontend dev server
	cd apps/web && npm run dev

# ===========================================
# Database
# ===========================================

migrate: ## Run database migrations
	cd packages/db && alembic upgrade head

migrate-create: ## Create new migration (usage: make migrate-create MSG="migration message")
	cd packages/db && alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Rollback last migration
	cd packages/db && alembic downgrade -1

migrate-reset: ## Reset database
	cd packages/db && alembic downgrade base && alembic upgrade head

db-shell: ## Open PostgreSQL shell
	docker-compose exec db psql -U postgres -d uzbek_talim

# ===========================================
# Docker
# ===========================================

docker-up: ## Start all Docker services
	docker-compose up -d
	@echo "$(GREEN)All services started!$(RESET)"

docker-down: ## Stop all Docker services
	docker-compose down
	@echo "$(YELLOW)All services stopped$(RESET)"

docker-build: ## Build Docker images
	docker-compose build

docker-logs: ## View Docker logs
	docker-compose logs -f

docker-clean: ## Remove all containers and volumes
	docker-compose down -v --remove-orphans
	@echo "$(RED)All containers and volumes removed$(RESET)"

# ===========================================
# Testing
# ===========================================

test: ## Run all tests
	$(MAKE) test-api
	$(MAKE) test-bot
	$(MAKE) test-web
	$(MAKE) test-integration

test-api: ## Run API tests
	cd apps/api && pytest tests/ -v --cov=src --cov-report=term-missing

test-bot: ## Run Bot tests
	cd apps/bot && pytest tests/ -v --cov=src --cov-report=term-missing

test-web: ## Run frontend tests
	cd apps/web && npm run test

test-integration: ## Run integration tests
	pytest tests/integration/ -v

test-coverage: ## Generate coverage report
	pytest --cov=apps --cov=packages --cov-report=html
	@echo "$(GREEN)Coverage report generated in htmlcov/$(RESET)"

# ===========================================
# Code Quality
# ===========================================

lint: ## Run all linters
	$(MAKE) lint-python
	$(MAKE) lint-web

lint-python: ## Run Python linters
	ruff check apps/ packages/
	mypy apps/ packages/

lint-web: ## Run frontend linters
	cd apps/web && npm run lint

format: ## Format all code
	$(MAKE) format-python
	$(MAKE) format-web

format-python: ## Format Python code
	ruff format apps/ packages/
	ruff check --fix apps/ packages/

format-web: ## Format frontend code
	cd apps/web && npm run format

# ===========================================
# Cleanup
# ===========================================

clean: ## Clean all build artifacts
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)Cleanup complete!$(RESET)"

# ===========================================
# Production
# ===========================================

build: ## Build for production
	docker-compose -f docker-compose.yml build

deploy: ## Deploy to production
	@echo "$(YELLOW)Deploying to production...$(RESET)"
	docker-compose -f docker-compose.yml up -d
	@echo "$(GREEN)Deployment complete!$(RESET)"

