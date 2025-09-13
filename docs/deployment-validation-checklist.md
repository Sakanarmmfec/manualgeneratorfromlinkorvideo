# Deployment Validation Checklist

This checklist ensures your Thai Document Generator deployment is properly configured and monitored on free hosting platforms.

## Pre-Deployment Validation

### 1. Environment Configuration ✅

**Required Environment Variables:**
```bash
# Core Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.com

# MFEC LLM Configuration
MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
MFEC_LLM_API_KEY=your_api_key_here
MFEC_LLM_CHAT_MODEL=gpt-4o
MFEC_LLM_EMBEDDING_MODEL=text-embedding-3-large

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Free Tier Optimizations
NODE_OPTIONS=--max-old-space-size=400
ALLOW_USER_API_KEYS=true
```

**Validation Commands:**
```bash
# Check environment file exists
ls -la .env.production

# Validate configuration
node scripts/validate-deployment.js

# Test environment loading
npm run config:validate
```

### 2. Docker Configuration ✅

**Files to Check:**
- [ ] `Dockerfile` exists and is optimized
- [ ] `Dockerfile.cloud` exists for container platforms
- [ ] `.dockerignore` excludes unnecessary files
- [ ] `docker-compose.yml` configurations are correct

**Validation Commands:**
```bash
# Test Docker build
docker build -t thai-doc-generator .

# Test container startup
docker run --rm -p 3000:3000 thai-doc-generator

# Validate health check
curl http://localhost:3000/api/health
```

### 3. Application Structure ✅

**Critical Files:**
- [ ] `package.json` has all required scripts
- [ ] `next.config.js` is optimized for deployment
- [ ] Health check endpoint exists: `src/app/api/health/route.ts`
- [ ] Monitoring endpoint exists: `src/app/api/monitoring/route.ts`

**Validation Commands:**
```bash
# Check package.json scripts
npm run build
npm run start
npm run health-check

# Validate Next.js configuration
npx next build --debug
```

## Platform-Specific Deployment Validation

### Railway Deployment ✅

**Pre-Deployment Checklist:**
- [ ] Railway CLI installed: `npm install -g @railway/cli`
- [ ] Logged into Railway: `railway login`
- [ ] `railway.toml` configuration file exists
- [ ] Environment variables set in Railway dashboard

**Deployment Steps:**
```bash
# Deploy to Railway
./scripts/deploy-free-tier.sh railway production

# Validate deployment
railway status
railway logs --tail 20

# Test health endpoint
curl https://your-app.railway.app/api/health
```

**Post-Deployment Validation:**
```bash
# Check service status
railway ps

# Monitor resource usage
railway metrics

# Verify environment variables
railway variables
```

### Render Deployment ✅

**Pre-Deployment Checklist:**
- [ ] GitHub repository connected to Render
- [ ] `render.yaml` configuration file exists
- [ ] Environment variables set as secrets (not env vars)
- [ ] Build and start commands configured

**Deployment Steps:**
1. Connect GitHub repository in Render dashboard
2. Create new Web Service
3. Use `render.yaml` configuration
4. Set environment variables as **secrets**
5. Deploy service

**Post-Deployment Validation:**
```bash
# Test health endpoint
curl https://your-app.onrender.com/api/health

# Check service logs in Render dashboard
# Monitor build and deployment status
# Verify custom domain (if configured)
```

### Vercel Deployment ✅

**Pre-Deployment Checklist:**
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged into Vercel: `vercel login`
- [ ] `vercel.json` configuration file exists
- [ ] Next.js optimized for serverless

**Deployment Steps:**
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in dashboard
# Redeploy after setting variables
vercel --prod
```

**Post-Deployment Validation:**
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Check function logs
vercel logs your-deployment-url

# Monitor function performance in dashboard
```

## Post-Deployment Validation

### 1. Health Check Validation ✅

**Basic Health Check:**
```bash
# Test health endpoint
curl https://your-app.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": "pass",
    "llm": "pass",
    "filesystem": "pass",
    "configuration": "pass"
  },
  "uptime": 3600,
  "memory": {
    "used": 256,
    "total": 512,
    "percentage": 50
  }
}
```

**Detailed Monitoring Check:**
```bash
# Test monitoring endpoint
curl https://your-app.com/api/monitoring?type=overview

# Check specific metrics
curl https://your-app.com/api/monitoring?type=storage
curl https://your-app.com/api/monitoring?type=memory
```

### 2. Functional Testing ✅

**Core Functionality Tests:**
```bash
# Test document generation (replace with actual URL)
curl -X POST https://your-app.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/product",
    "type": "user_manual",
    "language": "thai"
  }'

# Test file upload (if applicable)
curl -X POST https://your-app.com/api/upload \
  -F "file=@test-document.pdf"

# Test API key management
curl -X POST https://your-app.com/api/auth/api-key \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "test-key"}'
```

**UI Testing:**
- [ ] Main page loads correctly
- [ ] Document generation form works
- [ ] File upload functionality works
- [ ] Download functionality works
- [ ] Error handling displays properly

### 3. Performance Validation ✅

**Response Time Testing:**
```bash
# Test response times
time curl https://your-app.com/api/health
time curl https://your-app.com/

# Load testing (basic)
for i in {1..10}; do
  curl -w "%{time_total}\n" -o /dev/null -s https://your-app.com/api/health
done
```

**Resource Usage Monitoring:**
```bash
# Check memory usage trends
curl https://your-app.com/api/monitoring?type=memory

# Check storage usage
curl https://your-app.com/api/monitoring?type=storage

# Monitor for 5 minutes and check stability
```

### 4. Security Validation ✅

**HTTPS and Security Headers:**
```bash
# Verify HTTPS is enforced
curl -I http://your-app.com
# Should redirect to HTTPS

# Check security headers
curl -I https://your-app.com
# Should include:
# - Strict-Transport-Security
# - X-Content-Type-Options
# - X-Frame-Options
# - Content-Security-Policy
```

**API Security Testing:**
```bash
# Test rate limiting
for i in {1..20}; do
  curl -w "%{http_code}\n" https://your-app.com/api/health
done
# Should see 429 (Too Many Requests) after limit

# Test authentication (if enabled)
curl -X POST https://your-app.com/api/admin/monitoring
# Should require authentication
```

## Monitoring Setup Validation

### 1. Internal Monitoring ✅

**Setup Monitoring Scripts:**
```bash
# Run monitoring setup
node scripts/setup-monitoring.js

# Start health monitoring
cd monitoring
node health-check.js

# Test monitoring dashboard
open monitoring/dashboard.html
```

**Validate Monitoring Endpoints:**
```bash
# Test all monitoring endpoints
curl https://your-app.com/api/monitoring?type=overview
curl https://your-app.com/api/monitoring?type=health
curl https://your-app.com/api/monitoring?type=storage
curl https://your-app.com/api/monitoring?type=memory
```

### 2. External Monitoring Setup ✅

**UptimeRobot Setup:**
1. Create account at https://uptimerobot.com
2. Add health check monitor: `https://your-app.com/api/health`
3. Configure keyword monitoring: "healthy"
4. Set up email alerts
5. Test notifications

**Pingdom Setup (Optional):**
1. Create account at https://pingdom.com
2. Add uptime check: `https://your-app.com`
3. Configure alerting
4. Test notifications

**Validation Commands:**
```bash
# Test external monitoring
curl -X GET "https://api.uptimerobot.com/v2/getMonitors" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=YOUR_API_KEY&format=json"
```

## Free Tier Optimization Validation

### 1. Resource Limits Check ✅

**Memory Usage:**
```bash
# Check memory usage is within limits
curl https://your-app.com/api/health | jq '.memory.percentage'
# Should be < 80% for healthy operation
```

**Storage Usage:**
```bash
# Check storage usage
curl https://your-app.com/api/monitoring?type=storage | jq '.storage.percentage'
# Should be < 85% for healthy operation
```

**Platform-Specific Limits:**
- **Railway**: Monitor $5/month usage credit
- **Render**: Check 500 build minutes/month limit
- **Vercel**: Monitor 6000 build seconds/month limit

### 2. Performance Optimization ✅

**Build Optimization:**
```bash
# Check build size
npm run build
du -sh .next/

# Verify standalone output (for Docker)
ls -la .next/standalone/
```

**Runtime Optimization:**
```bash
# Check startup time
time curl https://your-app.com/api/health

# Monitor cold start performance (Render/Vercel)
# Test after 15+ minutes of inactivity
```

## Troubleshooting Common Issues

### 1. Deployment Failures ❌

**Build Failures:**
```bash
# Check build logs
npm run build 2>&1 | tee build.log

# Common fixes:
# - Update Node.js version
# - Clear node_modules and reinstall
# - Check for missing dependencies
```

**Container Issues:**
```bash
# Test Docker build locally
docker build -t test-build .
docker run --rm test-build npm run health-check

# Check container logs
docker logs container-name
```

### 2. Runtime Issues ❌

**Memory Issues:**
```bash
# Check memory usage
curl https://your-app.com/api/health | jq '.memory'

# Solutions:
# - Reduce NODE_OPTIONS memory limit
# - Enable garbage collection
# - Optimize code for memory efficiency
```

**Storage Issues:**
```bash
# Check storage usage
curl https://your-app.com/api/monitoring?type=storage

# Solutions:
# - Enable automatic cleanup
# - Reduce file retention period
# - Implement compression
```

### 3. Performance Issues ❌

**Slow Response Times:**
```bash
# Test response times
curl -w "@curl-format.txt" https://your-app.com/api/health

# Solutions:
# - Optimize database queries
# - Implement caching
# - Reduce concurrent processing
```

**Cold Start Issues:**
```bash
# Test cold start performance
# Wait 15+ minutes, then:
time curl https://your-app.com/api/health

# Solutions:
# - Implement keep-alive pings
# - Optimize bundle size
# - Use serverless optimizations
```

## Final Validation Checklist

### Pre-Production ✅
- [ ] All environment variables configured
- [ ] Docker build successful
- [ ] Local testing passed
- [ ] Security configurations verified
- [ ] Documentation updated

### Deployment ✅
- [ ] Platform deployment successful
- [ ] Health check endpoint responding
- [ ] Core functionality working
- [ ] Performance within acceptable limits
- [ ] Security headers present

### Monitoring ✅
- [ ] Internal monitoring configured
- [ ] External monitoring setup
- [ ] Alert notifications working
- [ ] Dashboard accessible
- [ ] Log aggregation working

### Post-Deployment ✅
- [ ] User acceptance testing completed
- [ ] Performance monitoring active
- [ ] Backup procedures tested
- [ ] Incident response plan ready
- [ ] Team training completed

## Maintenance Schedule

### Daily ✅
- [ ] Check health endpoint
- [ ] Review error logs
- [ ] Monitor resource usage
- [ ] Verify core functionality

### Weekly ✅
- [ ] Review performance metrics
- [ ] Check security configurations
- [ ] Update dependencies (security patches)
- [ ] Test backup procedures

### Monthly ✅
- [ ] Comprehensive performance review
- [ ] Security audit
- [ ] Capacity planning review
- [ ] Documentation updates

---

**Success Criteria**: All checkboxes completed, health endpoint returning "healthy", core functionality working, monitoring active, and performance within acceptable limits for free tier usage.

**Next Steps**: After successful validation, proceed with user training, documentation distribution, and regular maintenance schedule implementation.