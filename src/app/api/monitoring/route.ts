import { NextRequest, NextResponse } from 'next/server';
import { monitor } from '@/lib/monitoring';
import { authManager } from '@/lib/auth';
import { storageManager } from '@/lib/storage';
import { logger } from '@/lib/logger';

/**
 * Monitoring API Endpoint
 * Provides usage metrics and health status for free tier monitoring
 */

export async function GET(request: NextRequest) {
  try {
    // Check authentication - only admins can view monitoring data
    const authResult = authManager.requireAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return await getOverviewMetrics();
      
      case 'health':
        return await getHealthStatus();
      
      case 'storage':
        return await getStorageMetrics();
      
      case 'memory':
        return await getMemoryMetrics();
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid metrics type' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Monitoring API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}

async function getOverviewMetrics() {
  const metrics = monitor.getUsageMetrics();
  const healthStatus = monitor.getHealthStatus();
  const storageUsage = await storageManager.getStorageUsage();

  return NextResponse.json({
    success: true,
    data: {
      ...metrics,
      health: healthStatus,
      storage: storageUsage,
      timestamp: new Date().toISOString(),
    }
  });
}

async function getHealthStatus() {
  const healthStatus = monitor.getHealthStatus();
  const storageUsage = await storageManager.getStorageUsage();
  
  // Add storage-specific health checks
  if (storageUsage.usagePercentage > 90) {
    healthStatus.status = 'critical';
    healthStatus.issues.push(`Storage critically full: ${Math.round(storageUsage.usagePercentage)}%`);
    healthStatus.recommendations.push('Delete old documents immediately');
  } else if (storageUsage.usagePercentage > 75) {
    if (healthStatus.status !== 'critical') {
      healthStatus.status = 'warning';
    }
    healthStatus.issues.push(`Storage usage high: ${Math.round(storageUsage.usagePercentage)}%`);
    healthStatus.recommendations.push('Enable automatic cleanup or delete old documents');
  }

  return NextResponse.json({
    success: true,
    data: {
      ...healthStatus,
      storage: storageUsage,
      timestamp: new Date().toISOString(),
    }
  });
}

async function getStorageMetrics() {
  const storageUsage = await storageManager.getStorageUsage();
  const documents = await storageManager.listDocuments();
  
  // Calculate storage trends
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentDocuments = documents.filter(doc => doc.createdAt > oneDayAgo);
  const weeklyDocuments = documents.filter(doc => doc.createdAt > oneWeekAgo);
  
  const recentSize = recentDocuments.reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024;
  const weeklySize = weeklyDocuments.reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024;

  return NextResponse.json({
    success: true,
    data: {
      ...storageUsage,
      trends: {
        documentsToday: recentDocuments.length,
        documentsThisWeek: weeklyDocuments.length,
        sizeTodayMB: Math.round(recentSize * 100) / 100,
        sizeThisWeekMB: Math.round(weeklySize * 100) / 100,
      },
      documents: documents.map(doc => ({
        id: doc.id,
        filename: doc.originalName,
        sizeMB: Math.round((doc.size / 1024 / 1024) * 100) / 100,
        createdAt: doc.createdAt,
        expiresAt: doc.expiresAt,
        type: doc.metadata.documentType,
      })),
      timestamp: new Date().toISOString(),
    }
  });
}

async function getMemoryMetrics() {
  const memoryUsage = process.memoryUsage();
  const monitorMemory = monitor.getMemoryUsage();
  const loggerMemory = logger.getMemoryUsage();

  const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const usedMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const externalMemoryMB = Math.round(memoryUsage.external / 1024 / 1024);

  return NextResponse.json({
    success: true,
    data: {
      system: {
        totalMB: totalMemoryMB,
        usedMB: usedMemoryMB,
        freeMB: totalMemoryMB - usedMemoryMB,
        externalMB: externalMemoryMB,
        percentage: Math.round((usedMemoryMB / totalMemoryMB) * 100),
      },
      components: {
        monitor: monitorMemory,
        logger: loggerMemory,
      },
      recommendations: getMemoryRecommendations(usedMemoryMB, totalMemoryMB),
      timestamp: new Date().toISOString(),
    }
  });
}

function getMemoryRecommendations(usedMB: number, totalMB: number): string[] {
  const percentage = (usedMB / totalMB) * 100;
  const recommendations: string[] = [];

  if (percentage > 90) {
    recommendations.push('Critical: Restart application immediately');
    recommendations.push('Clear monitoring metrics and logs');
    recommendations.push('Delete unnecessary documents');
  } else if (percentage > 75) {
    recommendations.push('Clear old monitoring data');
    recommendations.push('Enable automatic cleanup');
    recommendations.push('Monitor memory usage closely');
  } else if (percentage > 50) {
    recommendations.push('Consider enabling periodic cleanup');
    recommendations.push('Monitor growth trends');
  } else {
    recommendations.push('Memory usage is healthy');
  }

  return recommendations;
}

// POST endpoint for clearing metrics (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = authManager.requireAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    switch (action) {
      case 'clear_metrics':
        monitor.clearMetrics();
        logger.clearLogs();
        logger.info(`Metrics cleared by admin: ${authResult.session?.email}`);
        return NextResponse.json({ success: true, message: 'Metrics cleared' });

      case 'cleanup_storage':
        // This would trigger storage cleanup
        // Implementation depends on storage provider
        return NextResponse.json({ success: true, message: 'Storage cleanup initiated' });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Monitoring action error:', error);
    return NextResponse.json(
      { success: false, error: 'Action failed' },
      { status: 500 }
    );
  }
}