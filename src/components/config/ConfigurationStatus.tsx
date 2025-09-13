'use client';

import React, { useState, useEffect } from 'react';
import { ConfigValidationResult } from '@/types';

interface ConfigurationStatusProps {
  onRefresh?: () => void;
  className?: string;
}

interface ConfigStatus {
  status: 'healthy' | 'warning' | 'error' | 'loading';
  message: string;
  details?: ConfigValidationResult;
  keyStatus?: {
    status: string;
    currentKeyType: string;
    hasFallback: boolean;
    canUseFallback: boolean;
  };
}

/**
 * ConfigurationStatus component displays the current configuration health
 * and API key status
 */
export const ConfigurationStatus: React.FC<ConfigurationStatusProps> = ({
  onRefresh,
  className = ''
}) => {
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    status: 'loading',
    message: 'Loading configuration...'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const checkConfigurationStatus = async () => {
    try {
      setConfigStatus({ status: 'loading', message: 'Checking configuration...' });

      // In a real implementation, this would call the API
      // For now, we'll simulate the check
      const response = await fetch('/api/config/status');
      
      if (response.ok) {
        const data = await response.json();
        setConfigStatus(data);
      } else {
        setConfigStatus({
          status: 'error',
          message: 'Failed to check configuration status'
        });
      }
    } catch (error) {
      setConfigStatus({
        status: 'error',
        message: 'Configuration check failed'
      });
    }
  };

  useEffect(() => {
    checkConfigurationStatus();
  }, []);

  const handleRefresh = () => {
    checkConfigurationStatus();
    onRefresh?.();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'loading':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'loading':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(configStatus.status)} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon(configStatus.status)}</span>
          <span className="font-medium">{configStatus.message}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={configStatus.status === 'loading'}
            className="text-sm px-2 py-1 rounded hover:bg-white hover:bg-opacity-50 disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          
          {(configStatus.details || configStatus.keyStatus) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm px-2 py-1 rounded hover:bg-white hover:bg-opacity-50"
            >
              {isExpanded ? '▲' : '▼'} Details
            </button>
          )}
        </div>
      </div>

      {isExpanded && (configStatus.details || configStatus.keyStatus) && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          
          {/* API Key Status */}
          {configStatus.keyStatus && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">API Key Status</h4>
              <div className="text-sm space-y-1">
                <div>Status: <span className="font-mono">{configStatus.keyStatus.status}</span></div>
                <div>Current Key: <span className="font-mono">{configStatus.keyStatus.currentKeyType}</span></div>
                <div>Has Fallback: <span className="font-mono">{configStatus.keyStatus.hasFallback ? 'Yes' : 'No'}</span></div>
                <div>Can Use Fallback: <span className="font-mono">{configStatus.keyStatus.canUseFallback ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          )}

          {/* Configuration Details */}
          {configStatus.details && (
            <div>
              <h4 className="font-medium mb-2">Configuration Details</h4>
              
              {configStatus.details.errors.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-red-700 mb-1">Errors:</h5>
                  <ul className="text-sm space-y-1">
                    {configStatus.details.errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-1">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {configStatus.details.warnings.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-yellow-700 mb-1">Warnings:</h5>
                  <ul className="text-sm space-y-1">
                    {configStatus.details.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-500 mr-1">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {configStatus.details.errors.length === 0 && configStatus.details.warnings.length === 0 && (
                <p className="text-sm text-green-700">All configuration checks passed successfully.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigurationStatus;