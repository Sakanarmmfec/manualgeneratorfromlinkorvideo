#!/usr/bin/env node

/**
 * Deployment Configuration Validation Script
 * Validates Docker files, environment configurations, and deployment setup
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description}: ${filePath}`, colors.green);
    return true;
  } else {
    log(`✗ ${description}: ${filePath} (missing)`, colors.red);
    return false;
  }
}

function validateDockerfile() {
  log('\n=== Docker Configuration Validation ===', colors.blue);
  
  let valid = true;
  
  // Check Docker files
  valid &= checkFileExists('Dockerfile', 'Production Dockerfile');
  valid &= checkFileExists('Dockerfile.dev', 'Development Dockerfile');
  valid &= checkFileExists('.dockerignore', 'Docker ignore file');
  
  // Check Docker Compose files
  valid &= checkFileExists('docker-compose.yml', 'Main Docker Compose');
  valid &= checkFileExists('docker-compose.staging.yml', 'Staging Docker Compose');
  valid &= checkFileExists('docker-compose.production.yml', 'Production Docker Compose');
  
  return valid;
}

function validateEnvironmentFiles() {
  log('\n=== Environment Configuration Validation ===', colors.blue);
  
  let valid = true;
  
  // Check environment files
  valid &= checkFileExists('.env.example', 'Environment example');
  valid &= checkFileExists('.env.development', 'Development environment');
  valid &= checkFileExists('.env.staging', 'Staging environment');
  valid &= checkFileExists('.env.production', 'Production environment');
  
  // Validate environment file contents
  const envFiles = ['.env.development', '.env.staging', '.env.production'];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const requiredVars = [
        'NODE_ENV',
        'MFEC_LLM_BASE_URL',
        'NEXT_PUBLIC_APP_URL',
        'ENCRYPTION_KEY'
      ];
      
      requiredVars.forEach(varName => {
        if (content.includes(varName)) {
          log(`  ✓ ${varName} defined in ${envFile}`, colors.green);
        } else {
          log(`  ✗ ${varName} missing in ${envFile}`, colors.red);
          valid = false;
        }
      });
    }
  });
  
  return valid;
}

function validateDeploymentScripts() {
  log('\n=== Deployment Scripts Validation ===', colors.blue);
  
  let valid = true;
  
  // Check deployment scripts
  valid &= checkFileExists('scripts/deploy.sh', 'Bash deployment script');
  valid &= checkFileExists('scripts/deploy.ps1', 'PowerShell deployment script');
  
  // Check CI/CD configuration
  valid &= checkFileExists('.github/workflows/ci-cd.yml', 'GitHub Actions workflow');
  
  return valid;
}

function validateApplicationStructure() {
  log('\n=== Application Structure Validation ===', colors.blue);
  
  let valid = true;
  
  // Check key application files
  valid &= checkFileExists('package.json', 'Package configuration');
  valid &= checkFileExists('next.config.js', 'Next.js configuration');
  valid &= checkFileExists('src/config/environment.ts', 'Environment configuration');
  valid &= checkFileExists('src/app/api/health/route.ts', 'Health check endpoint');
  
  // Check package.json for required scripts
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = [
      'build',
      'start',
      'docker:build',
      'docker:dev',
      'health-check'
    ];
    
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`  ✓ Script '${script}' defined`, colors.green);
      } else {
        log(`  ✗ Script '${script}' missing`, colors.red);
        valid = false;
      }
    });
  }
  
  return valid;
}

function validateDocumentation() {
  log('\n=== Documentation Validation ===', colors.blue);
  
  let valid = true;
  
  valid &= checkFileExists('docs/deployment.md', 'Deployment documentation');
  valid &= checkFileExists('README.md', 'Project README');
  
  return valid;
}

function validateNextJsConfiguration() {
  log('\n=== Next.js Configuration Validation ===', colors.blue);
  
  let valid = true;
  
  if (fs.existsSync('next.config.js')) {
    const content = fs.readFileSync('next.config.js', 'utf8');
    
    if (content.includes("output: 'standalone'")) {
      log('  ✓ Standalone output configured for Docker', colors.green);
    } else {
      log('  ✗ Standalone output not configured (required for Docker)', colors.red);
      valid = false;
    }
  }
  
  return valid;
}

function main() {
  log('🚀 Thai Document Generator - Deployment Configuration Validator', colors.blue);
  log('================================================================', colors.blue);
  
  let overallValid = true;
  
  overallValid &= validateDockerfile();
  overallValid &= validateEnvironmentFiles();
  overallValid &= validateDeploymentScripts();
  overallValid &= validateApplicationStructure();
  overallValid &= validateNextJsConfiguration();
  overallValid &= validateDocumentation();
  
  log('\n=== Validation Summary ===', colors.blue);
  
  if (overallValid) {
    log('✅ All deployment configurations are valid!', colors.green);
    log('\nNext steps:', colors.blue);
    log('1. Start Docker daemon', colors.yellow);
    log('2. Copy .env.example to .env and configure', colors.yellow);
    log('3. Run: npm run docker:dev', colors.yellow);
    log('4. Test health check: npm run health-check', colors.yellow);
    process.exit(0);
  } else {
    log('❌ Some deployment configurations are invalid or missing!', colors.red);
    log('\nPlease fix the issues above before deploying.', colors.yellow);
    process.exit(1);
  }
}

// Run validation
main();