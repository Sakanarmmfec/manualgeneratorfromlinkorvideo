'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  HardDrive, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';

/**
 * Free Tier Monitoring Dashboard
 * Displays usage metrics and health status for administrators
 */

interface UsageMetrics {
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
    deploymentTime: string;
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  };
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitoring?type=overview');
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
        setLastUpdated(new Date());
        setError('');
      } else {
        setError(data.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError('Network error while fetching metrics');
      console.error('Metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_metrics' }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchMetrics(); // Refresh after clearing
      } else {
        setError(data.error || 'Failed to clear metrics');
      }
    } catch (err) {
      setError('Failed to clear metrics');
      console.error('Clear metrics error:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading monitoring data...
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertDescription>No monitoring data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">
            Free tier usage and performance metrics
            {lastUpdated && (
              <span className="ml-2 text-sm">
                (Updated: {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={clearMetrics} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Metrics
          </Button>
        </div>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(metrics.health.status)}
            System Health
            <Badge className={getStatusColor(metrics.health.status)}>
              {metrics.health.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.health.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-700 mb-2">Issues:</h4>
              <ul className="list-disc list-inside space-y-1">
                {metrics.health.issues.map((issue, index) => (
                  <li key={index} className="text-red-600">{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {metrics.health.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1">
                {metrics.health.recommendations.map((rec, index) => (
                  <li key={index} className="text-blue-600">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Memory Usage
            </CardTitle>
            <CardDescription>
              {metrics.resources.memoryUsageMB}MB / {metrics.resources.memoryLimitMB}MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={metrics.resources.memoryPercentage} 
              className="mb-2"
            />
            <p className="text-sm text-gray-600">
              {metrics.resources.memoryPercentage}% used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>
              {Math.round(metrics.resources.storageUsageMB)}MB / {metrics.resources.storageLimitMB}MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={metrics.resources.storagePercentage} 
              className="mb-2"
            />
            <p className="text-sm text-gray-600">
              {Math.round(metrics.resources.storagePercentage)}% used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">{metrics.requests.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Hour:</span>
                <span className="font-medium">{metrics.requests.lastHour}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-medium">
                  {metrics.requests.total > 0 
                    ? Math.round((metrics.requests.successful / metrics.requests.total) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Generated:</span>
                <span className="font-medium">{metrics.documents.generated}</span>
              </div>
              <div className="flex justify-between">
                <span>Stored:</span>
                <span className="font-medium">{metrics.documents.stored}</span>
              </div>
              <div className="flex justify-between">
                <span>Downloaded:</span>
                <span className="font-medium">{metrics.documents.downloaded}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Platform:</span>
                <span className="font-medium capitalize">{metrics.platform.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-medium">{formatUptime(metrics.platform.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Response:</span>
                <span className="font-medium">{metrics.performance.averageResponseTime}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Summary */}
      {metrics.errors.commonErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Common Errors
            </CardTitle>
            <CardDescription>
              {metrics.errors.total} total errors, {metrics.errors.lastHour} in the last hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.errors.commonErrors.slice(0, 5).map((error, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm truncate flex-1 mr-2">{error.message}</span>
                  <Badge variant="secondary">{error.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}