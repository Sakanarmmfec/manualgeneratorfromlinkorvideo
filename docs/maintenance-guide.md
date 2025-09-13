# Maintenance Guide for Thai Document Generator

This guide provides comprehensive maintenance procedures for keeping the Thai Document Generator running smoothly on free hosting platforms.

## Daily Maintenance Tasks

### 1. Health Check Monitoring

**Frequency**: Every morning (automated recommended)

```bash
# Check application health
curl https://your-app.com/api/health | jq '.'

# Expected healthy response:
{
  "status": "healthy",
  "checks": {
    "llm": "pass",
    "filesystem": "pass",
    "configuration": "pass"
  },
  "memory": {
    "percentage": 45
  },
  "freeTier": {
    "warnings": []
  }
}
```

**Action Items**:
- ✅ Status is "healthy"
- ✅ All checks show "pass"
- ✅ Memory usage < 75%
- ✅ No free tier warnings

**If Issues Found**:
```bash
# Check detailed monitoring
curl https://your-app.com/api/monitoring?type=overview

# Review platform logs
# Railway:
railway logs --tail 50

# Render: Check dashboard logs
# Vercel: Check function logs in dashboard
```

### 2. Resource Usage Review

**Check Storage Usage**:
```bash
# Monitor storage via API
curl https://your-app.com/api/monitoring?type=storage | jq '.storage'

# Expected response:
{
  "used": 150,
  "total": 1024,
  "percentage": 14.6,
  "files": 25,
  "oldestFile": "2024-01-10T10:30:00.000Z"
}
```

**Action Items**:
- ✅ Storage usage < 80%
- ✅ No files older than 7 days (unless intentional)
- ✅ File count reasonable for usage

**If Storage High**:
```bash
# Trigger manual cleanup
curl -X POST https://your-app.com/api/monitoring \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup_storage"}'
```

### 3. Error Rate Monitoring

**Check Error Logs**:
```bash
# Review recent errors
curl https://your-app.com/api/logs?level=error&hours=24

# Check error rate
curl https://your-app.com/api/monitoring?type=errors
```

**Acceptable Thresholds**:
- Error rate < 5%
- No critical errors in last 24 hours
- Response time < 10 seconds average

## Weekly Maintenance Tasks

### 1. Comprehensive System Review

**Performance Analysis**:
```bash
# Get weekly performance summary
curl https://your-app.com/api/monitoring?type=weekly-summary

# Review key metrics:
# - Average response time
# - Memory usage trends
# - Storage growth rate
# - Error patterns
# - User activity levels
```

**Platform-Specific Checks**:

#### Railway
```bash
# Check service metrics
railway status
railway metrics

# Review resource usage
railway logs --since 7d | grep -i "memory\|error\|warning"
```

#### Render
- Review service dashboard for the past week
- Check build history for failures
- Monitor bandwidth usage (100GB/month limit)
- Review sleep/wake patterns

#### Vercel
- Check function execution metrics
- Review build usage (6000 seconds/month limit)
- Monitor bandwidth consumption
- Check for function timeout issues

### 2. Security Review

**API Key Validation**:
```bash
# Test MFEC API connectivity
curl -X POST https://your-app.com/api/test-llm-connection

# Expected response:
{
  "status": "success",
  "connection": "healthy",
  "quota": {
    "used": 45,
    "limit": 100,
    "percentage": 45
  }
}
```

**Environment Security**:
- ✅ No API keys in logs
- ✅ HTTPS enforced
- ✅ Security headers present
- ✅ Rate limiting functional

**Security Test**:
```bash
# Test rate limiting
for i in {1..20}; do
  curl -w "%{http_code}\n" https://your-app.com/api/health
done
# Should see 429 (Too Many Requests) after limit reached
```

### 3. Dependency Updates

**Check for Updates**:
```bash
# Check for security vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Review critical updates only for production
npm audit --audit-level=high
```

**Update Strategy**:
- **Critical Security**: Update immediately
- **High Priority**: Update within 1 week
- **Medium Priority**: Update monthly
- **Low Priority**: Update quarterly

### 4. Backup Verification

**Configuration Backup**:
```bash
# Backup environment configuration
# (Store securely, exclude sensitive values)

# Backup deployment configuration
cp railway.toml railway.toml.backup
cp render.yaml render.yaml.backup
cp vercel.json vercel.json.backup
```

**Document Templates Backup**:
```bash
# Ensure MFEC templates are backed up
ls -la .qodo/Template/
# Should include:
# - MFEC_System&User_Manual_Template.docx
# - ENG_MFEC Brand Guideline.pdf
# - Logo files
```

## Monthly Maintenance Tasks

### 1. Comprehensive Performance Review

**Generate Monthly Report**:
```bash
# Get monthly statistics
curl https://your-app.com/api/monitoring?type=monthly-report

# Key metrics to review:
# - Total documents generated
# - Average processing time
# - Peak usage periods
# - Error trends
# - Resource utilization patterns
```

**Performance Optimization**:
- Review slow queries/operations
- Analyze memory usage patterns
- Identify optimization opportunities
- Plan capacity requirements

### 2. Platform Limits Review

**Usage Analysis**:

#### Railway ($5/month credit)
```bash
# Check current month usage
railway usage

# Monitor approaching limits:
# - Build minutes
# - Bandwidth
# - Storage
```

#### Render (Free tier limits)
```bash
# Check build minutes used (500/month limit)
# Review bandwidth usage (100GB/month limit)
# Monitor service uptime patterns
```

#### Vercel (Free tier limits)
```bash
# Check function execution time (6000 seconds/month)
# Review bandwidth usage (100GB/month)
# Monitor build frequency
```

### 3. Security Audit

**Comprehensive Security Check**:
```bash
# Run security audit
npm audit --audit-level=moderate

# Check for exposed secrets
git log --all --full-history -- "*.env*"
# Should return no results

# Verify HTTPS configuration
curl -I https://your-app.com | grep -i "strict-transport-security"
```

**Access Review**:
- Review admin user list
- Validate API key rotation schedule
- Check authentication logs
- Verify rate limiting effectiveness

### 4. Documentation Updates

**Update Documentation**:
- Review and update deployment guides
- Update troubleshooting procedures
- Document any configuration changes
- Update maintenance procedures

**Version Documentation**:
```bash
# Document current versions
echo "Application Version: $(git describe --tags)" > docs/current-version.md
echo "Node.js Version: $(node --version)" >> docs/current-version.md
echo "Platform Versions:" >> docs/current-version.md
railway --version >> docs/current-version.md 2>/dev/null || echo "Railway CLI not available"
vercel --version >> docs/current-version.md 2>/dev/null || echo "Vercel CLI not available"
```

## Quarterly Maintenance Tasks

### 1. Major Version Updates

**Dependency Upgrades**:
```bash
# Major framework updates (test thoroughly)
npm update

# Update Docker base images
# Update in Dockerfile:
FROM node:18-alpine  # Update to latest LTS

# Test in staging environment first
```

**Platform Updates**:
- Review new platform features
- Update deployment configurations
- Test new optimization options
- Plan migration strategies if needed

### 2. Capacity Planning

**Growth Analysis**:
```bash
# Analyze 3-month trends
curl https://your-app.com/api/monitoring?type=quarterly-analysis

# Key metrics:
# - User growth rate
# - Document generation trends
# - Resource usage growth
# - Performance degradation patterns
```

**Scaling Decisions**:
- Evaluate free tier sustainability
- Plan upgrade timeline if needed
- Research alternative platforms
- Budget for scaling costs

### 3. Disaster Recovery Testing

**Backup Testing**:
```bash
# Test configuration restoration
# Test deployment from scratch
# Verify data recovery procedures
# Test failover scenarios
```

**Recovery Procedures**:
1. **Complete Platform Failure**:
   - Deploy to alternative platform
   - Restore configuration
   - Update DNS if needed
   - Verify functionality

2. **Data Loss Scenario**:
   - Restore from backups
   - Regenerate lost documents
   - Verify data integrity

### 4. Security Hardening

**Annual Security Review**:
- Update all API keys
- Review access permissions
- Audit security configurations
- Update security documentation
- Test incident response procedures

## Automated Maintenance

### 1. Health Check Automation

**Setup Monitoring Script**:
```javascript
// maintenance-automation.js
const schedule = require('node-schedule');
const axios = require('axios');

// Daily health check at 9 AM
schedule.scheduleJob('0 9 * * *', async () => {
  try {
    const health = await axios.get('https://your-app.com/api/health');
    
    if (health.data.status !== 'healthy') {
      await sendAlert('Daily Health Check Failed', health.data);
    }
    
    // Check resource usage
    const monitoring = await axios.get('https://your-app.com/api/monitoring?type=overview');
    
    if (monitoring.data.memory.percentage > 80) {
      await sendAlert('High Memory Usage Detected', monitoring.data);
    }
    
    if (monitoring.data.storage.percentage > 85) {
      await sendAlert('High Storage Usage Detected', monitoring.data);
    }
    
  } catch (error) {
    await sendAlert('Health Check Script Failed', { error: error.message });
  }
});

// Weekly cleanup on Sundays at 2 AM
schedule.scheduleJob('0 2 * * 0', async () => {
  try {
    await axios.post('https://your-app.com/api/monitoring', {
      action: 'weekly_cleanup'
    });
    
    console.log('Weekly cleanup completed');
  } catch (error) {
    await sendAlert('Weekly Cleanup Failed', { error: error.message });
  }
});

async function sendAlert(subject, data) {
  // Implement your alerting mechanism
  // Email, Slack, Discord, etc.
  console.log(`ALERT: ${subject}`, data);
}
```

### 2. External Monitoring Setup

**UptimeRobot Configuration**:
```bash
# Health check monitor
URL: https://your-app.com/api/health
Method: GET
Interval: 5 minutes
Timeout: 30 seconds
Expected Status: 200
Keyword Monitoring: "healthy"

# Alert contacts:
# - Email for immediate issues
# - Slack for team notifications
# - SMS for critical failures
```

**Pingdom Setup**:
```bash
# Basic uptime monitoring
URL: https://your-app.com
Check Interval: 1 minute
Timeout: 30 seconds
Locations: Multiple global locations

# Performance monitoring
# - Response time tracking
# - Availability statistics
# - Performance insights
```

## Maintenance Checklists

### Daily Checklist
- [ ] Check application health endpoint
- [ ] Review error logs for new issues
- [ ] Monitor resource usage (memory/storage)
- [ ] Verify core functionality works
- [ ] Check for any user-reported issues

### Weekly Checklist
- [ ] Review platform-specific metrics
- [ ] Check security configurations
- [ ] Analyze performance trends
- [ ] Review and clean up old files
- [ ] Update documentation if needed
- [ ] Test backup procedures
- [ ] Review API usage and quotas

### Monthly Checklist
- [ ] Generate comprehensive performance report
- [ ] Review platform usage against limits
- [ ] Conduct security audit
- [ ] Update dependencies (security patches)
- [ ] Review and update documentation
- [ ] Plan capacity requirements
- [ ] Test disaster recovery procedures

### Quarterly Checklist
- [ ] Major dependency updates
- [ ] Platform feature review and updates
- [ ] Comprehensive capacity planning
- [ ] Security hardening review
- [ ] Disaster recovery testing
- [ ] Documentation comprehensive review
- [ ] Budget and scaling planning

## Emergency Procedures

### 1. Application Down

**Immediate Actions**:
```bash
# Check health endpoint
curl -I https://your-app.com/api/health

# Check platform status
# Railway: https://status.railway.app
# Render: https://status.render.com
# Vercel: https://vercel-status.com
```

**Recovery Steps**:
1. Check platform status pages
2. Review recent deployments
3. Check resource limits
4. Restart service if needed
5. Escalate to platform support

### 2. High Resource Usage

**Memory Issues**:
```bash
# Immediate restart
railway restart  # or platform equivalent

# Check for memory leaks
curl https://your-app.com/api/monitoring?type=memory

# Implement emergency limits
# Reduce concurrent processing
# Clear caches
# Enable aggressive cleanup
```

**Storage Issues**:
```bash
# Emergency cleanup
curl -X POST https://your-app.com/api/monitoring \
  -d '{"action": "emergency_cleanup"}'

# Manual cleanup if API unavailable
# Access platform shell and remove old files
```

### 3. Security Incident

**Immediate Actions**:
1. Rotate all API keys immediately
2. Check access logs for suspicious activity
3. Review recent configuration changes
4. Enable additional monitoring
5. Document incident details

**Recovery Steps**:
1. Assess scope of compromise
2. Update security configurations
3. Notify users if data affected
4. Implement additional security measures
5. Conduct post-incident review

## Support and Escalation

### Internal Support Levels

**Level 1**: Self-service using this guide
- Use troubleshooting procedures
- Check monitoring dashboards
- Review platform documentation

**Level 2**: Platform support
- Railway: Discord community, email support
- Render: Community forum, email support
- Vercel: Discord community, email support

**Level 3**: Application maintainer
- Review application-specific issues
- Code-level troubleshooting
- Custom configuration problems

### Contact Information

**Platform Support**:
- Railway: support@railway.app
- Render: help@render.com
- Vercel: support@vercel.com

**Emergency Contacts**:
- Application maintainer: [contact info]
- System administrator: [contact info]
- MFEC API support: [contact info]

---

**Remember**: Regular maintenance prevents most issues. Follow the checklists consistently and monitor trends to identify problems before they become critical.