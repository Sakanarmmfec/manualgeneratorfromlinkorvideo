'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';

interface SystemStatus {
  online: boolean;
  apiStatus: 'connected' | 'disconnected' | 'checking';
  lastUpdate: Date;
}

export function StatusBar() {
  const [status, setStatus] = useState<SystemStatus>({
    online: true,
    apiStatus: 'checking',
    lastUpdate: new Date()
  });

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setStatus(prev => ({
        ...prev,
        online: navigator.onLine,
        lastUpdate: new Date()
      }));
    };

    // Check API status (mock for now)
    const checkApiStatus = async () => {
      try {
        // In real implementation, this would check the MFEC API endpoint
        setStatus(prev => ({
          ...prev,
          apiStatus: 'connected',
          lastUpdate: new Date()
        }));
      } catch {
        setStatus(prev => ({
          ...prev,
          apiStatus: 'disconnected',
          lastUpdate: new Date()
        }));
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
    checkApiStatus();

    // Periodic API check
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const getStatusIcon = () => {
    if (!status.online) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    switch (status.apiStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!status.online) {
      return 'ออฟไลน์';
    }
    
    switch (status.apiStatus) {
      case 'connected':
        return 'เชื่อมต่อแล้ว';
      case 'disconnected':
        return 'ไม่สามารถเชื่อมต่อ';
      case 'checking':
        return 'กำลังตรวจสอบ...';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getStatusColor = () => {
    if (!status.online) {
      return 'text-red-600';
    }
    
    switch (status.apiStatus) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="text-gray-500">
          อัปเดตล่าสุด: {status.lastUpdate.toLocaleTimeString('th-TH')}
        </div>
      </div>
    </div>
  );
}