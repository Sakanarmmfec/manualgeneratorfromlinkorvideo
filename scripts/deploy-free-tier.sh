#!/bin/bash

# Free Tier Deployment Script for Thai Document Generator
# Supports Railway, Render, and Vercel deployments
# Usage: ./scripts/deploy-free-tier.sh [platform] [environment]

set -e

# Configuration
PLATFORM=${1:-railway}
ENVIRONMENT=${2:-production}
APP_NAME="thai-document-generator"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Display banner
display_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              Thai Document Generator                         ║"
    echo "║              Free Tier Deployment                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo "Platform: $PLATFORM"
    echo "Environment: $ENVIRONMENT"
    echo ""
}

# Validate platform
validate_platform() {
    case $PLATFORM in
        railway|render|vercel)
            log_info "Deploying to $PLATFORM"
            ;;
        *)
            log_error "Invalid platform: $PLATFORM"
            log_error "Valid platforms: railway, render, vercel"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check if required CLI tools are installed
    case $PLATFORM in
        railway)
            if ! command -v railway &> /dev/null; then
                log_error "Railway CLI is not installed"
                log_info "Install with: npm install -g @railway/cli"
                exit 1
            fi
            ;;
        render)
            if ! command -v render &> /dev/null; then
                log_warn "Render CLI not found. Manual deployment via dashboard required."
            fi
            ;;
        vercel)
            if ! command -v vercel &> /dev/null; then
                log_error "Vercel CLI is not installed"
                log_info "Install with: npm install -g vercel"
                exit 1
            fi
            ;;
    esac
    
    # Check if environment file exists
    if [ ! -f ".env.example" ]; then
        log_error "Environment example file .env.example not found"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Prepare deployment
prepare_deployment() {
    log_step "Preparing deployment..."
    
    # Create free tier optimized environment
    create_free_tier_env
    
    # Optimize build for free tier
    optimize_for_free_tier
    
    log_info "Deployment preparation completed"
}

# Create free tier environment configuration
create_free_tier_env() {
    log_info "Creating free tier environment configuration..."
    
    cat > .env.freetier << EOF
# Free Tier Optimized Configuration
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Memory optimization for free tier (400MB limit)
NODE_OPTIONS=--max-old-space-size=400

# Logging configuration for free tier
LOG_LEVEL=info
DEBUG_MODE=false

# Performance optimizations
NEXT_TELEMETRY_DISABLED=1

# Free tier feature flags
ALLOW_USER_API_KEYS=true
RATE_LIMIT_REQUESTS_PER_MINUTE=10
RATE_LIMIT_REQUESTS_PER_HOUR=100

# Security (these should be set as secrets in platform dashboard)
# MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
# MFEC_LLM_API_KEY=your_api_key_here
# MFEC_LLM_CHAT_MODEL=gpt-4o
# MFEC_LLM_EMBEDDING_MODEL=text-embedding-3-large
# ENCRYPTION_KEY=your_32_character_encryption_key
# NEXT_PUBLIC_APP_URL=https://your-app-url.com
EOF
}

# Optimize build for free tier
optimize_for_free_tier() {
    log_info "Optimizing build for free tier constraints..."
    
    # Create optimized package.json for deployment
    if [ "$PLATFORM" = "vercel" ]; then
        # Vercel-specific optimizations
        log_info "Applying Vercel optimizations..."
        
        # Ensure Next.js config is optimized
        if ! grep -q "output.*standalone" next.config.js; then
            log_warn "Next.js standalone output not configured. This may cause issues on Vercel."
        fi
    fi
    
    # Create platform-specific Dockerfile if needed
    if [ "$PLATFORM" = "railway" ] || [ "$PLATFORM" = "render" ]; then
        if [ ! -f "Dockerfile.cloud" ]; then
            log_error "Dockerfile.cloud not found for container deployment"
            exit 1
        fi
        
        # Use optimized Dockerfile for container platforms
        cp Dockerfile.cloud Dockerfile.deploy
        log_info "Using optimized Dockerfile for container deployment"
    fi
}

# Deploy to Railway
deploy_railway() {
    log_step "Deploying to Railway..."
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        log_error "Not logged in to Railway. Run 'railway login' first."
        exit 1
    fi
    
    # Deploy using Railway CLI
    log_info "Starting Railway deployment..."
    
    # Use railway.toml configuration
    railway up --detach
    
    log_info "Railway deployment initiated"
    log_info "Check deployment status: railway status"
    log_info "View logs: railway logs"
}

# Deploy to Render
deploy_render() {
    log_step "Deploying to Render..."
    
    log_info "Render deployment requires manual setup via dashboard"
    log_info "Steps to deploy on Render:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Connect your GitHub repository"
    echo "3. Create a new Web Service"
    echo "4. Use the render.yaml configuration file"
    echo "5. Set environment variables as secrets:"
    echo "   - MFEC_LLM_BASE_URL"
    echo "   - MFEC_LLM_API_KEY"
    echo "   - MFEC_LLM_CHAT_MODEL"
    echo "   - MFEC_LLM_EMBEDDING_MODEL"
    echo "   - ENCRYPTION_KEY"
    echo "   - NEXT_PUBLIC_APP_URL"
    echo "6. Deploy the service"
    
    log_info "render.yaml configuration file is ready for use"
}

# Deploy to Vercel
deploy_vercel() {
    log_step "Deploying to Vercel..."
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged in to Vercel. Run 'vercel login' first."
        exit 1
    fi
    
    # Set environment variables
    log_info "Setting up environment variables..."
    
    # Note: In production, these should be set via Vercel dashboard
    log_warn "Remember to set these environment variables in Vercel dashboard:"
    echo "- MFEC_LLM_BASE_URL"
    echo "- MFEC_LLM_API_KEY"
    echo "- MFEC_LLM_CHAT_MODEL"
    echo "- MFEC_LLM_EMBEDDING_MODEL"
    echo "- ENCRYPTION_KEY"
    
    # Deploy
    log_info "Starting Vercel deployment..."
    vercel --prod
    
    log_info "Vercel deployment completed"
}

# Post-deployment tasks
post_deployment() {
    log_step "Running post-deployment tasks..."
    
    case $PLATFORM in
        railway)
            log_info "Railway deployment completed"
            log_info "Access your app: railway open"
            log_info "Monitor logs: railway logs --follow"
            ;;
        render)
            log_info "Render deployment setup completed"
            log_info "Complete the deployment via Render dashboard"
            ;;
        vercel)
            log_info "Vercel deployment completed"
            log_info "Your app is now live on Vercel"
            ;;
    esac
    
    # Clean up temporary files
    cleanup_temp_files
    
    log_info "Post-deployment tasks completed"
}

# Clean up temporary files
cleanup_temp_files() {
    log_info "Cleaning up temporary files..."
    
    [ -f ".env.freetier" ] && rm -f .env.freetier
    [ -f "Dockerfile.deploy" ] && rm -f Dockerfile.deploy
    
    log_info "Cleanup completed"
}

# Display deployment summary
display_summary() {
    echo ""
    log_info "Deployment Summary:"
    echo "Platform: $PLATFORM"
    echo "Environment: $ENVIRONMENT"
    echo "App Name: $APP_NAME"
    echo ""
    
    case $PLATFORM in
        railway)
            echo "Next steps:"
            echo "1. Set environment variables in Railway dashboard"
            echo "2. Monitor deployment: railway logs"
            echo "3. Access app: railway open"
            ;;
        render)
            echo "Next steps:"
            echo "1. Complete setup in Render dashboard"
            echo "2. Set environment variables as secrets"
            echo "3. Monitor deployment status"
            ;;
        vercel)
            echo "Next steps:"
            echo "1. Set environment variables in Vercel dashboard"
            echo "2. Monitor deployment in Vercel dashboard"
            echo "3. Test your deployed application"
            ;;
    esac
    
    echo ""
    echo "Free Tier Limitations:"
    echo "- Memory: 512MB (Railway/Render) or Serverless (Vercel)"
    echo "- Storage: 1GB persistent storage"
    echo "- Bandwidth: Limited by platform"
    echo "- Uptime: May sleep after inactivity"
    echo ""
    echo "Security Reminders:"
    echo "- Set API keys as secrets, not environment variables"
    echo "- Enable HTTPS (automatic on all platforms)"
    echo "- Monitor usage to stay within free tier limits"
}

# Main deployment flow
main() {
    display_banner
    validate_platform
    check_prerequisites
    prepare_deployment
    
    case $PLATFORM in
        railway)
            deploy_railway
            ;;
        render)
            deploy_render
            ;;
        vercel)
            deploy_vercel
            ;;
    esac
    
    post_deployment
    display_summary
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; cleanup_temp_files; exit 1' INT TERM

# Run main function
main "$@"