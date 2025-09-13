# Free Tier Resource Limits and Optimization Guide

This document provides detailed information about free tier limitations across different hosting platforms and optimization strategies for the Thai Document Generator.

## Platform Comparison

### Resource Limits Overview

| Platform | Memory | CPU | Storage | Bandwidth | Build Time | Monthly Limit |
|----------|--------|-----|---------|-----------|------------|---------------|
| **Railway** | 512MB | 1 vCPU | 1GB | Unlimited | 10 min | $5 usage credit |
| **Render** | 512MB | 0.1 CPU | 1GB | 100GB | 500 build min | Free forever |
| **Vercel** | 1024MB* | Serverless | 1GB | 100GB | 6000 build sec | Free forever |
| **Heroku** | 512MB | 1 dyno | 1GB | 2TB | 15 min | 550-1000 hours |

*Vercel memory limit applies to serverless functions, not containers

### Detailed Platform Analysis

## Railway Free Tier

### Limits
- **Memory**: 512MB RAM per service
- **CPU**: 1 shared vCPU
- **Storage**: 1GB persistent storage
- **Network**: Unlimited bandwidth
- **Builds**: 10 minutes per build
- **Monthly**: $5 usage credit (generous for small teams)
- **Sleep**: No automatic sleep
- **Custom Domains**: Supported with automatic HTTPS

### Optimization Strategies

#### Memory Management
```bash
# Environment variables for Railway
NODE_OPTIONS=--max-old-space-size=400
RAILWAY_MEMORY_LIMIT=512

# Application-level optimizations
CONCURRENT_PROCESSING_LIMIT=1
IMAGE_PROCESSING_QUALITY=medium
DOCUMENT_CACHE_SIZE=50MB
```

#### Performance Tuning
```javascript
// railway.toml configuration
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[variables]
NODE_ENV = "production"
PORT = "3000"
```

#### Storage Optimization
```bash
# Automatic cleanup for Railway
STORAGE_CLEANUP_ENABLED=true
STORAGE_MAX_SIZE_MB=800  # 80% of 1GB limit
STORAGE_CLEANUP_INTERVAL=6h
LOG_RETENTION_DAYS=3
```

### Railway-Specific Features
- **Automatic HTTPS**: Free SSL certificates
- **Zero-downtime deployments**: Rolling updates
- **Built-in monitoring**: Resource usage graphs
- **Database add-ons**: PostgreSQL, MySQL, Redis (paid)
- **Environment management**: Multiple environments

## Render Free Tier

### Limits
- **Memory**: 512MB RAM
- **CPU**: 0.1 CPU units (shared)
- **Storage**: 1GB SSD
- **Network**: 100GB/month bandwidth
- **Builds**: 500 build minutes/month
- **Sleep**: Services sleep after 15 minutes of inactivity
- **Custom Domains**: Supported with automatic HTTPS
- **Build Cache**: 30 days retention

### Optimization Strategies

#### Cold Start Mitigation
```bash
# Keep-alive configuration
RENDER_KEEP_ALIVE_ENABLED=true
RENDER_PING_INTERVAL=300  # 5 minutes

# Optimize startup time
RENDER_STARTUP_OPTIMIZATION=true
PRELOAD_CRITICAL_MODULES=true
```

#### Build Optimization
```yaml
# render.yaml optimizations
services:
  - type: web
    name: thai-doc-generator
    env: node
    plan: free
    buildCommand: |
      npm ci --production=false
      npm run build
      npm prune --production
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_OPTIONS
        value: --max-old-space-size=400
```

#### Resource Management
```javascript
// Render-specific optimizations
const renderOptimizations = {
  // Reduce memory footprint
  memoryOptimization: {
    maxOldSpaceSize: 400, // MB
    gcInterval: 30000, // 30 seconds
    clearCacheInterval: 300000, // 5 minutes
  },
  
  // Handle sleep/wake cycles
  sleepHandling: {
    warmupEndpoint: '/api/warmup',
    keepAliveInterval: 5 * 60 * 1000, // 5 minutes
    gracefulShutdown: true,
  },
};
```

### Render-Specific Features
- **Automatic SSL**: Free certificates for custom domains
- **Git-based deployments**: Automatic deploys on push
- **Preview environments**: Branch-based deployments
- **Health checks**: Built-in monitoring
- **Log streaming**: Real-time log access

## Vercel Free Tier

### Limits
- **Function Memory**: 1024MB per function
- **Function Duration**: 10 seconds (Hobby), 60 seconds (Pro)
- **Function Size**: 50MB compressed
- **Bandwidth**: 100GB/month
- **Builds**: 6000 build execution seconds/month
- **Edge Functions**: 500KB size limit
- **Serverless Functions**: 12 per deployment
- **Custom Domains**: Unlimited with automatic HTTPS

### Optimization Strategies

#### Function Optimization
```javascript
// vercel.json configuration
{
  "functions": {
    "app/api/generate/route.ts": {
      "maxDuration": 30,
      "memory": 1024
    },
    "app/api/health/route.ts": {
      "maxDuration": 5,
      "memory": 128
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

#### Edge Function Usage
```javascript
// Use Edge Runtime for faster cold starts
export const runtime = 'edge';

export async function GET(request) {
  // Lightweight operations only
  return new Response('OK', { status: 200 });
}
```

#### Bundle Size Optimization
```javascript
// next.config.js for Vercel
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'canvas'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Reduce server bundle size
      config.externals.push('canvas', 'sharp');
    }
    return config;
  },
};
```

### Vercel-Specific Features
- **Edge Network**: Global CDN with 100+ locations
- **Automatic Optimization**: Image and font optimization
- **Analytics**: Core Web Vitals monitoring
- **Preview Deployments**: Every git push gets a URL
- **Serverless Functions**: Auto-scaling compute

## Application-Level Optimizations

### Memory Usage Optimization

#### 1. Efficient Data Structures
```javascript
// Use memory-efficient data structures
class MemoryEfficientProcessor {
  constructor() {
    // Use WeakMap for temporary data
    this.tempData = new WeakMap();
    
    // Use Set for unique values
    this.processedUrls = new Set();
    
    // Limit cache size
    this.cache = new Map();
    this.maxCacheSize = 100;
  }
  
  addToCache(key, value) {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

#### 2. Streaming Processing
```javascript
// Process large files in streams
const processLargeDocument = async (inputStream) => {
  const transform = new Transform({
    transform(chunk, encoding, callback) {
      // Process chunk by chunk
      const processed = this.processChunk(chunk);
      callback(null, processed);
    }
  });
  
  return pipeline(inputStream, transform, outputStream);
};
```

#### 3. Garbage Collection Optimization
```javascript
// Force garbage collection in production
const optimizeMemory = () => {
  if (global.gc && process.env.NODE_ENV === 'production') {
    global.gc();
  }
};

// Run after heavy operations
setInterval(optimizeMemory, 30000); // Every 30 seconds
```

### CPU Usage Optimization

#### 1. Async Processing
```javascript
// Use worker threads for CPU-intensive tasks
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main thread
  const processDocument = async (data) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: data });
      worker.on('message', resolve);
      worker.on('error', reject);
    });
  };
} else {
  // Worker thread
  const processData = (data) => {
    // CPU-intensive processing here
    return processedData;
  };
  
  parentPort.postMessage(processData(workerData));
}
```

#### 2. Request Queuing
```javascript
// Implement request queue for free tier
class RequestQueue {
  constructor(maxConcurrent = 1) {
    this.queue = [];
    this.processing = 0;
    this.maxConcurrent = maxConcurrent;
  }
  
  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.processing++;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing--;
      this.process(); // Process next item
    }
  }
}
```

### Storage Optimization

#### 1. Automatic Cleanup
```javascript
// Automatic file cleanup
class StorageManager {
  constructor() {
    this.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    this.maxSize = 800 * 1024 * 1024; // 800MB
    this.cleanupInterval = 6 * 60 * 60 * 1000; // 6 hours
    
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }
  
  async cleanup() {
    const exportsDir = path.join(process.cwd(), 'exports');
    const files = await fs.readdir(exportsDir);
    
    let totalSize = 0;
    const fileStats = [];
    
    // Get file stats
    for (const file of files) {
      const filePath = path.join(exportsDir, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      fileStats.push({ file, path: filePath, size: stats.size, mtime: stats.mtime });
    }
    
    // Sort by modification time (oldest first)
    fileStats.sort((a, b) => a.mtime - b.mtime);
    
    // Remove old files
    for (const { path: filePath, mtime } of fileStats) {
      const age = Date.now() - mtime.getTime();
      
      if (age > this.maxAge || totalSize > this.maxSize) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old file: ${filePath}`);
      }
    }
  }
}
```

#### 2. Compression
```javascript
// Compress generated documents
const compressDocument = async (inputPath, outputPath) => {
  const gzip = zlib.createGzip({ level: 9 });
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);
  
  await pipeline(input, gzip, output);
  
  // Remove original if compression successful
  await fs.unlink(inputPath);
};
```

### Network Optimization

#### 1. Response Compression
```javascript
// Enable compression middleware
app.use(compression({
  level: 6, // Balanced compression
  threshold: 1024, // Only compress files > 1KB
  filter: (req, res) => {
    // Don't compress images
    return !req.headers['content-type']?.startsWith('image/');
  }
}));
```

#### 2. Caching Strategy
```javascript
// Implement intelligent caching
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50 * 1024 * 1024; // 50MB
    this.currentSize = 0;
  }
  
  set(key, value, ttl = 3600000) { // 1 hour default
    const size = JSON.stringify(value).length;
    
    // Check if we need to evict items
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      value,
      size,
      timestamp: Date.now(),
      ttl
    });
    
    this.currentSize += size;
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  evictOldest() {
    const oldestKey = this.cache.keys().next().value;
    this.delete(oldestKey);
  }
  
  delete(key) {
    const item = this.cache.get(key);
    if (item) {
      this.currentSize -= item.size;
      this.cache.delete(key);
    }
  }
}
```

## Monitoring Resource Usage

### Built-in Monitoring

The application includes comprehensive resource monitoring:

```javascript
// Resource monitoring endpoint
GET /api/monitoring?type=resources

// Response includes:
{
  "memory": {
    "used": 256,
    "total": 512,
    "percentage": 50,
    "limit": 512
  },
  "storage": {
    "used": 150,
    "total": 1024,
    "percentage": 14.6,
    "files": 25
  },
  "cpu": {
    "usage": 45,
    "loadAverage": [0.5, 0.3, 0.2]
  },
  "network": {
    "requests": 1250,
    "bandwidth": 45.2,
    "errors": 3
  }
}
```

### Alert Thresholds

Configure alerts for resource usage:

```bash
# Environment variables for alerts
MEMORY_WARNING_THRESHOLD=75
MEMORY_CRITICAL_THRESHOLD=90
STORAGE_WARNING_THRESHOLD=80
STORAGE_CRITICAL_THRESHOLD=95
CPU_WARNING_THRESHOLD=80
ERROR_RATE_THRESHOLD=5
```

### External Monitoring Setup

#### UptimeRobot Configuration
```bash
# Monitor resource endpoint
URL: https://your-app.com/api/monitoring?type=resources
Method: GET
Interval: 5 minutes
Timeout: 30 seconds

# Alert conditions:
# Memory > 80%: Warning
# Memory > 90%: Critical
# Storage > 85%: Warning
```

#### Custom Monitoring Script
```javascript
// monitoring-script.js
const monitorResources = async () => {
  try {
    const response = await fetch('https://your-app.com/api/monitoring?type=resources');
    const resources = await response.json();
    
    // Check memory usage
    if (resources.memory.percentage > 90) {
      await sendAlert('CRITICAL: Memory usage > 90%', resources);
    } else if (resources.memory.percentage > 75) {
      await sendAlert('WARNING: Memory usage > 75%', resources);
    }
    
    // Check storage usage
    if (resources.storage.percentage > 85) {
      await sendAlert('WARNING: Storage usage > 85%', resources);
    }
    
    // Log metrics
    console.log(`Memory: ${resources.memory.percentage}%, Storage: ${resources.storage.percentage}%`);
    
  } catch (error) {
    console.error('Monitoring failed:', error);
    await sendAlert('ERROR: Monitoring system failure', { error: error.message });
  }
};

// Run every 5 minutes
setInterval(monitorResources, 5 * 60 * 1000);
```

## Scaling Strategies

### When to Upgrade

Consider upgrading from free tier when:

1. **Memory Issues**
   - Consistent memory usage > 80%
   - Frequent out-of-memory errors
   - Performance degradation

2. **Storage Limitations**
   - Regular storage cleanup needed
   - Users experiencing file access issues
   - Need for persistent document storage

3. **Performance Requirements**
   - Cold start delays affecting user experience
   - Need for faster response times
   - Multiple concurrent users

4. **Feature Requirements**
   - Need for background processing
   - Database requirements
   - Advanced monitoring needs

### Upgrade Paths

#### Railway Upgrade
```bash
# Hobby Plan: $5/month
- Memory: 8GB
- CPU: 8 vCPU
- Storage: 100GB
- No usage limits
- Priority support

# Pro Plan: $20/month
- Memory: 32GB
- CPU: 32 vCPU
- Storage: 100GB
- Team features
- Advanced monitoring
```

#### Render Upgrade
```bash
# Starter Plan: $7/month
- Memory: 512MB
- CPU: 0.5 CPU
- No sleep
- Custom domains
- Priority support

# Standard Plan: $25/month
- Memory: 2GB
- CPU: 1 CPU
- Auto-scaling
- Advanced features
```

#### Vercel Upgrade
```bash
# Pro Plan: $20/month per user
- Function duration: 60 seconds
- Function memory: 3GB
- Bandwidth: 1TB
- Build time: 400 minutes
- Team collaboration
```

### Hybrid Approaches

#### Multi-Platform Strategy
```bash
# Use different platforms for different components:
- Static assets: Vercel (excellent CDN)
- API functions: Railway (better for containers)
- File storage: External service (Google Drive, AWS S3)
- Monitoring: External service (UptimeRobot, Pingdom)
```

#### Gradual Migration
```bash
# Phase 1: Optimize current free tier usage
# Phase 2: Upgrade one platform component
# Phase 3: Migrate to fully paid solution
# Phase 4: Implement advanced features
```

## Cost Optimization

### Free Tier Maximization

1. **Use Multiple Platforms**
   - Deploy to multiple free tiers
   - Load balance between them
   - Failover capabilities

2. **Optimize Resource Usage**
   - Implement efficient algorithms
   - Use caching strategically
   - Minimize memory footprint

3. **External Services**
   - Use free external APIs where possible
   - Leverage free storage services
   - Implement free monitoring solutions

### Budget Planning

#### Monthly Cost Estimates
```bash
# Minimal Upgrade (Single Platform)
Railway Hobby: $5/month
Render Starter: $7/month
Vercel Pro: $20/month

# Recommended Production Setup
Platform hosting: $20/month
External storage: $5/month
Monitoring service: $10/month
Total: $35/month
```

#### ROI Considerations
- User productivity gains
- Reduced maintenance overhead
- Better reliability and performance
- Professional features and support

---

**Remember**: Free tiers are excellent for development, testing, and small-scale production use. As your application grows, upgrading provides better performance, reliability, and features that justify the cost.