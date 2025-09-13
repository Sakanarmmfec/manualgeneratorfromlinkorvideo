# Thai Document Generator Deployment Script (PowerShell)
# Usage: .\scripts\deploy.ps1 -Environment [environment] -Version [version]
# Example: .\scripts\deploy.ps1 -Environment production -Version v1.0.0

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "staging",
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

# Configuration
$AppName = "thai-document-generator"
$Registry = "your-registry.com"  # Replace with your container registry

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

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    try {
        docker --version | Out-Null
        docker info | Out-Null
    }
    catch {
        Write-Error "Docker is not installed or not running"
        exit 1
    }
    
    # Check if environment file exists
    if (-not (Test-Path ".env.$Environment")) {
        Write-Error "Environment file .env.$Environment not found"
        exit 1
    }
    
    Write-Info "Prerequisites check passed"
}

# Build Docker image
function Build-Image {
    Write-Info "Building Docker image for $Environment..."
    
    # Copy environment-specific file
    Copy-Item ".env.$Environment" ".env.local"
    
    try {
        # Build the image
        docker build -t "${AppName}:$Version" -t "${AppName}:latest" .
        Write-Info "Docker image built successfully"
    }
    finally {
        # Clean up
        if (Test-Path ".env.local") {
            Remove-Item ".env.local"
        }
    }
}

# Run tests
function Invoke-Tests {
    Write-Info "Running tests..."
    
    try {
        docker run --rm -v "${PWD}:/app" -w /app node:18-alpine sh -c "npm ci && npm run test"
        Write-Info "Tests passed"
    }
    catch {
        Write-Error "Tests failed"
        exit 1
    }
}

# Deploy to environment
function Deploy-Application {
    Write-Info "Deploying to $Environment..."
    
    switch ($Environment) {
        "development" { Deploy-Development }
        "staging" { Deploy-Staging }
        "production" { Deploy-Production }
    }
}

# Development deployment
function Deploy-Development {
    Write-Info "Starting development deployment..."
    
    # Stop existing containers
    docker-compose --profile dev down 2>$null
    
    # Start development services
    docker-compose --profile dev up -d
    
    Write-Info "Development deployment completed"
    Write-Info "Application available at: http://localhost:3001"
}

# Staging deployment
function Deploy-Staging {
    Write-Info "Starting staging deployment..."
    
    # Tag for staging
    docker tag "${AppName}:$Version" "${AppName}:staging"
    
    # Stop existing staging containers
    docker-compose -f docker-compose.staging.yml down 2>$null
    
    # Deploy to staging
    docker-compose -f docker-compose.staging.yml up -d
    
    Write-Info "Staging deployment completed"
}

# Production deployment
function Deploy-Production {
    Write-Info "Starting production deployment..."
    
    # Additional validation for production
    if ($Version -eq "latest") {
        Write-Error "Production deployment requires a specific version tag"
        exit 1
    }
    
    # Tag for production
    docker tag "${AppName}:$Version" "${AppName}:production"
    
    # Push to registry (if configured)
    if ($Registry -and $Registry -ne "your-registry.com") {
        Write-Info "Pushing to registry..."
        docker tag "${AppName}:$Version" "${Registry}/${AppName}:$Version"
        docker push "${Registry}/${AppName}:$Version"
    }
    
    # Deploy to production
    docker-compose -f docker-compose.production.yml down 2>$null
    docker-compose -f docker-compose.production.yml up -d
    
    Write-Info "Production deployment completed"
}

# Health check
function Test-Health {
    Write-Info "Performing health check..."
    
    $maxAttempts = 30
    $attempt = 1
    $port = 3000
    
    if ($Environment -eq "development") {
        $port = 3001
    }
    
    while ($attempt -le $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Info "Health check passed"
                return $true
            }
        }
        catch {
            Write-Warn "Health check attempt $attempt/$maxAttempts failed, retrying..."
            Start-Sleep -Seconds 5
            $attempt++
        }
    }
    
    Write-Error "Health check failed after $maxAttempts attempts"
    return $false
}

# Rollback function
function Invoke-Rollback {
    Write-Warn "Rolling back deployment..."
    
    switch ($Environment) {
        "development" { docker-compose --profile dev down }
        "staging" { docker-compose -f docker-compose.staging.yml down }
        "production" { docker-compose -f docker-compose.production.yml down }
    }
    
    Write-Info "Rollback completed"
}

# Main deployment flow
function Main {
    Write-Info "Starting deployment process..."
    Write-Info "Environment: $Environment"
    Write-Info "Version: $Version"
    
    try {
        Test-Prerequisites
        Build-Image
        Invoke-Tests
        Deploy-Application
        
        if (-not (Test-Health)) {
            Write-Error "Deployment failed health check"
            Invoke-Rollback
            exit 1
        }
        
        Write-Info "Deployment completed successfully!"
        Write-Info "Environment: $Environment"
        Write-Info "Version: $Version"
    }
    catch {
        Write-Error "Deployment failed: $_"
        Invoke-Rollback
        exit 1
    }
}

# Run main function
Main