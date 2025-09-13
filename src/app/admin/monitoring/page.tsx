import React from 'react';
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard';

/**
 * Admin Monitoring Page
 * Displays system monitoring dashboard for administrators
 */

export default function MonitoringPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MonitoringDashboard />
    </div>
  );
}

export const metadata = {
  title: 'System Monitoring - Thai Document Generator',
  description: 'System monitoring and usage metrics for administrators',
};