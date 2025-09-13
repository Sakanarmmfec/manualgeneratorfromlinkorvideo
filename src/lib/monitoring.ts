/**
 * Free Tier Usage Monitoring
 * Tracks application usage within free hosting platform limits
 */

import { environmentManager } from '@/config/environment';
import { logger } from './logger';

export interface UsageMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    lastHour: number;
    lastDay: number;
  };
  documents: {
    generated: number;
    stored: number;
    downloaded: number;
    totalSizeMB: number;
  };
  resources: {
    memoryUsageMB: number;
    memoryLimitMB: number;
    memoryPercentage: number;
    storageUsageMB: number;
    storageLimitMB: number;
    storagePercentage: number;
  };
  performance: {
    averageResponseTime: number;
    slowestEndpoint: string;
    slowestResponseTime: number;
  };
  errors: {
    total: number;
    lastHour: number;
    commonErrors: { message: string; count: number }[];
  };
  platform: {
    name: string;
    uptime: number;
    deploymentTime: Date;
  };
}

export interface RequestMetric {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  userId?: string;
}

export interface ErrorMetric {
  timestamp: Date;
  message: string;
  stack?: string;
  endpoint?: string;
  userId?: string;
}

class FreeTierMonitor {
  private requests: RequestMetric[] = [];
  private errors: ErrorMetric[] = [];
  private documentMetrics = {
    generated: 0,
    stored: 0,
    downloaded: 0,
    totalSizeMB: 0,
  };
  private startTime = new Date();
  private maxMetricsRetention = 1000; // Keep last 1000 entries for free tier

  constructor() {
    this.startPeriodicCleanup();
  }

  private startPeriodicCleanup(): void {
    // Clean up old metrics every 10 minutes to manage memory
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 10 * 60 * 1000);
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Keep only recent requests (last 1000 or last day, whichever is smaller)
    this.requests = this.requests
      .filter(req => req.timestamp > oneDayAgo)
      .slice(-this.maxMetricsRetention);

    // Keep only recent errors (last 500 or last day, whichever is smaller)
    this.errors = this.errors
      .filter(err => err.timestamp > oneDayAgo)
      .slice(-500);

    logger.debug(`Metrics cleanup completed. Requests: ${this.requests.length}, Errors: ${this.errors.length}`);
  }

  public recordRequest(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    userAgent?: string,
    userId?: string
  ): void {
    const metric: RequestMetric = {
      timestamp: new Date(),
      method,
      path,
      statusCode,
      responseTime,
      userAgent,
      userId,
    };

    this.requests.push(metric);

    // Keep memory usage manageable
    if (this.requests.length > this.maxMetricsRetention) {
      this.requests = this.requests.slice(-this.maxMetricsRetention);
    }
  }

  public recordError(
    message: string,
    stack?: string,
    endpoint?: string,
    userId?: string
  ): void {
    const metric: ErrorMetric = {
      timestamp: new Date(),
      message,
      stack,
      endpoint,
      userId,
    };

    this.errors.push(metric);

    // Keep memory usage manageable
    if (this.errors.length > 500) {
      this.errors = this.errors.slice(-500);
    }
  }

  public recordDocumentGenerated(): void {
    this.documentMetrics.generated++;
  }

  public recordDocumentStored(sizeMB: number): void {
    this.documentMetrics.stored++;
    this.documentMetrics.totalSizeMB += sizeMB;
  }

  public recordDocumentDownloaded(): void {
    this.documentMetrics.downloaded++;
  }

  public getUsageMetrics(): UsageMetrics {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Request metrics
    const recentRequests = this.requests.filter(req => req.timestamp > oneHourAgo);
    const dailyRequests = this.requests.filter(req => req.timestamp > oneDayAgo);
    const successfulRequests = this.requests.filter(req => req.statusCode >= 200 && req.statusCode < 400);
    const failedRequests = this.requests.filter(req => req.statusCode >= 400);

    // Error metrics
    const recentErrors = this.errors.filter(err => err.timestamp > oneHourAgo);
    const errorCounts = new Map<string, number>();
    this.errors.forEach(err => {
      const count = errorCounts.get(err.message) || 0;
      errorCounts.set(err.message, count + 1);
    });
    const commonErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Performance metrics
    const responseTimes = this.requests.map(req => req.responseTime).filter(time => time > 0);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const slowestRequest = this.requests.reduce((slowest, req) => 
      req.responseTime > slowest.responseTime ? req : slowest, 
      { path: '', responseTime: 0 }
    );

    // Resource metrics
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryLimitMB = environmentManager.getMemoryLimit();
    const storageLimitMB = environmentManager.getStorageLimit();

    return {
      requests: {
        total: this.requests.length,
        successful: successfulRequests.length,
        failed: failedRequests.length,
        lastHour: recentRequests.length,
        lastDay: dailyRequests.length,
      },
      documents: this.documentMetrics,
      resources: {
        memoryUsageMB,
        memoryLimitMB,
        memoryPercentage: Math.round((memoryUsageMB / memoryLimitMB) * 100),
        storageUsageMB: this.documentMetrics.totalSizeMB,
        storageLimitMB,
        storagePercentage: Math.round((this.documentMetrics.totalSizeMB / storageLimitMB) * 100),
      },
      performance: {
        averageResponseTime: Math.round(averageResponseTime),
        slowestEndpoint: slowestRequest.path,
        slowestResponseTime: Math.round(slowestRequest.responseTime),
      },
      errors: {
        total: this.errors.length,
        lastHour: recentErrors.length,
        commonErrors,
      },
      platform: {
        name: environmentManager.getPlatform(),
        uptime: Math.floor((now.getTime() - this.startTime.getTime()) / 1000),
        deploymentTime: this.startTime,
      },
    };
  }

  public getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.getUsageMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Memory usage checks
    if (metrics.resources.memoryPercentage > 90) {
      status = 'critical';
      issues.push(`Critical memory usage: ${metrics.resources.memoryPercentage}%`);
      recommendations.push('Restart application to free memory');
    } else if (metrics.resources.memoryPercentage > 75) {
      status = 'warning';
      issues.push(`High memory usage: ${metrics.resources.memoryPercentage}%`);
      recommendations.push('Monitor memory usage and consider cleanup');
    }

    // Storage usage checks
    if (metrics.resources.storagePercentage > 90) {
      status = 'critical';
      issues.push(`Critical storage usage: ${metrics.resources.storagePercentage}%`);
      recommendations.push('Delete old documents to free storage');
    } else if (metrics.resources.storagePercentage > 75) {
      if (status !== 'critical') status = 'warning';
      issues.push(`High storage usage: ${metrics.resources.storagePercentage}%`);
      recommendations.push('Consider enabling automatic cleanup');
    }

    // Error rate checks
    const errorRate = metrics.requests.total > 0 
      ? (metrics.errors.lastHour / metrics.requests.lastHour) * 100 
      : 0;
    
    if (errorRate > 20) {
      status = 'critical';
      issues.push(`High error rate: ${Math.round(errorRate)}%`);
      recommendations.push('Check application logs for recurring errors');
    } else if (errorRate > 10) {
      if (status !== 'critical') status = 'warning';
      issues.push(`Elevated error rate: ${Math.round(errorRate)}%`);
      recommendations.push('Monitor error patterns');
    }

    // Performance checks
    if (metrics.performance.averageResponseTime > 10000) {
      if (status !== 'critical') status = 'warning';
      issues.push(`Slow response times: ${metrics.performance.averageResponseTime}ms average`);
      recommendations.push('Optimize slow endpoints or increase resources');
    }

    return { status, issues, recommendations };
  }

  public getMemoryUsage(): { entries: number; estimatedSizeKB: number } {
    const requestsSize = JSON.stringify(this.requests).length;
    const errorsSize = JSON.stringify(this.errors).length;
    const totalSize = requestsSize + errorsSize;

    return {
      entries: this.requests.length + this.errors.length,
      estimatedSizeKB: Math.round(totalSize / 1024),
    };
  }

  public clearMetrics(): void {
    this.requests = [];
    this.errors = [];
    this.documentMetrics = {
      generated: 0,
      stored: 0,
      downloaded: 0,
      totalSizeMB: 0,
    };
    logger.info('Usage metrics cleared');
  }
}

// Export singleton instance
export const monitor = new FreeTierMonitor();

// Middleware helper for request tracking
export function trackRequest(
  method: string,
  path: string,
  statusCode: number,
  responseTime: number,
  userAgent?: string,
  userId?: string
): void {
  monitor.recordRequest(method, path, statusCode, responseTime, userAgent, userId);
}

// Error tracking helper
export function trackError(
  message: string,
  stack?: string,
  endpoint?: string,
  userId?: string
): void {
  monitor.recordError(message, stack, endpoint, userId);
}

// Document operation tracking
export const documentTracking = {
  generated: () => monitor.recordDocumentGenerated(),
  stored: (sizeMB: number) => monitor.recordDocumentStored(sizeMB),
  downloaded: () => monitor.recordDocumentDownloaded(),
};

// Platform-specific monitoring setup
export function getPlatformMonitoringSetup(): {
  platform: string;
  nativeMonitoring: string[];
  externalTools: string[];
  limitations: string[];
} {
  const platform = environmentManager.getPlatform();
  
  const platformSetups = {
    railway: {
      nativeMonitoring: [
        'Built-in metrics dashboard',
        'Resource usage graphs',
        'Deployment logs',
        'Health check monitoring'
      ],
      externalTools: [
        'UptimeRobot (free tier: 50 monitors)',
        'Pingdom (free tier: 1 monitor)',
        'StatusCake (free tier: 10 tests)'
      ],
      limitations: [
        'Limited log retention (7 days)',
        'Basic metrics only',
        'No custom alerting on free tier'
      ]
    },
    render: {
      nativeMonitoring: [
        'Service metrics dashboard',
        'Build and deploy logs',
        'Health check status',
        'Resource usage tracking'
      ],
      externalTools: [
        'Better Uptime (free tier: 10 monitors)',
        'Freshping (free tier: 50 checks)',
        'Site24x7 (free tier: 5 monitors)'
      ],
      limitations: [
        'Limited historical data',
        'No custom metrics',
        'Basic alerting only'
      ]
    },
    vercel: {
      nativeMonitoring: [
        'Analytics dashboard',
        'Function logs',
        'Performance insights',
        'Error tracking'
      ],
      externalTools: [
        'Sentry (free tier: 5K errors/month)',
        'LogRocket (free tier: 1K sessions/month)',
        'Datadog (free tier: 5 hosts)'
      ],
      limitations: [
        'Serverless function limits',
        'Limited log retention',
        'No persistent storage monitoring'
      ]
    }
  };

  return {
    platform,
    ...(platformSetups[platform as keyof typeof platformSetups] || {
      nativeMonitoring: ['Basic logging'],
      externalTools: ['Manual monitoring'],
      limitations: ['Platform not recognized']
    })
  };
}