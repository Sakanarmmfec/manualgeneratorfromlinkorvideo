# Security and Performance Configuration for Free Hosting

This document provides setup instructions for configuring security, authentication, document storage, and monitoring on free hosting platforms.

## Overview

The Thai Document Generator includes built-in security and monitoring features optimized for free tier hosting platforms like Railway, Render, and Vercel.

## 1. Automatic HTTPS Setup

### Platform Support

All supported free hosting platforms provide automatic HTTPS:

#### Railway
- ✅ Automatic HTTPS with Let's Encrypt certificates
- ✅ Custom domains supported with automatic certificate provisioning
- ✅ HTTPS enforced by default on railway.app domains

#### Render
- ✅ Automatic HTTPS with Let's Encrypt certificates
- ✅ Free tier includes HTTPS for onrender.com subdomains
- ✅ Custom domains supported with automatic certificate management

#### Vercel
- ✅ Automatic HTTPS for all deployments
- ✅ Edge network ensures global HTTPS coverage
- ✅ Custom domains include automatic certificate management

### Configuration

No manual HTTPS configuration is required. The application automatically:
- Detects the hosting platform
- Validates secure connections
- Applies appropriate security headers
- Enforces HTTPS in production environments

## 2. Team Authentication Setup

### Environment Variables

Configure these environment variables for team authentication:

```bash
# Enable authentication
ENABLE_AUTH=true

# Authentication provider (currently supports 'simple')
AUTH_PROVIDER=simple

# Comma-separated list of allowed email addresses
ALLOWED_USERS=user1@company.com,user2@company.com,admin@company.com

# Comma-separated list of admin email addresses
ADMIN_USERS=admin@company.com

# Session timeout (seconds) - defaults to 1 hour for free tier
AUTH_SESSION_TIMEOUT=3600
```

### Platform-Specific Setup

#### Railway
1. Go to your Railway project dashboard
2. Navigate to Variables tab
3. Add the environment variables listed above
4. Deploy the changes

#### Render
1. Go to your Render service dashboard
2. Navigate to Environment tab
3. Add the environment variables as secrets
4. Deploy the changes

#### Vercel
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the environment variables
4. Redeploy the application

### Usage

1. Users navigate to the application URL
2. If authentication is enabled, they're redirected to `/auth/login`
3. Users enter their email address
4. If the email is in the `ALLOWED_USERS` list, they gain access
5. Admin users (in `ADMIN_USERS` list) can access monitoring dashboard

## 3. Document Storage Configuration

### Local Storage (Default)

By default, documents are stored locally in the `exports/` directory:

- **Retention**: 7 days for free tier, 30 days otherwise
- **Size Limit**: 10MB per file for free tier, 50MB otherwise
- **Total Limit**: 100MB for free tier, 1GB otherwise
- **Cleanup**: Automatic cleanup of expired documents

### Google Drive Integration (Optional)

For persistent storage across deployments, configure Google Drive:

#### Setup Steps

1. **Create Google Cloud Project**
   ```bash
   # Go to https://console.cloud.google.com
   # Create new project or select existing
   ```

2. **Enable Google Drive API**
   ```bash
   # In Google Cloud Console:
   # APIs & Services > Library > Google Drive API > Enable
   ```

3. **Create Service Account**
   ```bash
   # IAM & Admin > Service Accounts > Create Service Account
   # Download the JSON key file
   ```

4. **Configure Environment Variables**
   ```bash
   STORAGE_PROVIDER=google-drive
   GOOGLE_DRIVE_CREDENTIALS=<base64-encoded-json-key>
   GOOGLE_DRIVE_FOLDER_ID=<shared-folder-id>
   ```

5. **Share Drive Folder**
   - Create a folder in Google Drive
   - Share it with the service account email
   - Copy the folder ID from the URL

#### Limitations
- Google Drive API: 1 billion queries/day (free tier)
- File upload size: 5TB (but free storage is 15GB total)
- Rate limiting: 1000 requests per 100 seconds per user

## 4. Usage Monitoring Setup

### Built-in Monitoring

The application includes comprehensive monitoring:

- **Request Tracking**: All HTTP requests with response times
- **Error Tracking**: Application errors with stack traces
- **Resource Monitoring**: Memory and storage usage
- **Document Metrics**: Generation, storage, and download statistics
- **Health Checks**: System health with recommendations

### Accessing Monitoring

1. **Admin Access Required**
   - Add your email to `ADMIN_USERS` environment variable
   - Navigate to `/admin/monitoring`

2. **API Endpoints**
   ```bash
   GET /api/monitoring?type=overview    # Complete metrics
   GET /api/monitoring?type=health      # Health status only
   GET /api/monitoring?type=storage     # Storage metrics
   GET /api/monitoring?type=memory      # Memory usage
   POST /api/monitoring                 # Admin actions (clear metrics)
   ```

### Platform-Specific Monitoring

#### Railway
- **Native**: Built-in metrics dashboard, resource usage graphs
- **External**: UptimeRobot (free: 50 monitors), Pingdom (free: 1 monitor)
- **Limitations**: 7-day log retention, basic metrics only

#### Render
- **Native**: Service metrics dashboard, build/deploy logs
- **External**: Better Uptime (free: 10 monitors), Freshping (free: 50 checks)
- **Limitations**: Limited historical data, basic alerting only

#### Vercel
- **Native**: Analytics dashboard, function logs, performance insights
- **External**: Sentry (free: 5K errors/month), LogRocket (free: 1K sessions/month)
- **Limitations**: Serverless function limits, limited log retention

### Free Tier Optimizations

The monitoring system is optimized for free tier constraints:

- **Memory Management**: Limited metrics retention (1000 entries)
- **Automatic Cleanup**: Periodic cleanup of old metrics
- **Efficient Storage**: Compressed metrics storage
- **Rate Limiting**: Built-in rate limiting to prevent abuse

## 5. Security Headers

The application automatically applies security headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://gpt.mfec.co.th
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains (production only)
```

## 6. Rate Limiting

Built-in rate limiting for free tier protection:

- **Limit**: 60 requests per minute per IP
- **Storage**: In-memory (resets on restart)
- **Headers**: Standard rate limit headers included
- **Bypass**: Static assets and health checks excluded

## 7. Health Checks

Automatic health monitoring includes:

- **LLM Connectivity**: MFEC API connection status
- **File System**: Write access verification
- **Configuration**: Environment validation
- **Resources**: Memory and storage usage
- **Platform**: Deployment status and uptime

### Health Check Endpoint

```bash
GET /api/health
```

Returns:
```json
{
  "status": "healthy|unhealthy",
  "checks": {
    "llm": "pass|fail",
    "filesystem": "pass|fail",
    "configuration": "pass|fail"
  },
  "memory": {
    "used": 128,
    "total": 512,
    "percentage": 25
  },
  "freeTier": {
    "platform": "railway",
    "warnings": []
  }
}
```

## 8. Troubleshooting

### Common Issues

1. **Authentication Not Working**
   - Verify `ENABLE_AUTH=true` is set
   - Check `ALLOWED_USERS` includes your email
   - Ensure email format is correct (lowercase)

2. **High Memory Usage**
   - Clear metrics via monitoring dashboard
   - Restart application to free memory
   - Enable automatic cleanup

3. **Storage Full**
   - Delete old documents via monitoring dashboard
   - Reduce retention period
   - Enable automatic cleanup

4. **Rate Limiting Issues**
   - Check if hitting 60 requests/minute limit
   - Implement client-side rate limiting
   - Consider upgrading to paid tier

### Monitoring Alerts

The system provides automatic warnings for:
- Memory usage > 75% (warning), > 90% (critical)
- Storage usage > 75% (warning), > 90% (critical)
- Error rate > 10% (warning), > 20% (critical)
- Response time > 10 seconds (warning)

## 9. Production Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure `ENCRYPTION_KEY` (32+ characters)
- [ ] Set up `ALLOWED_USERS` and `ADMIN_USERS`
- [ ] Configure `MFEC_LLM_API_KEY`
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Enable monitoring (`ENABLE_MONITORING=true`)
- [ ] Test authentication flow
- [ ] Verify HTTPS is working
- [ ] Check health endpoint
- [ ] Test document generation and storage
- [ ] Verify monitoring dashboard access

## 10. Support and Maintenance

### Regular Maintenance

1. **Weekly**: Check monitoring dashboard for issues
2. **Monthly**: Review storage usage and cleanup old documents
3. **Quarterly**: Update dependencies and security patches

### Support Resources

- **Documentation**: This file and other docs in `/docs/`
- **Health Check**: `/api/health` endpoint
- **Monitoring**: `/admin/monitoring` dashboard
- **Logs**: Platform-specific logging interfaces

For additional support, check the platform-specific documentation:
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)