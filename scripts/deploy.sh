#!/bin/bash

# Thai Document Generator Deployment Script
# Usage: ./scripts/deploy.sh [environment] [version]
# Example: ./scripts/deploy.sh production v1.0.0

set -e

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
APP_NAME="thai-document-generator"
REGISTRY="your-registry.com"  # Replace with your container registry

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            log_info "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        log_error "Environment file .env.$ENVIRONMENT not found"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image for $ENVIRONMENT..."
    
    # Copy environment-specific file
    cp ".env.$ENVIRONMENT" .env.local
    
    # Build the image
    docker build -t "$APP_NAME:$VERSION" -t "$APP_NAME:latest" .
    
    # Clean up
    rm -f .env.local
    
    log_info "Docker image built successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run tests in Docker container
    docker run --rm \
        -v "$(pwd):/app" \
        -w /app \
        node:18-alpine \
        sh -c "npm ci && npm run test"
    
    log_info "Tests passed"
}

# Deploy to environment
deploy() {
    log_info "Deploying to $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        development)
            deploy_development
            ;;
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
    esac
}

# Development deployment (local Docker)
deploy_development() {
    log_info "Starting development deployment..."
    
    # Stop existing containers
    docker-compose --profile dev down || true
    
    # Start development services
    docker-compose --profile dev up -d
    
    log_info "Development deployment completed"
    log_info "Application available at: http://localhost:3001"
}

# Staging deployment
deploy_staging() {
    log_info "Starting staging deployment..."
    
    # Tag for staging
    docker tag "$APP_NAME:$VERSION" "$APP_NAME:staging"
    
    # Stop existing staging containers
    docker-compose -f docker-compose.staging.yml down || true
    
    # Deploy to staging
    docker-compose -f docker-compose.staging.yml up -d
    
    log_info "Staging deployment completed"
}

# Production deployment
deploy_production() {
    log_info "Starting production deployment..."
    
    # Additional validation for production
    if [ "$VERSION" = "latest" ]; then
        log_error "Production deployment requires a specific version tag"
        exit 1
    fi
    
    # Tag for production
    docker tag "$APP_NAME:$VERSION" "$APP_NAME:production"
    
    # Push to registry (if configured)
    if [ -n "$REGISTRY" ] && [ "$REGISTRY" != "your-registry.com" ]; then
        log_info "Pushing to registry..."
        docker tag "$APP_NAME:$VERSION" "$REGISTRY/$APP_NAME:$VERSION"
        docker push "$REGISTRY/$APP_NAME:$VERSION"
    fi
    
    # Deploy to production
    docker-compose -f docker-compose.production.yml down || true
    docker-compose -f docker-compose.production.yml up -d
    
    log_info "Production deployment completed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    local port=3000
    
    if [ "$ENVIRONMENT" = "development" ]; then
        port=3001
    fi
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://localhost:$port/api/health" &> /dev/null; then
            log_info "Health check passed"
            return 0
        fi
        
        log_warn "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 5
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    log_warn "Rolling back deployment..."
    
    case $ENVIRONMENT in
        development)
            docker-compose --profile dev down
            ;;
        staging)
            docker-compose -f docker-compose.staging.yml down
            ;;
        production)
            docker-compose -f docker-compose.production.yml down
            ;;
    esac
    
    log_info "Rollback completed"
}

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    validate_environment
    check_prerequisites
    
    # Build and test
    build_image
    run_tests
    
    # Deploy
    deploy
    
    # Health check
    if ! health_check; then
        log_error "Deployment failed health check"
        rollback
        exit 1
    fi
    
    log_info "Deployment completed successfully!"
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; rollback; exit 1' INT TERM

# Run main function
main "$@"