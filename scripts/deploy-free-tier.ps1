# Free Tier Deployment Script for Thai Document Generator (PowerShell)
# Supports Railway, Render, and Vercel deployments
# Usage: .\scripts\deploy-free-tier.ps1 -Platform [platform] -Environment [environment]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("railway", "render", "vercel")]
    [string]$Platform = "railway",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production"
)

# Configuration
$AppName = "thai-document-generator"

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Blue
}

# Display banner
function Show-Banner {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║              Thai Document Generator                         ║" -ForegroundColor Blue
    Write-Host "║              Free Tier Deployment                           ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Platform: $Platform"
    Write-Host "Environment: $Environment"
    Write-Host ""
}

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    # Check if required CLI tools are installed
    switch ($Platform) {
        "railway" {
            try {
                railway --version | Out-Null
            }
            catch {
                Write-Error "Railway CLI is not installed"
                Write-Info "Install with: npm install -g @railway/cli"
                exit 1
            }
        }
        "render" {
            try {
                render --version | Out-Null
            }
            catch {
                Write-Warn "Render CLI not found. Manual deployment via dashboard required."
            }
        }
        "vercel" {
            try {
                vercel --version | Out-Null
            }
            catch {
                Write-Error "Vercel CLI is not installed"
                Write-Info "Install with: npm install -g vercel"
                exit 1
            }
        }
    }
    
    # Check if environment file exists
    if (-not (Test-Path ".env.example")) {
        Write-Error "Environment example file .env.example not found"
        exit 1
    }
    
    Write-Info "Prerequisites check passed"
}

# Prepare deployment
function Initialize-Deployment {
    Write-Step "Preparing deployment..."
    
    # Create free tier optimized environment
    New-FreeTierEnvironment
    
    # Optimize build for free tier
    Optimize-ForFreeTier
    
    Write-Info "Deployment preparation completed"
}

# Create free tier environment configuration
function New-FreeTierEnvironment {
    Write-Info "Creating free tier environment configuration..."
    
    $envContent = @"
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
"@
    
    $envContent | Out-File -FilePath ".env.freetier" -Encoding UTF8
}

# Optimize build for free tier
function Optimize-ForFreeTier {
    Write-Info "Optimizing build for free tier constraints..."
    
    if ($Platform -eq "vercel") {
        Write-Info "Applying Vercel optimizations..."
        
        # Check Next.js config
        $nextConfig = Get-Content "next.config.js" -Raw
        if ($nextConfig -notmatch "output.*standalone") {
            Write-Warn "Next.js standalone output not configured. This may cause issues on Vercel."
        }
    }
    
    # Create platform-specific Dockerfile if needed
    if ($Platform -eq "railway" -or $Platform -eq "render") {
        if (-not (Test-Path "Dockerfile.cloud")) {
            Write-Error "Dockerfile.cloud not found for container deployment"
            exit 1
        }
        
        Copy-Item "Dockerfile.cloud" "Dockerfile.deploy"
        Write-Info "Using optimized Dockerfile for container deployment"
    }
}

# Deploy to Railway
function Deploy-Railway {
    Write-Step "Deploying to Railway..."
    
    # Check if logged in
    try {
        railway whoami | Out-Null
    }
    catch {
        Write-Error "Not logged in to Railway. Run 'railway login' first."
        exit 1
    }
    
    Write-Info "Starting Railway deployment..."
    
    # Deploy using Railway CLI
    railway up --detach
    
    Write-Info "Railway deployment initiated"
    Write-Info "Check deployment status: railway status"
    Write-Info "View logs: railway logs"
}

# Deploy to Render
function Deploy-Render {
    Write-Step "Deploying to Render..."
    
    Write-Info "Render deployment requires manual setup via dashboard"
    Write-Info "Steps to deploy on Render:"
    Write-Host "1. Go to https://dashboard.render.com"
    Write-Host "2. Connect your GitHub repository"
    Write-Host "3. Create a new Web Service"
    Write-Host "4. Use the render.yaml configuration file"
    Write-Host "5. Set environment variables as secrets:"
    Write-Host "   - MFEC_LLM_BASE_URL"
    Write-Host "   - MFEC_LLM_API_KEY"
    Write-Host "   - MFEC_LLM_CHAT_MODEL"
    Write-Host "   - MFEC_LLM_EMBEDDING_MODEL"
    Write-Host "   - ENCRYPTION_KEY"
    Write-Host "   - NEXT_PUBLIC_APP_URL"
    Write-Host "6. Deploy the service"
    
    Write-Info "render.yaml configuration file is ready for use"
}

# Deploy to Vercel
function Deploy-Vercel {
    Write-Step "Deploying to Vercel..."
    
    # Check if logged in
    try {
        vercel whoami | Out-Null
    }
    catch {
        Write-Error "Not logged in to Vercel. Run 'vercel login' first."
        exit 1
    }
    
    Write-Info "Setting up environment variables..."
    Write-Warn "Remember to set these environment variables in Vercel dashboard:"
    Write-Host "- MFEC_LLM_BASE_URL"
    Write-Host "- MFEC_LLM_API_KEY"
    Write-Host "- MFEC_LLM_CHAT_MODEL"
    Write-Host "- MFEC_LLM_EMBEDDING_MODEL"
    Write-Host "- ENCRYPTION_KEY"
    
    Write-Info "Starting Vercel deployment..."
    vercel --prod
    
    Write-Info "Vercel deployment completed"
}

# Post-deployment tasks
function Complete-Deployment {
    Write-Step "Running post-deployment tasks..."
    
    switch ($Platform) {
        "railway" {
            Write-Info "Railway deployment completed"
            Write-Info "Access your app: railway open"
            Write-Info "Monitor logs: railway logs --follow"
        }
        "render" {
            Write-Info "Render deployment setup completed"
            Write-Info "Complete the deployment via Render dashboard"
        }
        "vercel" {
            Write-Info "Vercel deployment completed"
            Write-Info "Your app is now live on Vercel"
        }
    }
    
    # Clean up temporary files
    Remove-TempFiles
    
    Write-Info "Post-deployment tasks completed"
}

# Clean up temporary files
function Remove-TempFiles {
    Write-Info "Cleaning up temporary files..."
    
    if (Test-Path ".env.freetier") { Remove-Item ".env.freetier" }
    if (Test-Path "Dockerfile.deploy") { Remove-Item "Dockerfile.deploy" }
    
    Write-Info "Cleanup completed"
}

# Display deployment summary
function Show-Summary {
    Write-Host ""
    Write-Info "Deployment Summary:"
    Write-Host "Platform: $Platform"
    Write-Host "Environment: $Environment"
    Write-Host "App Name: $AppName"
    Write-Host ""
    
    switch ($Platform) {
        "railway" {
            Write-Host "Next steps:"
            Write-Host "1. Set environment variables in Railway dashboard"
            Write-Host "2. Monitor deployment: railway logs"
            Write-Host "3. Access app: railway open"
        }
        "render" {
            Write-Host "Next steps:"
            Write-Host "1. Complete setup in Render dashboard"
            Write-Host "2. Set environment variables as secrets"
            Write-Host "3. Monitor deployment status"
        }
        "vercel" {
            Write-Host "Next steps:"
            Write-Host "1. Set environment variables in Vercel dashboard"
            Write-Host "2. Monitor deployment in Vercel dashboard"
            Write-Host "3. Test your deployed application"
        }
    }
    
    Write-Host ""
    Write-Host "Free Tier Limitations:"
    Write-Host "- Memory: 512MB (Railway/Render) or Serverless (Vercel)"
    Write-Host "- Storage: 1GB persistent storage"
    Write-Host "- Bandwidth: Limited by platform"
    Write-Host "- Uptime: May sleep after inactivity"
    Write-Host ""
    Write-Host "Security Reminders:"
    Write-Host "- Set API keys as secrets, not environment variables"
    Write-Host "- Enable HTTPS (automatic on all platforms)"
    Write-Host "- Monitor usage to stay within free tier limits"
}

# Main deployment flow
function Main {
    try {
        Show-Banner
        Test-Prerequisites
        Initialize-Deployment
        
        switch ($Platform) {
            "railway" { Deploy-Railway }
            "render" { Deploy-Render }
            "vercel" { Deploy-Vercel }
        }
        
        Complete-Deployment
        Show-Summary
    }
    catch {
        Write-Error "Deployment failed: $_"
        Remove-TempFiles
        exit 1
    }
}

# Run main function
Main