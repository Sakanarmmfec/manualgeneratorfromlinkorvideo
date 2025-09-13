# Deployment Guide

This document provides comprehensive instructions for deploying the Thai Document Generator application across different environments.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Access to MFEC LLM API
- Container registry access (for production deployments)

## Environment Configuration

### 1. Environment Files

The application uses environment-specific configuration files:

- `.env.development` - Local development settings
- `.env.staging` - Staging environment settings  
- `.env.production` - Production environment settings

### 2. Required Environment Variables

```bash
# MFEC LLM Configuration
MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
MFEC_LLM_API_KEY=your_api_key_here
MFEC_LLM_CHAT_MODEL=gpt-4o
MFEC_LLM_EMBEDDING_MODEL=text-embedding-3-large

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Features
ALLOW_USER_API_KEYS=true
```

## Deployment Methods

### 1. Local Development

```bash
# Using Docker Compose
docker-compose --profile dev up -d

# Or using npm (without Docker)
npm install
npm run dev
```

Access the application at: http://localhost:3001 (Docker) or http://localhost:3000 (npm)

### 2. Staging Deployment

```bash
# Using deployment script (Linux/macOS)
./scripts/deploy.sh staging

# Using PowerShell (Windows)
.\scripts\deploy.ps1 -Environment staging

# Manual Docker Compose
docker-compose -f docker-compose.staging.yml up -d
```

### 3. Production Deployment

```bash
# Using deployment script with version tag
./scripts/deploy.sh production v1.0.0

# Using PowerShell (Windows)
.\scripts\deploy.ps1 -Environment production -Version v1.0.0

# Manual Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

## CI/CD Pipeline

### GitHub Actions Workflow

The application includes a comprehensive CI/CD pipeline that:

1. **Test Phase**: Runs tests, linting, and type checking
2. **Build Phase**: Creates Docker images for different architectures
3. **Deploy Phase**: Automatically deploys to staging/production
4. **Security Phase**: Runs security audits and secret scanning

### Required GitHub Secrets

```bash
# Container Registry (optional)
CONTAINER_REGISTRY=your-registry.com
REGISTRY_USERNAME=your-username
REGISTRY_PASSWORD=your-password

# MFEC Configuration
MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
MFEC_LLM_API_KEY=your-api-key

# Environment-specific secrets
STAGING_ENCRYPTION_KEY=staging-key
PRODUCTION_ENCRYPTION_KEY=production-key
```

## Health Monitoring

### Health Check Endpoint

The application provides a comprehensive health check at `/api/health`:

```bash
# Check application health
curl http://localhost:3000/api/health

# Simple health check (HEAD request)
curl -I http://localhost:3000/api/health
```

### Health Check Response

```json
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

## Troubleshooting

### Common Issues

1. **Container fails to start**
   - Check environment variables are properly set
   - Verify Docker has sufficient resources
   - Check logs: `docker-compose logs thai-doc-generator`

2. **Health check fails**
   - Verify MFEC API key is valid
   - Check filesystem permissions for exports directory
   - Validate environment configuration

3. **Build failures**
   - Ensure Node.js version compatibility (18+)
   - Clear Docker build cache: `docker system prune -a`
   - Check for missing dependencies

### Debugging Commands

```bash
# View container logs
docker-compose logs -f thai-doc-generator

# Execute shell in running container
docker-compose exec thai-doc-generator sh

# Check container resource usage
docker stats thai-doc-generator

# Inspect container configuration
docker inspect thai-doc-generator
```

## Security Considerations

### Production Security Checklist

- [ ] Use strong, unique encryption keys
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security audits
- [ ] Monitor for vulnerabilities
- [ ] Secure API key storage

### Environment Security

- Never commit `.env` files to version control
- Use secure key management in production
- Rotate API keys regularly
- Monitor API usage and access logs
- Implement proper access controls

## Scaling and Performance

### Resource Requirements

**Minimum Requirements:**
- CPU: 1 core
- Memory: 1GB RAM
- Storage: 10GB

**Recommended for Production:**
- CPU: 2 cores
- Memory: 2GB RAM
- Storage: 50GB SSD

### Scaling Options

1. **Vertical Scaling**: Increase container resources
2. **Horizontal Scaling**: Run multiple container instances
3. **Load Balancing**: Use reverse proxy (Traefik, Nginx)
4. **CDN**: Cache static assets

## Backup and Recovery

### Data Backup

```bash
# Backup exports directory
docker run --rm -v thai-document-generator_production_exports:/data -v $(pwd):/backup alpine tar czf /backup/exports-backup-$(date +%Y%m%d).tar.gz -C /data .

# Backup logs
docker run --rm -v thai-document-generator_production_logs:/data -v $(pwd):/backup alpine tar czf /backup/logs-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Disaster Recovery

1. **Container Recovery**: Redeploy from registry
2. **Data Recovery**: Restore from backups
3. **Configuration Recovery**: Restore environment files
4. **Rollback**: Use previous container version

## Monitoring and Alerting

### Recommended Monitoring

- Application health checks
- Container resource usage
- API response times
- Error rates and logs
- Security events

### Alerting Setup

- Health check failures
- High resource usage
- API errors
- Security incidents
- Deployment failures

## Support and Maintenance

### Regular Maintenance Tasks

- Update dependencies monthly
- Review and rotate API keys quarterly
- Monitor security advisories
- Clean up old container images
- Review and update documentation

### Comprehensive Maintenance Guide

For detailed maintenance procedures, see:
- **[Maintenance Guide](./maintenance-guide.md)** - Daily, weekly, monthly, and quarterly maintenance tasks
- **[Free Tier Troubleshooting](./troubleshooting-free-tier.md)** - Common issues and solutions for free hosting
- **[Resource Limits Guide](./free-tier-resource-limits.md)** - Platform limits and optimization strategies
- **[Deployment Validation](./deployment-validation-checklist.md)** - Complete validation checklist

### Getting Help

1. Check application logs first
2. Verify environment configuration
3. Test health check endpoint
4. Review troubleshooting guides in `/docs/`
5. Contact system administrator

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial deployment configuration |

---

For additional support or questions about deployment, please refer to the project documentation or contact the development team.