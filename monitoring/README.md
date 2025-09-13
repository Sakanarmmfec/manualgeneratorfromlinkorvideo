# Monitoring Setup for Thai Document Generator

This directory contains monitoring tools and configurations for the Thai Document Generator application running on free hosting platforms.

## Quick Setup

### 1. Run Monitoring Setup Script
```bash
# From project root
node scripts/setup-monitoring.js

# This creates all monitoring files and configurations
```

### 2. Configure Environment Variables
```bash
# Required
export NEXT_PUBLIC_APP_URL=https://your-app.com

# Optional (for enhanced monitoring)
export ALERT_EMAIL=admin@example.com
export SLACK_WEBHOOK_URL=https://hooks.slack.com/...
export UPTIMEROBOT_API_KEY=your-api-key
```

### 3. Start Local Health Monitoring
```bash
cd monitoring
node health-check.js
```

### 4. View Monitoring Dashboard
Open `monitoring/dashboard.html` in your browser for real-time monitoring.

## Files Overview

| File | Purpose | Usage |
|------|---------|-------|
| `health-check.js` | Node.js health monitoring script | `node health-check.js` |
| `docker-health-check.sh` | Docker-based health monitoring | `./docker-health-check.sh` |
| `thai-doc-monitor.service` | Systemd service configuration | Linux service setup |
| `dashboard.html` | Simple monitoring dashboard | Open in browser |
| `uptimerobot-config.json` | UptimeRobot configuration | External monitoring setup |
| `pingdom-config.json` | Pingdom configuration | External monitoring setup |
| `uptimerobot-setup.md` | UptimeRobot setup guide | Follow instructions |
| `pingdom-setup.md` | Pingdom setup guide | Follow instructions |

## Monitoring Options

### 1. Local Health Monitoring

**Node.js Script:**
```bash
# Start monitoring
cd monitoring
node health-check.js

# Features:
# - Periodic health checks (5-minute intervals)
# - Resource usage monitoring
# - Alert notifications
# - Log file generation
```

**Docker Container:**
```bash
# Run in Docker
docker run -d --name health-monitor \
  -v $(pwd)/monitoring:/app \
  -e HEALTH_CHECK_URL=https://your-app.com \
  node:18-alpine \
  sh -c "cd /app && node health-check.js"
```

**Linux Service (systemd):**
```bash
# Install service
sudo cp monitoring/thai-doc-monitor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable thai-doc-monitor
sudo systemctl start thai-doc-monitor

# Check status
sudo systemctl status thai-doc-monitor
sudo journalctl -u thai-doc-monitor -f
```

### 2. External Monitoring Services

#### UptimeRobot (Recommended)
- **Free Tier**: 50 monitors, 5-minute intervals
- **Features**: Email alerts, keyword monitoring, status pages
- **Setup**: Follow `uptimerobot-setup.md`

```bash
# Monitors to create:
1. Health Check: https://your-app.com/api/health (keyword: "healthy")
2. Main Page: https://your-app.com (HTTP status check)
```

#### Pingdom
- **Free Tier**: 1 monitor, 1-minute intervals
- **Features**: Global monitoring, performance insights
- **Setup**: Follow `pingdom-setup.md`

#### Better Uptime
- **Free Tier**: 10 monitors, status pages
- **Website**: https://betteruptime.com
- **Features**: Incident management, team collaboration

### 3. Monitoring Dashboard

The included dashboard (`dashboard.html`) provides:
- Real-time health status
- Memory and storage usage
- Response time monitoring
- Active alerts display
- Auto-refresh every 30 seconds

**Features:**
- No external dependencies
- Works offline
- Mobile-responsive
- Real-time updates

## Alert Configuration

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Memory Usage | > 75% | > 90% |
| Storage Usage | > 80% | > 95% |
| Response Time | > 5 seconds | > 10 seconds |
| Error Rate | > 5% | > 10% |

### Notification Channels

1. **Email Alerts**
   - Configure `ALERT_EMAIL` environment variable
   - Supports multiple recipients (comma-separated)

2. **Slack Notifications**
   - Configure `SLACK_WEBHOOK_URL` environment variable
   - Rich formatting with alert details

3. **Log Files**
   - All alerts logged to `health-check.log`
   - Structured JSON format for parsing

## Monitoring Endpoints

### Application Health
```bash
GET /api/health
```
Returns comprehensive health status including:
- Overall application status
- Individual component checks (LLM, filesystem, configuration)
- Memory usage statistics
- Free tier warnings
- Uptime information

### Detailed Monitoring
```bash
GET /api/monitoring?type=overview
GET /api/monitoring?type=storage
GET /api/monitoring?type=memory
GET /api/monitoring?type=errors
```
Returns detailed metrics for specific areas.

## Platform-Specific Monitoring

### Railway
```bash
# Built-in monitoring
railway logs --follow
railway metrics
railway status

# Resource usage
railway ps
```

### Render
- Dashboard provides build logs and metrics
- Service logs available in real-time
- Resource usage graphs
- Automatic sleep/wake monitoring

### Vercel
```bash
# Function logs
vercel logs your-deployment-url

# Analytics in dashboard
# Function performance metrics
# Error tracking
```

## Troubleshooting

### Common Issues

1. **Health Check Script Not Starting**
   ```bash
   # Check Node.js version
   node --version  # Should be 14+
   
   # Check dependencies
   npm install
   
   # Check permissions
   ls -la monitoring/health-check.js
   ```

2. **Cannot Connect to Application**
   ```bash
   # Test connectivity
   curl -I https://your-app.com/api/health
   
   # Check DNS resolution
   nslookup your-app.com
   
   # Test from different network
   ```

3. **Alerts Not Working**
   ```bash
   # Check environment variables
   echo $ALERT_EMAIL
   echo $SLACK_WEBHOOK_URL
   
   # Test webhook manually
   curl -X POST $SLACK_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"text": "Test alert"}'
   ```

4. **High Resource Usage Alerts**
   ```bash
   # Check actual usage
   curl https://your-app.com/api/monitoring?type=overview
   
   # Review application logs
   # Check for memory leaks
   # Verify cleanup processes
   ```

### Debug Mode

Enable debug logging:
```bash
# Set debug environment variable
export DEBUG=monitoring:*

# Run with verbose output
node health-check.js
```

## Maintenance

### Daily Tasks
- [ ] Review health check logs
- [ ] Check for new alerts
- [ ] Verify monitoring services are active
- [ ] Test core application functionality

### Weekly Tasks
- [ ] Review monitoring data trends
- [ ] Update alert thresholds if needed
- [ ] Test notification channels
- [ ] Clean up old log files

### Monthly Tasks
- [ ] Review and update monitoring configurations
- [ ] Check for monitoring service updates
- [ ] Analyze performance trends
- [ ] Update documentation

## Advanced Configuration

### Custom Alert Rules

Modify `health-check.js` to add custom alert conditions:

```javascript
// Custom alert example
if (healthData.customMetric > threshold) {
  await sendAlert('CUSTOM', 'Custom condition met', {
    metric: healthData.customMetric,
    threshold: threshold
  });
}
```

### Integration with CI/CD

Add monitoring validation to your deployment pipeline:

```yaml
# GitHub Actions example
- name: Validate Deployment
  run: |
    # Wait for deployment to be ready
    sleep 30
    
    # Run health check
    curl -f https://your-app.com/api/health
    
    # Run monitoring validation
    node monitoring/health-check.js --validate-only
```

### Scaling Monitoring

For multiple environments:

```bash
# Development
HEALTH_CHECK_URL=https://dev-app.com node health-check.js

# Staging
HEALTH_CHECK_URL=https://staging-app.com node health-check.js

# Production
HEALTH_CHECK_URL=https://app.com node health-check.js
```

## Support

### Internal Support
1. Check monitoring logs: `monitoring/health-check.log`
2. Review application health: `/api/health`
3. Check detailed metrics: `/api/monitoring`
4. Consult troubleshooting guides in `/docs/`

### External Support
- **UptimeRobot**: https://uptimerobot.com/support
- **Pingdom**: https://help.pingdom.com
- **Better Uptime**: https://betteruptime.com/help

### Emergency Contacts
- Application maintainer: [contact info]
- System administrator: [contact info]
- Platform support: [platform-specific contacts]

---

**Note**: This monitoring setup is optimized for free tier hosting. For production applications with higher availability requirements, consider upgrading to paid monitoring services with more features and better SLAs.