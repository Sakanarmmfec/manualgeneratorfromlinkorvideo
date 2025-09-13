# Free Tier Deployment Guide

This guide provides step-by-step instructions for deploying the Thai Document Generator on free hosting platforms optimized for small teams.

## Supported Free Platforms

### 1. Railway (Recommended)
- **Free Tier**: 512MB RAM, 1 vCPU, 1GB storage
- **Pros**: Easy Docker deployment, automatic HTTPS, good performance
- **Cons**: Limited to $5/month usage (generous for small teams)

### 2. Render
- **Free Tier**: 512MB RAM, 0.1 CPU, 1GB storage
- **Pros**: Simple deployment, automatic HTTPS, good documentation
- **Cons**: Slower cold starts, limited CPU

### 3. Vercel (Serverless)
- **Free Tier**: Serverless functions, 100GB bandwidth
- **Pros**: Excellent performance, global CDN, automatic scaling
- **Cons**: Function timeout limits, serverless constraints

## Quick Start

### Prerequisites

1. **Install CLI Tools**
   ```bash
   # Railway CLI
   npm install -g @railway/cli
   
   # Vercel CLI
   npm install -g vercel
   
   # Render CLI (optional)
   npm install -g @render/cli
   ```

2. **Prepare Environment Variables**
   
   Create accounts and obtain:
   - MFEC LLM API key
   - Generate encryption key (32 characters)

### Deployment Commands

```bash
# Deploy to Railway (recommended)
./scripts/deploy-free-tier.sh railway production

# Deploy to Render
./scripts/deploy-free-tier.sh render production

# Deploy to Vercel
./scripts/deploy-free-tier.sh vercel production

# Windows PowerShell
.\scripts\deploy-free-tier.ps1 -Platform railway -Environment production
```

## Platform-Specific Setup

### Railway Deployment

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Create New Project**
   ```bash
   railway new
   ```

3. **Deploy Application**
   ```bash
   ./scripts/deploy-free-tier.sh railway
   ```

4. **Set Environment Variables**
   
   In Railway dashboard (https://railway.app):
   ```
   MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
   MFEC_LLM_API_KEY=your_api_key_here
   MFEC_LLM_CHAT_MODEL=gpt-4o
   MFEC_LLM_EMBEDDING_MODEL=text-embedding-3-large
   ENCRYPTION_KEY=your_32_character_key_here
   NEXT_PUBLIC_APP_URL=https://your-app.railway.app
   ```

5. **Monitor Deployment**
   ```bash
   railway logs --follow
   railway status
   ```

### Render Deployment

1. **Connect GitHub Repository**
   - Go to https://dashboard.render.com
   - Connect your GitHub account
   - Select the repository

2. **Create Web Service**
   - Choose "Web Service"
   - Select your repository
   - Use `render.yaml` configuration

3. **Configure Environment Variables**
   
   Set as **secrets** (not environment variables):
   ```
   MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
   MFEC_LLM_API_KEY=your_api_key_here
   MFEC_LLM_CHAT_MODEL=gpt-4o
   MFEC_LLM_EMBEDDING_MODEL=text-embedding-3-large
   ENCRYPTION_KEY=your_32_character_key_here
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   ```

4. **Deploy Service**
   - Click "Create Web Service"
   - Monitor build logs in dashboard

### Vercel Deployment

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy Application**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   
   In Vercel dashboard (https://vercel.com/dashboard):
   - Go to Project Settings → Environment Variables
   - Add variables for Production environment:
   ```
   MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
   MFEC_LLM_API_KEY=your_api_key_here
   MFEC_LLM_CHAT_MODEL=gpt-4o
   MFEC_LLM_EMBEDDING_MODEL=text-embedding-3-large
   ENCRYPTION_KEY=your_32_character_key_here
   ```

4. **Redeploy After Setting Variables**
   ```bash
   vercel --prod
   ```

## Free Tier Optimizations

### Memory Optimization

The application is optimized for free tier memory limits:

```javascript
// Node.js memory limit for 512MB containers
NODE_OPTIONS=--max-old-space-size=400

// Reduced logging in production
LOG_LEVEL=info
DEBUG_MODE=false

// Disabled telemetry
NEXT_TELEMETRY_DISABLED=1
```

### Performance Optimizations

1. **Reduced Rate Limits**
   ```
   RATE_LIMIT_REQUESTS_PER_MINUTE=10
   RATE_LIMIT_REQUESTS_PER_HOUR=100
   ```

2. **Optimized Docker Image**
   - Multi-stage build for smaller image size
   - Alpine Linux base for minimal footprint
   - Optimized dependencies installation

3. **Efficient Resource Usage**
   - Lazy loading of components
   - Optimized image processing
   - Minimal logging in production

### Storage Management

Free tier storage is limited to 1GB:

1. **Automatic Cleanup**
   - Generated documents are cleaned up after 24 hours
   - Temporary files are removed immediately
   - Logs are rotated to prevent disk full

2. **Efficient File Handling**
   - Stream processing for large files
   - Compressed document storage
   - Optimized image formats

## Security Configuration

### Environment Variables Security

**✅ Secure (Use these methods):**
- Railway: Environment variables in dashboard
- Render: Secrets in dashboard (not env vars)
- Vercel: Environment variables in project settings

**❌ Insecure (Never do this):**
- Committing `.env` files to Git
- Hardcoding API keys in code
- Using public environment variables for secrets

### API Key Management

1. **Primary API Key**
   - Set MFEC_LLM_API_KEY as secret
   - Monitor usage in MFEC dashboard
   - Rotate keys regularly

2. **Fallback System**
   - Enable user API key input: `ALLOW_USER_API_KEYS=true`
   - Users can provide their own keys when quota exceeded
   - Keys are stored in session only (not persistent)

### HTTPS and Security Headers

All platforms provide automatic HTTPS:
- Railway: Automatic SSL certificates
- Render: Free SSL with custom domains
- Vercel: Automatic HTTPS for all deployments

## Monitoring and Logging

### Basic Logging (Free Tier)

```javascript
// Optimized logging configuration
{
  "level": "info",
  "retention": "7d",
  "maxSize": "100MB",
  "format": "json"
}
```

### Health Monitoring

Health check endpoint: `/api/health`

```bash
# Check application health
curl https://your-app.railway.app/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### Platform-Specific Monitoring

1. **Railway**
   ```bash
   railway logs --follow
   railway metrics
   ```

2. **Render**
   - View logs in dashboard
   - Monitor resource usage
   - Set up alerts for downtime

3. **Vercel**
   - Function logs in dashboard
   - Analytics for performance
   - Error tracking integration

## Troubleshooting

### Common Issues

1. **Memory Limit Exceeded**
   ```
   Error: JavaScript heap out of memory
   ```
   **Solution**: Reduce NODE_OPTIONS memory limit or optimize code

2. **Cold Start Delays**
   ```
   Function timeout after 30 seconds
   ```
   **Solution**: Implement keep-alive pings or upgrade to paid tier

3. **Storage Full**
   ```
   ENOSPC: no space left on device
   ```
   **Solution**: Implement automatic cleanup or reduce file sizes

### Debug Commands

```bash
# Railway debugging
railway logs --tail 100
railway shell

# Vercel debugging
vercel logs your-deployment-url
vercel inspect your-deployment-url

# Local testing with free tier limits
docker run --memory=512m --cpus=1 thai-document-generator
```

## Cost Management

### Free Tier Limits

| Platform | Memory | CPU | Storage | Bandwidth | Builds |
|----------|--------|-----|---------|-----------|--------|
| Railway | 512MB | 1 vCPU | 1GB | $5/month usage | Unlimited |
| Render | 512MB | 0.1 CPU | 1GB | 100GB/month | 500 build minutes |
| Vercel | Serverless | Serverless | 1GB | 100GB/month | 6000 build seconds |

### Usage Optimization

1. **Reduce Build Frequency**
   - Deploy only when necessary
   - Use staging environment for testing
   - Batch multiple changes

2. **Optimize Resource Usage**
   - Enable compression
   - Use efficient algorithms
   - Implement caching where possible

3. **Monitor Usage**
   - Check platform dashboards regularly
   - Set up usage alerts
   - Plan for scaling when needed

## Scaling Beyond Free Tier

### When to Upgrade

Consider upgrading when:
- Consistent memory limit issues
- Frequent cold starts affecting UX
- Storage needs exceed 1GB
- Team size grows beyond 5 users
- Need for custom domains/SSL

### Migration Path

1. **Railway Pro**: $5/month for better resources
2. **Render Starter**: $7/month for dedicated resources
3. **Vercel Pro**: $20/month for team features
4. **Self-hosted**: Use existing Docker configuration

## Support and Resources

### Documentation Links

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### Community Support

- Railway Discord: https://discord.gg/railway
- Render Community: https://community.render.com
- Vercel Discord: https://discord.gg/vercel

### Getting Help

1. Check platform status pages
2. Review deployment logs
3. Test health check endpoint
4. Consult platform documentation
5. Contact platform support (free tier included)

---

**Note**: This guide is optimized for small teams (1-5 users) with moderate usage. For larger teams or high-traffic applications, consider upgrading to paid tiers for better performance and reliability.