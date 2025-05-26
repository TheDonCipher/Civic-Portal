# Deployment Guide - Civic Portal

This guide provides comprehensive instructions for deploying the Civic Portal to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Production Considerations](#production-considerations)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Docker**: Version 20.10 or higher
- **Node.js**: Version 18 or higher (for local builds)
- **Supabase Project**: Configured with all necessary tables and policies
- **Domain**: For production deployment (optional for development)

### Required Services

- **Supabase**: Backend database and authentication
- **Container Registry**: For storing Docker images (Docker Hub, AWS ECR, etc.)
- **Web Server**: Nginx (included in Docker image) or external load balancer

## Environment Configuration

### Environment Variables

Create environment-specific configuration files:

#### Production (.env.production)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Application Configuration
VITE_APP_ENV=production
VITE_APP_URL=https://your-domain.com

# Feature Flags
VITE_ENABLE_REALTIME=true
VITE_ENABLE_ANALYTICS=true
```

#### Staging (.env.staging)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_anon_key

# Application Configuration
VITE_APP_ENV=staging
VITE_APP_URL=https://staging.your-domain.com

# Feature Flags
VITE_ENABLE_REALTIME=true
VITE_ENABLE_ANALYTICS=false
```

### Build Configuration

The project includes environment-specific build scripts:

```bash
# Production build
npm run build:prod

# Staging build
npm run build:staging

# Development build
npm run build
```

## Docker Deployment

### Building the Docker Image

1. **Build the image**:
   ```bash
   docker build -t civic-portal:latest .
   ```

2. **Build with specific environment**:
   ```bash
   # For production
   docker build --build-arg NODE_ENV=production -t civic-portal:prod .
   
   # For staging
   docker build --build-arg NODE_ENV=staging -t civic-portal:staging .
   ```

### Running the Container

#### Basic Deployment
```bash
docker run -d \
  --name civic-portal \
  -p 80:80 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  civic-portal:latest
```

#### Production Deployment with SSL
```bash
docker run -d \
  --name civic-portal-prod \
  -p 80:80 \
  -p 443:443 \
  -v /path/to/ssl/certs:/etc/nginx/ssl \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  civic-portal:prod
```

### Docker Compose

Create a `docker-compose.yml` for easier management:

```yaml
version: '3.8'

services:
  civic-portal:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    volumes:
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Deploy with:
```bash
docker-compose up -d
```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS

1. **Create ECR repository**:
   ```bash
   aws ecr create-repository --repository-name civic-portal
   ```

2. **Build and push image**:
   ```bash
   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and tag
   docker build -t civic-portal .
   docker tag civic-portal:latest your-account.dkr.ecr.us-east-1.amazonaws.com/civic-portal:latest
   
   # Push
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/civic-portal:latest
   ```

3. **Create ECS task definition** with environment variables
4. **Deploy to ECS service** with load balancer

#### Using AWS App Runner

1. **Create apprunner.yaml**:
   ```yaml
   version: 1.0
   runtime: docker
   build:
     commands:
       build:
         - echo "Build completed"
   run:
     runtime-version: latest
     command: nginx -g 'daemon off;'
     network:
       port: 80
       env:
         - VITE_SUPABASE_URL
         - VITE_SUPABASE_ANON_KEY
   ```

2. **Deploy via AWS Console** or CLI

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configure vercel.json**:
   ```json
   {
     "buildCommand": "npm run build:prod",
     "outputDirectory": "dist",
     "framework": "vite",
     "env": {
       "VITE_SUPABASE_URL": "@supabase-url",
       "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
     }
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Netlify Deployment

1. **Configure netlify.toml**:
   ```toml
   [build]
     command = "npm run build:prod"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Git integration** or Netlify CLI

## Production Considerations

### Performance Optimization

1. **Enable Gzip compression** in Nginx configuration
2. **Configure caching headers** for static assets
3. **Implement CDN** for global content delivery
4. **Optimize images** and use WebP format where possible
5. **Enable HTTP/2** for improved performance

### Security

1. **SSL/TLS Configuration**:
   - Use strong cipher suites
   - Enable HSTS headers
   - Configure proper certificate chain

2. **Security Headers**:
   ```nginx
   add_header X-Frame-Options DENY;
   add_header X-Content-Type-Options nosniff;
   add_header X-XSS-Protection "1; mode=block";
   add_header Referrer-Policy strict-origin-when-cross-origin;
   ```

3. **Environment Security**:
   - Use secrets management for sensitive data
   - Implement proper access controls
   - Regular security updates

### Monitoring

1. **Health Checks**:
   - Application health endpoint
   - Database connectivity checks
   - External service availability

2. **Logging**:
   - Application logs
   - Access logs
   - Error tracking

3. **Metrics**:
   - Response times
   - Error rates
   - User engagement metrics

## Monitoring and Maintenance

### Health Monitoring

Implement health check endpoints:

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### Backup Strategy

1. **Database Backups**:
   - Automated Supabase backups
   - Point-in-time recovery
   - Cross-region backup storage

2. **Application Backups**:
   - Source code in version control
   - Docker images in registry
   - Configuration backups

### Update Process

1. **Staging Deployment**:
   - Deploy to staging environment
   - Run automated tests
   - Manual testing and validation

2. **Production Deployment**:
   - Blue-green deployment strategy
   - Rolling updates with health checks
   - Rollback procedures

## Troubleshooting

### Common Issues

#### Container Won't Start
- Check environment variables
- Verify Supabase connectivity
- Review container logs: `docker logs civic-portal`

#### SSL Certificate Issues
- Verify certificate validity
- Check certificate chain
- Ensure proper Nginx configuration

#### Performance Issues
- Monitor resource usage
- Check database query performance
- Analyze network latency

### Debugging

1. **Container Debugging**:
   ```bash
   # Access container shell
   docker exec -it civic-portal /bin/sh
   
   # Check Nginx configuration
   nginx -t
   
   # View logs
   tail -f /var/log/nginx/access.log
   ```

2. **Application Debugging**:
   - Enable debug logging
   - Use browser developer tools
   - Monitor Supabase logs

### Support

For deployment issues:
1. Check this documentation
2. Review GitHub issues
3. Contact the development team
4. Check cloud provider documentation

---

This deployment guide ensures reliable and secure deployment of the Civic Portal across various environments.
