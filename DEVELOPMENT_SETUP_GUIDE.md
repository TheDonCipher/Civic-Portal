# Civic Portal - Development Environment Setup Guide

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **Windows**: Windows 10/11 (WSL2 recommended for optimal performance)

### Required Accounts
- **Supabase Account**: For database and authentication
- **GitHub Account**: For version control and CI/CD

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/civic-portal.git
cd civic-portal
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Verify installation
npm run --version
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup with Supabase CLI

#### Install Supabase CLI (Windows)
```bash
# Using npm (recommended for Windows)
npx supabase --version

# Alternative: Download from GitHub releases
# https://github.com/supabase/cli/releases
```

#### Initialize Local Development
```bash
# Start local Supabase instance
npx supabase start

# Apply database migrations
npx supabase db reset

# Generate TypeScript types
npm run types:supabase
```

### 5. Start Development Server
```bash
# Start the development server
npm run dev

# Application will be available at http://localhost:5173
```

## Detailed Setup Instructions

### Database Configuration

#### 1. Create Supabase Project
1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key
4. Configure authentication settings

#### 2. Apply Security Configurations
```bash
# Apply enhanced security policies
npx supabase db push

# Run security hardening script
psql -h your-db-host -U postgres -d your-db-name -f security-hardened-configs/database-security.sql
```

#### 3. Seed Development Data
```bash
# Run database seeding
npm run db:seed

# Or manually in Supabase SQL Editor
# Copy contents from src/utils/seedData.ts
```

### Security Setup

#### 1. Install Security Dependencies
```bash
# Install DOMPurify for XSS protection
npm install dompurify
npm install --save-dev @types/dompurify

# Install additional security packages
npm install helmet express-rate-limit
```

#### 2. Configure Content Security Policy
```typescript
// Add to your main.tsx or App.tsx
import { generateCSPHeader } from './security-hardened-configs/enhanced-security';

// Set CSP meta tag
const cspMeta = document.createElement('meta');
cspMeta.httpEquiv = 'Content-Security-Policy';
cspMeta.content = generateCSPHeader();
document.head.appendChild(cspMeta);
```

#### 3. Environment Security
```bash
# Create secure environment file
touch .env.local

# Add security-focused variables
echo "VITE_ENABLE_SECURITY_HEADERS=true" >> .env.local
echo "VITE_ENABLE_RATE_LIMITING=true" >> .env.local
echo "VITE_LOG_SECURITY_EVENTS=true" >> .env.local
```

### Testing Setup

#### 1. Unit Tests with Vitest
```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

#### 2. E2E Tests with Cypress
```bash
# Install Cypress dependencies
npm install cypress @testing-library/cypress

# Open Cypress test runner
npm run cypress:open

# Run headless tests
npm run cypress:run
```

#### 3. Cross-Browser Testing with Playwright
```bash
# Install Playwright
npm install @playwright/test

# Install browser binaries
npx playwright install

# Run Playwright tests
npm run test:e2e
```

### Performance Optimization

#### 1. Bundle Analysis
```bash
# Analyze bundle size
npm run analyze:bundle

# Check for unused dependencies
npm run analyze:deps

# Monitor bundle size limits
npm run analyze:size
```

#### 2. Development Tools
```bash
# Enable React DevTools Profiler
# Install React DevTools browser extension

# Enable performance monitoring
# Set VITE_ENABLE_PERFORMANCE_MONITORING=true in .env.local
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run test
npm run lint

# Commit with conventional commits
git commit -m "feat: add new security feature"
```

### 2. Code Quality Checks
```bash
# Run linting
npm run lint

# Run type checking
npm run build

# Run all tests
npm run test:run
npm run test:e2e
```

### 3. Security Validation
```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm audit fix

# Validate security configurations
npm run security:check
```

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Issues
```bash
# Check Supabase status
npx supabase status

# Reset local database
npx supabase db reset

# Check environment variables
echo $VITE_SUPABASE_URL
```

#### 2. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use Node Version Manager (Windows)
# Install nvm-windows from GitHub
nvm install 18
nvm use 18
```

#### 3. Permission Issues (Windows)
```bash
# Run as administrator if needed
# Or use WSL2 for better compatibility

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Conflicts
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <process_id> /F

# Use different port
npm run dev -- --port 3000
```

### Performance Issues

#### 1. Slow Development Server
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart development server
npm run dev
```

#### 2. Memory Issues
```bash
# Increase Node.js memory limit
set NODE_OPTIONS=--max-old-space-size=4096

# Or in package.json scripts
"dev": "node --max-old-space-size=4096 node_modules/vite/bin/vite.js"
```

## Production Deployment

### 1. Build for Production
```bash
# Create production build
npm run build:prod

# Test production build locally
npm run preview
```

### 2. Docker Deployment
```bash
# Build Docker image
docker build -t civic-portal .

# Run container
docker run -p 80:80 civic-portal
```

### 3. Security Checklist
- [ ] Environment variables configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Database RLS policies applied
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and logging enabled

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Security Best Practices](./security-hardened-configs/README.md)

## Support

For development support:
1. Check existing GitHub issues
2. Review documentation
3. Contact development team
4. Create new issue with detailed description
