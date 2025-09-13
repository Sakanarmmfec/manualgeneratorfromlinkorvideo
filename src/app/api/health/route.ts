import { NextRequest, NextResponse } from 'next/server';
import { environmentManager } from '@/config/environment';

/**
 * Health Check API Endpoint
 * Provides application health status for monitoring and deployment verification
 */

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: 'pass' | 'fail';
    llm: 'pass' | 'fail';
    filesystem: 'pass' | 'fail';
    configuration: 'pass' | 'fail';
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  freeTier?: {
    platform: string;
    memoryLimit: number;
    storageUsed: number;
    storageLimit: number;
    warnings: string[];
  };
}

const startTime = Date.now();

async function checkLLMConnection(): Promise<'pass' | 'fail'> {
  try {
    const config = environmentManager.getConfig();
    
    // Simple connectivity check (don't make actual API calls in health check)
    if (!config.llm.baseUrl || !config.llm.apiKey) {
      return 'fail';
    }
    
    return 'pass';
  } catch (error) {
    console.error('LLM health check failed:', error);
    return 'fail';
  }
}

async function checkFilesystem(): Promise<'pass' | 'fail'> {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if exports directory exists and is writable
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    // Test write access
    const testFile = path.join(exportsDir, '.health-check');
    fs.writeFileSync(testFile, 'health-check');
    fs.unlinkSync(testFile);
    
    return 'pass';
  } catch (error) {
    console.error('Filesystem health check failed:', error);
    return 'fail';
  }
}

async function checkConfiguration(): Promise<'pass' | 'fail'> {
  try {
    const validation = environmentManager.validateConfiguration();
    return validation.isValid ? 'pass' : 'fail';
  } catch (error) {
    console.error('Configuration health check failed:', error);
    return 'fail';
  }
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  const total = usage.heapTotal;
  const used = usage.heapUsed;
  
  return {
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round((used / total) * 100),
  };
}

function detectPlatform(): string {
  // Detect hosting platform based on environment variables
  if (process.env.RAILWAY_ENVIRONMENT) return 'railway';
  if (process.env.RENDER) return 'render';
  if (process.env.VERCEL) return 'vercel';
  if (process.env.HEROKU_APP_NAME) return 'heroku';
  return 'unknown';
}

async function getFreeTierStatus() {
  try {
    const platform = detectPlatform();
    const fs = require('fs');
    const path = require('path');
    
    // Get storage usage
    let storageUsed = 0;
    const exportsDir = path.join(process.cwd(), 'exports');
    
    if (fs.existsSync(exportsDir)) {
      const files = fs.readdirSync(exportsDir);
      for (const file of files) {
        const filePath = path.join(exportsDir, file);
        const stats = fs.statSync(filePath);
        storageUsed += stats.size;
      }
    }
    
    storageUsed = Math.round(storageUsed / 1024 / 1024); // Convert to MB
    
    // Platform-specific limits and warnings
    const platformLimits = {
      railway: { memory: 512, storage: 1024 },
      render: { memory: 512, storage: 1024 },
      vercel: { memory: 1024, storage: 1024 }, // Serverless
      unknown: { memory: 512, storage: 1024 }
    };
    
    const limits = platformLimits[platform as keyof typeof platformLimits] || platformLimits.unknown;
    const memory = getMemoryUsage();
    
    const warnings: string[] = [];
    
    // Memory warnings
    if (memory.percentage > 80) {
      warnings.push(`High memory usage: ${memory.percentage}%`);
    }
    
    // Storage warnings
    const storagePercentage = (storageUsed / limits.storage) * 100;
    if (storagePercentage > 80) {
      warnings.push(`High storage usage: ${Math.round(storagePercentage)}%`);
    }
    
    // Platform-specific warnings
    if (platform === 'render' && memory.used > 400) {
      warnings.push('Approaching Render free tier memory limit');
    }
    
    if (platform === 'railway' && storageUsed > 800) {
      warnings.push('Approaching Railway storage limit');
    }
    
    return {
      platform,
      memoryLimit: limits.memory,
      storageUsed,
      storageLimit: limits.storage,
      warnings
    };
  } catch (error) {
    console.error('Free tier status check failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const config = environmentManager.getConfig();
    
    // Run health checks
    const [llmCheck, filesystemCheck, configCheck, freeTierStatus] = await Promise.all([
      checkLLMConnection(),
      checkFilesystem(),
      checkConfiguration(),
      getFreeTierStatus(),
    ]);
    
    const checks = {
      database: 'pass' as const, // No database in this application
      llm: llmCheck,
      filesystem: filesystemCheck,
      configuration: configCheck,
    };
    
    // Determine overall health status
    const isHealthy = Object.values(checks).every(check => check === 'pass');
    
    const healthStatus: HealthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: config.nodeEnv,
      checks,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      memory: getMemoryUsage(),
      ...(freeTierStatus && { freeTier: freeTierStatus }),
    };
    
    // Return appropriate HTTP status code
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: environmentManager.getConfig().nodeEnv,
      checks: {
        database: 'fail',
        llm: 'fail',
        filesystem: 'fail',
        configuration: 'fail',
      },
      uptime: Math.floor((Date.now() - startTime) / 1000),
      memory: getMemoryUsage(),
    };
    
    return NextResponse.json(errorStatus, { status: 503 });
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const config = environmentManager.getConfig();
    const validation = environmentManager.validateConfiguration();
    
    if (validation.isValid) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 503 });
    }
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}