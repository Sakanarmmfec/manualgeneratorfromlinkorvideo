# Free Tier Troubleshooting Guide

This guide helps resolve common issues when running the Thai Document Generator on free hosting platforms.

## Common Free Tier Issues

### 1. Memory Limit Exceeded

**Symptoms:**
- Application crashes with "JavaScript heap out of memory"
- Slow response times or timeouts
- Health check failures with memory warnings

**Causes:**
- Processing large documents or images
- Memory leaks in long-running processes
- Insufficient memory allocation for free tier (512MB)

**Solutions:**

#### Immediate Fixes
```bash
# Check current memory usage
curl https://your-app.com/api/health | jq '.memory'

# Restart the application (platform-specific)
# Railway:
railway restart

# Render:
# Use dashboard to restart service

# Vercel:
# Redeploy to restart serverless functions
vercel --prod
```

#### Configuration Optimizations
```bash
# Set memory limit in environment variables
NODE_OPTIONS=--max-old-space-size=400

# Enable garbage collection optimization
NODE_OPTIONS=--max-old-space-size=400 --optimize-for-size

# Reduce concurrent processing
CONCURRENT_PROCESSING_LIMIT=1
```

#### Code-Level Fixes
- Reduce image processing quality for free tier
- Implement streaming for large file processing
- Clear temporary files immediately after use
- Use lazy loading for heavy components

### 2. Cold Start Delays

**Symptoms:**
- First request takes 10-30 seconds to respond
- Intermittent timeouts on Render/Railway
- Users report slow initial loading

**Causes:**
- Container goes to sleep after inactivity (free tier behavior)
- Large application bundle size
- Slow initialization of dependencies

**Solutions:**

#### Keep-Alive Strategies
```bash
# Set up external monitoring to ping your app
# UptimeRobot (free): https://uptimerobot.com
# Pingdom (free): https://www.pingdom.com

# Ping endpoint every 5 minutes
curl -I https://your-app.com/api/health
```

#### Application Optimizations
```javascript
// next.config.js - Optimize bundle size
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

#### Platform-Specific Solutions

**Railway:**
- Upgrade to Hobby plan ($5/month) to eliminate cold starts
- Use Railway's always-on feature

**Render:**
- Upgrade to Starter plan ($7/month) for faster cold starts
- Optimize Docker image size

**Vercel:**
- Use Edge Functions for faster cold starts
- Implement ISR (Incremental Static Regeneration) where possible

### 3. Storage Limitations

**Symptoms:**
- "No space left on device" errors
- Document generation failures
- Health check warnings about storage usage

**Causes:**
- Generated documents accumulating over time
- Large temporary files not being cleaned up
- Log files growing too large

**Solutions:**

#### Immediate Cleanup
```bash
# Check storage usage via API
curl https://your-app.com/api/monitoring?type=storage

# Manual cleanup (if you have shell access)
# Railway:
railway shell
rm -rf exports/*.pdf exports/*.docx

# Clean up old log files
find logs/ -name "*.log" -mtime +7 -delete
```

#### Automatic Cleanup Configuration
```bash
# Environment variables for automatic cleanup
STORAGE_CLEANUP_ENABLED=true
STORAGE_CLEANUP_INTERVAL=24h
STORAGE_MAX_AGE_HOURS=168  # 7 days
STORAGE_MAX_SIZE_MB=800    # 80% of 1GB limit
```

#### Storage Optimization
- Enable document compression
- Use external storage (Google Drive) for persistence
- Implement streaming downloads (no local storage)
- Reduce image quality for free tier

### 4. Rate Limiting Issues

**Symptoms:**
- "Too Many Requests" (429) errors
- Users unable to generate documents
- API calls being rejected

**Causes:**
- Exceeding free tier API limits
- Multiple users hitting rate limits
- Inefficient API usage patterns

**Solutions:**

#### Adjust Rate Limits
```bash
# Reduce rate limits for free tier
RATE_LIMIT_REQUESTS_PER_MINUTE=5
RATE_LIMIT_REQUESTS_PER_HOUR=50
RATE_LIMIT_BURST_SIZE=10
```

#### Implement User Queuing
```javascript
// Queue system for free tier
const documentQueue = {
  maxConcurrent: 1,
  queue: [],
  processing: false
};
```

#### User Communication
- Display queue position to users
- Show estimated wait times
- Provide clear error messages about limits

### 5. API Key Exhaustion

**Symptoms:**
- LLM API calls failing with authentication errors
- "Quota exceeded" messages
- Health check showing LLM failures

**Causes:**
- MFEC API key quota exhausted
- Invalid or expired API key
- High usage exceeding free allowance

**Solutions:**

#### Enable User API Keys
```bash
# Allow users to provide their own API keys
ALLOW_USER_API_KEYS=true
USER_API_KEY_REQUIRED_AFTER_QUOTA=true
```

#### Monitor API Usage
```bash
# Check API usage via monitoring
curl https://your-app.com/api/monitoring?type=overview

# Set up usage alerts
API_USAGE_WARNING_THRESHOLD=80
API_USAGE_CRITICAL_THRESHOLD=95
```

#### Fallback Strategies
- Implement graceful degradation
- Cache common translations
- Provide manual input options

### 6. Build and Deployment Failures

**Symptoms:**
- Deployment fails during build process
- "Build exceeded time limit" errors
- Out of memory during build

**Causes:**
- Large dependencies taking too long to install
- Memory limits during build process
- Network timeouts during dependency download

**Solutions:**

#### Optimize Build Process
```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
```

#### Platform-Specific Build Optimizations

**Railway:**
```bash
# Use Railway's build cache
railway build --cache

# Optimize build resources
RAILWAY_BUILD_MEMORY=1024
```

**Render:**
```yaml
# render.yaml
services:
  - type: web
    name: thai-doc-generator
    env: node
    buildCommand: npm ci && npm run build
    startCommand: npm start
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
```

**Vercel:**
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

## Platform-Specific Troubleshooting

### Railway Issues

#### Common Problems
1. **Service won't start**
   ```bash
   # Check logs
   railway logs --tail 100
   
   # Check service status
   railway status
   
   # Restart service
   railway restart
   ```

2. **Environment variables not loading**
   ```bash
   # List current variables
   railway variables
   
   # Set variable
   railway variables set VARIABLE_NAME=value
   ```

3. **Domain issues**
   ```bash
   # Check domain configuration
   railway domain
   
   # Generate new domain
   railway domain generate
   ```

#### Railway-Specific Limits
- Memory: 512MB (free), 8GB (paid)
- CPU: Shared (free), dedicated (paid)
- Storage: 1GB (free), 100GB (paid)
- Build time: 10 minutes max
- Monthly usage: $5 credit

### Render Issues

#### Common Problems
1. **Service keeps sleeping**
   - Free tier services sleep after 15 minutes of inactivity
   - Solution: Upgrade to paid tier or implement keep-alive

2. **Build failures**
   ```bash
   # Check build logs in Render dashboard
   # Common fixes:
   - Increase build timeout
   - Optimize dependencies
   - Use build cache
   ```

3. **Environment variables as secrets**
   ```bash
   # Always use "Secret Files" for sensitive data
   # Not "Environment Variables" which are visible in logs
   ```

#### Render-Specific Limits
- Memory: 512MB (free)
- CPU: 0.1 CPU (free)
- Storage: 1GB (free)
- Build minutes: 500/month (free)
- Bandwidth: 100GB/month (free)

### Vercel Issues

#### Common Problems
1. **Function timeout**
   ```javascript
   // Increase timeout in vercel.json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30
       }
     }
   }
   ```

2. **Serverless function size limit**
   ```bash
   # Optimize bundle size
   npm run analyze-bundle
   
   # Use dynamic imports
   const heavyLibrary = await import('heavy-library');
   ```

3. **Edge function limitations**
   ```javascript
   // Use Edge Runtime for better performance
   export const runtime = 'edge';
   ```

#### Vercel-Specific Limits
- Function execution: 10 seconds (Hobby), 60 seconds (Pro)
- Function size: 50MB (Hobby), 250MB (Pro)
- Bandwidth: 100GB/month (Hobby)
- Build time: 45 minutes/month (Hobby)

## Monitoring and Alerting

### Health Check Monitoring

Set up external monitoring for your health check endpoint:

```bash
# Health check URL
https://your-app.com/api/health

# Expected response codes:
# 200 - Healthy
# 503 - Unhealthy
```

### Free Monitoring Tools

1. **UptimeRobot** (Free: 50 monitors)
   - Monitor health check endpoint
   - Alert via email/SMS when down
   - 5-minute check intervals

2. **Pingdom** (Free: 1 monitor)
   - Basic uptime monitoring
   - Email alerts
   - Performance insights

3. **Better Uptime** (Free: 10 monitors)
   - Status page creation
   - Multiple alert channels
   - Incident management

### Custom Monitoring Setup

```javascript
// Simple monitoring script
const monitorApp = async () => {
  try {
    const response = await fetch('https://your-app.com/api/health');
    const health = await response.json();
    
    if (health.status !== 'healthy') {
      // Send alert (email, Slack, etc.)
      console.error('App unhealthy:', health);
    }
    
    // Check free tier warnings
    if (health.freeTier?.warnings?.length > 0) {
      console.warn('Free tier warnings:', health.freeTier.warnings);
    }
  } catch (error) {
    console.error('Health check failed:', error);
  }
};

// Run every 5 minutes
setInterval(monitorApp, 5 * 60 * 1000);
```

## Performance Optimization for Free Tier

### Memory Optimization

```javascript
// Optimize memory usage
const optimizeMemory = {
  // Use streaming for large files
  processLargeFile: async (file) => {
    const stream = fs.createReadStream(file);
    // Process in chunks instead of loading entire file
  },
  
  // Clear variables after use
  cleanup: () => {
    global.gc && global.gc(); // Force garbage collection
  },
  
  // Use WeakMap for temporary data
  tempData: new WeakMap(),
};
```

### CPU Optimization

```javascript
// Reduce CPU usage
const optimizeCPU = {
  // Use worker threads for heavy processing
  processInWorker: async (data) => {
    const { Worker } = require('worker_threads');
    return new Promise((resolve, reject) => {
      const worker = new Worker('./worker.js', { workerData: data });
      worker.on('message', resolve);
      worker.on('error', reject);
    });
  },
  
  // Implement request queuing
  queue: [],
  processing: false,
  
  processQueue: async function() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const request = this.queue.shift();
    
    try {
      await this.processRequest(request);
    } finally {
      this.processing = false;
      this.processQueue(); // Process next item
    }
  }
};
```

### Network Optimization

```javascript
// Optimize network usage
const optimizeNetwork = {
  // Implement caching
  cache: new Map(),
  
  // Compress responses
  compression: true,
  
  // Use CDN for static assets
  staticAssets: 'https://cdn.example.com',
  
  // Implement request deduplication
  deduplicateRequests: (key, fn) => {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const promise = fn();
    this.cache.set(key, promise);
    
    // Clear cache after 5 minutes
    setTimeout(() => this.cache.delete(key), 5 * 60 * 1000);
    
    return promise;
  }
};
```

## Getting Help

### Self-Diagnosis Steps

1. **Check Health Endpoint**
   ```bash
   curl https://your-app.com/api/health | jq '.'
   ```

2. **Review Platform Logs**
   ```bash
   # Railway
   railway logs --tail 100
   
   # Render
   # Check logs in dashboard
   
   # Vercel
   vercel logs your-deployment-url
   ```

3. **Monitor Resource Usage**
   ```bash
   curl https://your-app.com/api/monitoring?type=overview | jq '.'
   ```

4. **Test Core Functionality**
   ```bash
   # Test document generation
   curl -X POST https://your-app.com/api/generate \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com", "type": "user_manual"}'
   ```

### Support Resources

1. **Platform Documentation**
   - [Railway Docs](https://docs.railway.app/)
   - [Render Docs](https://render.com/docs)
   - [Vercel Docs](https://vercel.com/docs)

2. **Community Support**
   - Railway Discord: https://discord.gg/railway
   - Render Community: https://community.render.com
   - Vercel Discord: https://discord.gg/vercel

3. **Application-Specific Help**
   - Check `/docs/` directory for additional documentation
   - Review GitHub issues for similar problems
   - Use the monitoring dashboard for detailed diagnostics

### Escalation Path

1. **Level 1**: Self-diagnosis using this guide
2. **Level 2**: Platform-specific support channels
3. **Level 3**: Application maintainer or development team
4. **Level 4**: Consider upgrading to paid tier for better support

---

**Remember**: Free tier limitations are by design. Many issues can be resolved by upgrading to paid tiers, which provide more resources, better performance, and enhanced support.