#!/usr/bin/env node

/**
 * Free Tier Monitoring Setup Script
 * Sets up basic health monitoring using free monitoring tools
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, colors.blue);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

// Configuration for monitoring setup
const monitoringConfig = {
  healthCheckUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.com',
  checkInterval: 5, // minutes
  alertEmail: process.env.ALERT_EMAIL || 'admin@example.com',
  slackWebhook: process.env.SLACK_WEBHOOK_URL || '',
  platforms: {
    uptimeRobot: {
      apiKey: process.env.UPTIMEROBOT_API_KEY || '',
      enabled: false
    },
    pingdom: {
      apiKey: process.env.PINGDOM_API_KEY || '',
      enabled: false
    }
  }
};

/**
 * Create monitoring configuration files
 */
function createMonitoringConfigs() {
  logStep('1', 'Creating monitoring configuration files...');
  
  // Create monitoring directory
  const monitoringDir = path.join(process.cwd(), 'monitoring');
  if (!fs.existsSync(monitoringDir)) {
    fs.mkdirSync(monitoringDir, { recursive: true });
    logSuccess('Created monitoring directory');
  }
  
  // Create health check script
  const healthCheckScript = `#!/usr/bin/env node

/**
 * Health Check Monitoring Script
 * Runs periodic health checks and sends alerts
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const config = {
  healthCheckUrl: '${monitoringConfig.healthCheckUrl}/api/health',
  monitoringUrl: '${monitoringConfig.healthCheckUrl}/api/monitoring',
  checkInterval: ${monitoringConfig.checkInterval} * 60 * 1000, // Convert to milliseconds
  alertEmail: '${monitoringConfig.alertEmail}',
  slackWebhook: '${monitoringConfig.slackWebhook}',
  logFile: path.join(__dirname, 'health-check.log'),
  
  // Alert thresholds
  thresholds: {
    memory: 80,
    storage: 85,
    responseTime: 10000, // 10 seconds
    errorRate: 5 // 5%
  }
};

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            responseTime
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            responseTime,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        responseTime: 30000
      });
    });
  });
}

/**
 * Send alert notification
 */
async function sendAlert(type, message, data = {}) {
  const timestamp = new Date().toISOString();
  const alertData = {
    type,
    message,
    timestamp,
    data,
    url: config.healthCheckUrl
  };
  
  // Log alert
  const logEntry = \`[\${timestamp}] ALERT: \${type} - \${message}\\n\`;
  fs.appendFileSync(config.logFile, logEntry);
  
  console.error(\`🚨 ALERT: \${type} - \${message}\`);
  
  // Send Slack notification if configured
  if (config.slackWebhook) {
    try {
      const slackPayload = {
        text: \`🚨 *\${type}*: \${message}\`,
        attachments: [{
          color: type === 'CRITICAL' ? 'danger' : 'warning',
          fields: [
            {
              title: 'Application',
              value: 'Thai Document Generator',
              short: true
            },
            {
              title: 'Time',
              value: timestamp,
              short: true
            },
            {
              title: 'URL',
              value: config.healthCheckUrl,
              short: false
            }
          ]
        }]
      };
      
      // Note: In a real implementation, you'd use a proper HTTP client
      console.log('Slack alert would be sent:', JSON.stringify(slackPayload, null, 2));
    } catch (error) {
      console.error('Failed to send Slack alert:', error.message);
    }
  }
  
  // Email notification would be implemented here
  // For free tier, consider using services like:
  // - EmailJS (free tier available)
  // - Formspree (free tier available)
  // - Netlify Forms (if using Netlify)
}

/**
 * Check application health
 */
async function checkHealth() {
  try {
    console.log(\`[\${new Date().toISOString()}] Running health check...\`);
    
    // Check health endpoint
    const healthResponse = await makeRequest(config.healthCheckUrl);
    
    if (healthResponse.statusCode !== 200) {
      await sendAlert('CRITICAL', \`Health check failed with status \${healthResponse.statusCode}\`, {
        statusCode: healthResponse.statusCode,
        responseTime: healthResponse.responseTime
      });
      return;
    }
    
    const healthData = healthResponse.data;
    
    // Check if application is healthy
    if (healthData.status !== 'healthy') {
      await sendAlert('CRITICAL', 'Application status is unhealthy', {
        status: healthData.status,
        checks: healthData.checks
      });
      return;
    }
    
    // Check response time
    if (healthResponse.responseTime > config.thresholds.responseTime) {
      await sendAlert('WARNING', \`Slow response time: \${healthResponse.responseTime}ms\`, {
        responseTime: healthResponse.responseTime,
        threshold: config.thresholds.responseTime
      });
    }
    
    // Check memory usage
    if (healthData.memory && healthData.memory.percentage > config.thresholds.memory) {
      await sendAlert('WARNING', \`High memory usage: \${healthData.memory.percentage}%\`, {
        memory: healthData.memory,
        threshold: config.thresholds.memory
      });
    }
    
    // Check free tier warnings
    if (healthData.freeTier && healthData.freeTier.warnings && healthData.freeTier.warnings.length > 0) {
      await sendAlert('WARNING', 'Free tier warnings detected', {
        warnings: healthData.freeTier.warnings,
        platform: healthData.freeTier.platform
      });
    }
    
    // Get detailed monitoring data
    try {
      const monitoringResponse = await makeRequest(config.monitoringUrl + '?type=overview');
      
      if (monitoringResponse.statusCode === 200) {
        const monitoringData = monitoringResponse.data;
        
        // Check storage usage
        if (monitoringData.storage && monitoringData.storage.percentage > config.thresholds.storage) {
          await sendAlert('WARNING', \`High storage usage: \${monitoringData.storage.percentage}%\`, {
            storage: monitoringData.storage,
            threshold: config.thresholds.storage
          });
        }
        
        // Check error rate
        if (monitoringData.errors && monitoringData.errors.rate > config.thresholds.errorRate) {
          await sendAlert('WARNING', \`High error rate: \${monitoringData.errors.rate}%\`, {
            errors: monitoringData.errors,
            threshold: config.thresholds.errorRate
          });
        }
      }
    } catch (error) {
      console.warn('Could not fetch detailed monitoring data:', error.message);
    }
    
    console.log('✓ Health check completed successfully');
    
  } catch (error) {
    await sendAlert('CRITICAL', 'Health check script failed', {
      error: error.message || error.error,
      responseTime: error.responseTime
    });
  }
}

/**
 * Start monitoring
 */
function startMonitoring() {
  console.log('🔍 Starting health monitoring...');
  console.log(\`Health check URL: \${config.healthCheckUrl}\`);
  console.log(\`Check interval: \${config.checkInterval / 1000 / 60} minutes\`);
  console.log(\`Log file: \${config.logFile}\`);
  console.log('');
  
  // Run initial check
  checkHealth();
  
  // Schedule periodic checks
  setInterval(checkHealth, config.checkInterval);
  
  console.log('✓ Monitoring started successfully');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Stopping health monitoring...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Stopping health monitoring...');
  process.exit(0);
});

// Start monitoring if this script is run directly
if (require.main === module) {
  startMonitoring();
}

module.exports = { checkHealth, startMonitoring };
`;
  
  fs.writeFileSync(path.join(monitoringDir, 'health-check.js'), healthCheckScript);
  logSuccess('Created health check script');
  
  // Create Docker monitoring script
  const dockerMonitoringScript = `#!/bin/bash

# Docker-based Health Monitoring
# Runs health checks in a lightweight container

HEALTH_CHECK_URL="${monitoringConfig.healthCheckUrl}/api/health"
CHECK_INTERVAL=${monitoringConfig.checkInterval}

echo "🐳 Starting Docker-based health monitoring..."
echo "Health check URL: $HEALTH_CHECK_URL"
echo "Check interval: $CHECK_INTERVAL minutes"

# Function to check health
check_health() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    echo "[$timestamp] Running health check..."
    
    # Make health check request
    local response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$HEALTH_CHECK_URL" || echo "000")
    local http_code="${response: -3}"
    
    if [ "$http_code" != "200" ]; then
        echo "❌ Health check failed with HTTP $http_code"
        # Send alert (implement your preferred method)
        return 1
    fi
    
    # Parse response
    local status=$(cat /tmp/health_response.json | jq -r '.status // "unknown"')
    local memory_percentage=$(cat /tmp/health_response.json | jq -r '.memory.percentage // 0')
    
    if [ "$status" != "healthy" ]; then
        echo "❌ Application status: $status"
        return 1
    fi
    
    if [ "$memory_percentage" -gt 80 ]; then
        echo "⚠️  High memory usage: ${memory_percentage}%"
    fi
    
    echo "✅ Health check passed (Memory: ${memory_percentage}%)"
    return 0
}

# Main monitoring loop
while true; do
    check_health
    sleep $((CHECK_INTERVAL * 60))
done
`;
  
  fs.writeFileSync(path.join(monitoringDir, 'docker-health-check.sh'), dockerMonitoringScript);
  fs.chmodSync(path.join(monitoringDir, 'docker-health-check.sh'), '755');
  logSuccess('Created Docker health check script');
  
  // Create systemd service file
  const systemdService = `[Unit]
Description=Thai Document Generator Health Monitor
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=${process.cwd()}/monitoring
ExecStart=/usr/bin/node health-check.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`;
  
  fs.writeFileSync(path.join(monitoringDir, 'thai-doc-monitor.service'), systemdService);
  logSuccess('Created systemd service file');
}

/**
 * Create monitoring dashboard
 */
function createMonitoringDashboard() {
  logStep('2', 'Creating monitoring dashboard...');
  
  const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thai Document Generator - Monitoring Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-subtitle {
            font-size: 14px;
            color: #888;
        }
        .status-healthy { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-critical { color: #dc3545; }
        .progress-bar {
            width: 100%;
            height: 8px;
            background-color: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 10px;
        }
        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        .progress-healthy { background-color: #28a745; }
        .progress-warning { background-color: #ffc107; }
        .progress-critical { background-color: #dc3545; }
        .refresh-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .refresh-btn:hover {
            background: #0056b3;
        }
        .last-updated {
            color: #666;
            font-size: 12px;
            margin-left: 10px;
        }
        .alerts {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .alert {
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
            border-left: 4px solid;
        }
        .alert-warning {
            background-color: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .alert-critical {
            background-color: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thai Document Generator - Monitoring Dashboard</h1>
            <button class="refresh-btn" onclick="refreshData()">Refresh</button>
            <span class="last-updated" id="lastUpdated">Last updated: Never</span>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">Application Status</div>
                <div class="metric-value status-healthy" id="appStatus">Loading...</div>
                <div class="metric-subtitle" id="appStatusDetails">Checking health...</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Memory Usage</div>
                <div class="metric-value" id="memoryUsage">--%</div>
                <div class="metric-subtitle" id="memoryDetails">-- MB / -- MB</div>
                <div class="progress-bar">
                    <div class="progress-fill progress-healthy" id="memoryProgress" style="width: 0%"></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Storage Usage</div>
                <div class="metric-value" id="storageUsage">--%</div>
                <div class="metric-subtitle" id="storageDetails">-- MB / -- MB</div>
                <div class="progress-bar">
                    <div class="progress-fill progress-healthy" id="storageProgress" style="width: 0%"></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Response Time</div>
                <div class="metric-value" id="responseTime">-- ms</div>
                <div class="metric-subtitle">Average response time</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Uptime</div>
                <div class="metric-value" id="uptime">-- hours</div>
                <div class="metric-subtitle">Since last restart</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Platform</div>
                <div class="metric-value" id="platform">Unknown</div>
                <div class="metric-subtitle" id="platformDetails">Free tier status</div>
            </div>
        </div>
        
        <div class="alerts">
            <h3>Active Alerts</h3>
            <div id="alertsContainer">
                <p>No alerts at this time.</p>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = '${monitoringConfig.healthCheckUrl}';
        
        async function fetchHealthData() {
            try {
                const response = await fetch(\`\${API_BASE}/api/health\`);
                return await response.json();
            } catch (error) {
                console.error('Failed to fetch health data:', error);
                return null;
            }
        }
        
        async function fetchMonitoringData() {
            try {
                const response = await fetch(\`\${API_BASE}/api/monitoring?type=overview\`);
                return await response.json();
            } catch (error) {
                console.error('Failed to fetch monitoring data:', error);
                return null;
            }
        }
        
        function updateUI(healthData, monitoringData) {
            // Update application status
            if (healthData) {
                const statusElement = document.getElementById('appStatus');
                const statusDetailsElement = document.getElementById('appStatusDetails');
                
                if (healthData.status === 'healthy') {
                    statusElement.textContent = 'Healthy';
                    statusElement.className = 'metric-value status-healthy';
                    statusDetailsElement.textContent = 'All systems operational';
                } else {
                    statusElement.textContent = 'Unhealthy';
                    statusElement.className = 'metric-value status-critical';
                    statusDetailsElement.textContent = 'Issues detected';
                }
                
                // Update memory usage
                if (healthData.memory) {
                    document.getElementById('memoryUsage').textContent = \`\${healthData.memory.percentage}%\`;
                    document.getElementById('memoryDetails').textContent = \`\${healthData.memory.used} MB / \${healthData.memory.total} MB\`;
                    
                    const memoryProgress = document.getElementById('memoryProgress');
                    memoryProgress.style.width = \`\${healthData.memory.percentage}%\`;
                    
                    if (healthData.memory.percentage > 80) {
                        memoryProgress.className = 'progress-fill progress-critical';
                    } else if (healthData.memory.percentage > 60) {
                        memoryProgress.className = 'progress-fill progress-warning';
                    } else {
                        memoryProgress.className = 'progress-fill progress-healthy';
                    }
                }
                
                // Update uptime
                if (healthData.uptime) {
                    const hours = Math.floor(healthData.uptime / 3600);
                    document.getElementById('uptime').textContent = \`\${hours} hours\`;
                }
                
                // Update platform info
                if (healthData.freeTier) {
                    document.getElementById('platform').textContent = healthData.freeTier.platform;
                    document.getElementById('platformDetails').textContent = 'Free tier active';
                }
            }
            
            // Update monitoring data
            if (monitoringData) {
                // Update storage usage
                if (monitoringData.storage) {
                    document.getElementById('storageUsage').textContent = \`\${monitoringData.storage.percentage}%\`;
                    document.getElementById('storageDetails').textContent = \`\${monitoringData.storage.used} MB / \${monitoringData.storage.total} MB\`;
                    
                    const storageProgress = document.getElementById('storageProgress');
                    storageProgress.style.width = \`\${monitoringData.storage.percentage}%\`;
                    
                    if (monitoringData.storage.percentage > 85) {
                        storageProgress.className = 'progress-fill progress-critical';
                    } else if (monitoringData.storage.percentage > 70) {
                        storageProgress.className = 'progress-fill progress-warning';
                    } else {
                        storageProgress.className = 'progress-fill progress-healthy';
                    }
                }
                
                // Update response time
                if (monitoringData.performance && monitoringData.performance.averageResponseTime) {
                    document.getElementById('responseTime').textContent = \`\${monitoringData.performance.averageResponseTime} ms\`;
                }
            }
            
            // Update alerts
            updateAlerts(healthData, monitoringData);
            
            // Update last updated time
            document.getElementById('lastUpdated').textContent = \`Last updated: \${new Date().toLocaleTimeString()}\`;
        }
        
        function updateAlerts(healthData, monitoringData) {
            const alertsContainer = document.getElementById('alertsContainer');
            const alerts = [];
            
            // Check for health alerts
            if (healthData && healthData.freeTier && healthData.freeTier.warnings) {
                healthData.freeTier.warnings.forEach(warning => {
                    alerts.push({ type: 'warning', message: warning });
                });
            }
            
            // Check for memory alerts
            if (healthData && healthData.memory && healthData.memory.percentage > 80) {
                alerts.push({
                    type: healthData.memory.percentage > 90 ? 'critical' : 'warning',
                    message: \`High memory usage: \${healthData.memory.percentage}%\`
                });
            }
            
            // Check for storage alerts
            if (monitoringData && monitoringData.storage && monitoringData.storage.percentage > 80) {
                alerts.push({
                    type: monitoringData.storage.percentage > 90 ? 'critical' : 'warning',
                    message: \`High storage usage: \${monitoringData.storage.percentage}%\`
                });
            }
            
            if (alerts.length === 0) {
                alertsContainer.innerHTML = '<p>No alerts at this time.</p>';
            } else {
                alertsContainer.innerHTML = alerts.map(alert => 
                    \`<div class="alert alert-\${alert.type}">\${alert.message}</div>\`
                ).join('');
            }
        }
        
        async function refreshData() {
            const refreshBtn = document.querySelector('.refresh-btn');
            refreshBtn.textContent = 'Refreshing...';
            refreshBtn.disabled = true;
            
            try {
                const [healthData, monitoringData] = await Promise.all([
                    fetchHealthData(),
                    fetchMonitoringData()
                ]);
                
                updateUI(healthData, monitoringData);
            } catch (error) {
                console.error('Failed to refresh data:', error);
            } finally {
                refreshBtn.textContent = 'Refresh';
                refreshBtn.disabled = false;
            }
        }
        
        // Auto-refresh every 30 seconds
        setInterval(refreshData, 30000);
        
        // Initial load
        refreshData();
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(process.cwd(), 'monitoring', 'dashboard.html'), dashboardHtml);
  logSuccess('Created monitoring dashboard');
}

/**
 * Create UptimeRobot configuration
 */
function createUptimeRobotConfig() {
  logStep('3', 'Creating UptimeRobot configuration...');
  
  const uptimeRobotConfig = {
    monitors: [
      {
        friendly_name: "Thai Doc Generator - Health Check",
        url: `${monitoringConfig.healthCheckUrl}/api/health`,
        type: 1, // HTTP(s)
        interval: 300, // 5 minutes
        timeout: 30,
        keyword_type: 1, // exists
        keyword_value: "healthy"
      },
      {
        friendly_name: "Thai Doc Generator - Main Page",
        url: monitoringConfig.healthCheckUrl,
        type: 1, // HTTP(s)
        interval: 300, // 5 minutes
        timeout: 30
      }
    ],
    alert_contacts: [
      {
        type: 2, // Email
        value: monitoringConfig.alertEmail,
        friendly_name: "Admin Email"
      }
    ],
    notification_settings: {
      email_on_up: true,
      email_on_down: true,
      email_on_keyword: true
    }
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'monitoring', 'uptimerobot-config.json'),
    JSON.stringify(uptimeRobotConfig, null, 2)
  );
  
  logSuccess('Created UptimeRobot configuration');
  
  // Create setup instructions
  const setupInstructions = `# UptimeRobot Setup Instructions

## 1. Create UptimeRobot Account
- Go to https://uptimerobot.com
- Sign up for free account (50 monitors included)

## 2. Create Monitors

### Health Check Monitor
- Monitor Type: HTTP(s)
- Friendly Name: Thai Doc Generator - Health Check
- URL: ${monitoringConfig.healthCheckUrl}/api/health
- Monitoring Interval: 5 minutes
- Timeout: 30 seconds
- Keyword Monitoring: "healthy" (should exist)

### Main Page Monitor
- Monitor Type: HTTP(s)
- Friendly Name: Thai Doc Generator - Main Page
- URL: ${monitoringConfig.healthCheckUrl}
- Monitoring Interval: 5 minutes
- Timeout: 30 seconds

## 3. Set Up Alert Contacts
- Add email: ${monitoringConfig.alertEmail}
- Configure notification preferences:
  - ✅ Send notification when monitor goes UP
  - ✅ Send notification when monitor goes DOWN
  - ✅ Send notification when keyword check fails

## 4. Optional: Slack Integration
${monitoringConfig.slackWebhook ? `
- Add Slack webhook: ${monitoringConfig.slackWebhook}
- Configure Slack notifications for team alerts
` : `
- Set SLACK_WEBHOOK_URL environment variable
- Add Slack integration in UptimeRobot dashboard
`}

## 5. API Integration (Optional)
${monitoringConfig.platforms.uptimeRobot.apiKey ? `
- API Key configured: ${monitoringConfig.platforms.uptimeRobot.apiKey.substring(0, 8)}...
- Use the provided configuration file to set up monitors via API
` : `
- Get API key from UptimeRobot dashboard
- Set UPTIMEROBOT_API_KEY environment variable
- Use API to programmatically create monitors
`}

## Configuration File
The configuration has been saved to: monitoring/uptimerobot-config.json
Use this file with the UptimeRobot API to automatically create monitors.
`;
  
  fs.writeFileSync(
    path.join(process.cwd(), 'monitoring', 'uptimerobot-setup.md'),
    setupInstructions
  );
  
  logSuccess('Created UptimeRobot setup instructions');
}

/**
 * Create Pingdom configuration
 */
function createPingdomConfig() {
  logStep('4', 'Creating Pingdom configuration...');
  
  const pingdomConfig = {
    checks: [
      {
        name: "Thai Document Generator",
        hostname: monitoringConfig.healthCheckUrl.replace(/^https?:\/\//, ''),
        type: "http",
        paused: false,
        resolution: 1, // 1 minute
        sendnotificationwhendown: 2, // After 2 failed checks
        notifyagainevery: 0, // Don't repeat notifications
        notifywhenbackup: true,
        tags: ["production", "thai-doc-generator"],
        probe_filters: ["region:NA"], // North America
        custom_message: "Thai Document Generator is down"
      }
    ],
    integrations: [
      {
        provider_name: "email",
        active: true
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'monitoring', 'pingdom-config.json'),
    JSON.stringify(pingdomConfig, null, 2)
  );
  
  logSuccess('Created Pingdom configuration');
  
  // Create Pingdom setup instructions
  const pingdomInstructions = `# Pingdom Setup Instructions

## 1. Create Pingdom Account
- Go to https://www.pingdom.com
- Sign up for free account (1 monitor included)

## 2. Create Uptime Check
- Check Name: Thai Document Generator
- URL: ${monitoringConfig.healthCheckUrl}
- Check Interval: 1 minute
- Timeout: 30 seconds
- Locations: Select multiple global locations

## 3. Configure Alerting
- Email: ${monitoringConfig.alertEmail}
- Send alert after: 2 consecutive failed checks
- Send recovery notification: Yes

## 4. Optional Features (Paid Plans)
- Real User Monitoring (RUM)
- Page Speed Monitoring
- Transaction Monitoring
- Multiple check locations

## 5. Integration Options
- Slack integration available
- PagerDuty integration
- Webhook notifications
- Mobile app notifications

## Configuration File
The configuration has been saved to: monitoring/pingdom-config.json
Use this file reference when setting up checks manually.
`;
  
  fs.writeFileSync(
    path.join(process.cwd(), 'monitoring', 'pingdom-setup.md'),
    pingdomInstructions
  );
  
  logSuccess('Created Pingdom setup instructions');
}

/**
 * Create monitoring documentation
 */
function createMonitoringDocs() {
  logStep('5', 'Creating monitoring documentation...');
  
  const monitoringDocs = `# Free Tier Monitoring Setup

This directory contains monitoring tools and configurations for the Thai Document Generator application.

## Files Overview

- \`health-check.js\` - Node.js health monitoring script
- \`docker-health-check.sh\` - Docker-based health monitoring
- \`thai-doc-monitor.service\` - Systemd service configuration
- \`dashboard.html\` - Simple monitoring dashboard
- \`uptimerobot-config.json\` - UptimeRobot configuration
- \`pingdom-config.json\` - Pingdom configuration

## Quick Start

### 1. Local Health Monitoring
\`\`\`bash
# Run health check script
cd monitoring
node health-check.js
\`\`\`

### 2. Docker Health Monitoring
\`\`\`bash
# Run in Docker container
docker run -d --name health-monitor \\
  -v \$(pwd)/monitoring:/app \\
  node:18-alpine \\
  sh -c "cd /app && node health-check.js"
\`\`\`

### 3. Systemd Service (Linux)
\`\`\`bash
# Install service
sudo cp monitoring/thai-doc-monitor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable thai-doc-monitor
sudo systemctl start thai-doc-monitor

# Check status
sudo systemctl status thai-doc-monitor
\`\`\`

### 4. View Dashboard
Open \`monitoring/dashboard.html\` in your browser for a simple monitoring dashboard.

## External Monitoring Services

### UptimeRobot (Recommended)
- **Free Tier**: 50 monitors, 5-minute intervals
- **Setup**: Follow instructions in \`uptimerobot-setup.md\`
- **Features**: Email alerts, keyword monitoring, status pages

### Pingdom
- **Free Tier**: 1 monitor, 1-minute intervals
- **Setup**: Follow instructions in \`pingdom-setup.md\`
- **Features**: Global monitoring, performance insights

### Better Uptime
- **Free Tier**: 10 monitors, status pages
- **Website**: https://betteruptime.com
- **Features**: Incident management, team collaboration

## Configuration

### Environment Variables
\`\`\`bash
# Required
NEXT_PUBLIC_APP_URL=https://your-app.com

# Optional
ALERT_EMAIL=admin@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
UPTIMEROBOT_API_KEY=your-api-key
PINGDOM_API_KEY=your-api-key
\`\`\`

### Alert Thresholds
- Memory usage > 80% (warning), > 90% (critical)
- Storage usage > 85% (warning), > 95% (critical)
- Response time > 10 seconds (warning)
- Error rate > 5% (warning)

## Monitoring Endpoints

### Health Check
\`\`\`
GET /api/health
\`\`\`
Returns application health status and resource usage.

### Detailed Monitoring
\`\`\`
GET /api/monitoring?type=overview
\`\`\`
Returns comprehensive monitoring data including storage, performance, and error metrics.

## Troubleshooting

### Health Check Script Issues
1. Check Node.js version (requires 14+)
2. Verify network connectivity to application
3. Check environment variables
4. Review log file for errors

### External Service Issues
1. Verify API keys and credentials
2. Check service status pages
3. Review notification settings
4. Test webhook URLs

## Maintenance

### Daily Tasks
- Review health check logs
- Check for new alerts
- Verify monitoring services are active

### Weekly Tasks
- Review monitoring data trends
- Update alert thresholds if needed
- Test notification channels

### Monthly Tasks
- Review and update monitoring configurations
- Check for service updates
- Analyze performance trends

## Support

For issues with:
- **Application monitoring**: Check application logs and health endpoints
- **UptimeRobot**: Visit https://uptimerobot.com/support
- **Pingdom**: Visit https://help.pingdom.com
- **Script issues**: Review Node.js and system logs

---

**Note**: Free tier monitoring services have limitations. Consider upgrading to paid plans for production applications with higher availability requirements.
`;
  
  fs.writeFileSync(
    path.join(process.cwd(), 'monitoring', 'README.md'),
    monitoringDocs
  );
  
  logSuccess('Created monitoring documentation');
}

/**
 * Main setup function
 */
function main() {
  log('🔍 Setting up free tier monitoring for Thai Document Generator', colors.cyan);
  log('================================================================', colors.cyan);
  
  try {
    createMonitoringConfigs();
    createMonitoringDashboard();
    createUptimeRobotConfig();
    createPingdomConfig();
    createMonitoringDocs();
    
    log('\n✅ Monitoring setup completed successfully!', colors.green);
    log('\nNext steps:', colors.blue);
    log('1. Configure environment variables (NEXT_PUBLIC_APP_URL, ALERT_EMAIL)', colors.yellow);
    log('2. Set up external monitoring services (UptimeRobot, Pingdom)', colors.yellow);
    log('3. Start local health monitoring: cd monitoring && node health-check.js', colors.yellow);
    log('4. Open monitoring dashboard: monitoring/dashboard.html', colors.yellow);
    log('\nFor detailed instructions, see: monitoring/README.md', colors.cyan);
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  createMonitoringConfigs,
  createMonitoringDashboard,
  createUptimeRobotConfig,
  createPingdomConfig
};