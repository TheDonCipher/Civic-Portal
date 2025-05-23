# Deployment Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Static Hosting (Vercel/Netlify)](#static-hosting-vercelnetlify)
  - [Docker Deployment](#docker-deployment)
  - [Manual Deployment](#manual-deployment)
- [Supabase Configuration](#supabase-configuration)
- [Environment Variables](#environment-variables)
- [Continuous Integration/Deployment](#continuous-integrationdeployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the Government Issue Tracking Portal, ensure you have:

1. A Supabase project set up with the required tables and functions
2. Access to the necessary environment variables
3. Node.js v16+ and npm/yarn/pnpm for building the application
4. Git for version control
5. Access to your chosen deployment platform (Vercel, Netlify, Docker-capable hosting, etc.)

## Environment Setup

The application uses different environment configurations for different deployment stages:

- `.env.development` - Local development settings
- `.env.staging` - Staging environment settings
- `.env.production` - Production environment settings

Ensure these files are properly configured with the appropriate Supabase credentials and feature flags.

## Deployment Options

### Static Hosting (Vercel/Netlify)

#### Vercel Deployment

1. Connect your repository to Vercel
2. Configure the build settings:
   - Build Command: `npm run build:prod` (or `yarn build:prod`)
   - Output Directory: `dist`
3. Add the required environment variables in the Vercel project settings
4. Deploy

```bash
# Or deploy using Vercel CLI
vercel login
vercel --prod
```

#### Netlify Deployment

1. Connect your repository to Netlify
2. Configure the build settings:
   - Build Command: `npm run build:prod` (or `yarn build:prod`)
   - Publish Directory: `dist`
3. Add the required environment variables in the Netlify project settings
4. Deploy

```bash
# Or deploy using Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Docker Deployment

The application includes a Dockerfile for containerized deployment:

```bash
# Build the Docker image
docker build -t gov-issue-tracker .

# Run the container
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  gov-issue-tracker
```

#### Using Docker Compose

Create or update the `docker-compose.yml` file:

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_SUPABASE_URL=your_supabase_url
      - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
      - VITE_ENABLE_REALTIME=true
      - VITE_ENABLE_ANALYTICS=true
```

Then run:

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the application for the target environment:

```bash
# For staging
npm run build:staging

# For production
npm run build:prod
```

2. Copy the contents of the `dist` directory to your web server

3. Configure your web server to serve the application

#### Nginx Configuration Example

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## Supabase Configuration

Ensure your Supabase project is properly configured:

1. Run all migrations to set up the database schema:

```bash
supabase link --project-ref your-project-id
supabase db push
```

2. Configure authentication providers if needed (Google OAuth, etc.)

3. Set up storage buckets for file uploads

4. Enable realtime functionality for the required tables

## Environment Variables

The following environment variables are required for deployment:

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_SUPABASE_URL | Your Supabase project URL | Yes |
| VITE_SUPABASE_ANON_KEY | Your Supabase anonymous key | Yes |
| SUPABASE_SERVICE_KEY | Your Supabase service key (for server operations) | For some features |
| SUPABASE_PROJECT_ID | Your Supabase project ID | For some features |
| VITE_ENABLE_REALTIME | Enable realtime subscriptions (true/false) | No (defaults to true) |
| VITE_ENABLE_ANALYTICS | Enable analytics features (true/false) | No (defaults to false) |
| VITE_SHOW_CONNECTION_STATUS | Show connection status indicator (true/false) | No (defaults to false in production) |

## Continuous Integration/Deployment

The project can be set up for CI/CD using GitHub Actions or other CI/CD platforms.

To set up CI/CD with GitHub Actions:

1. Create workflow files in the `.github/workflows` directory
2. Add the required secrets to your GitHub repository settings
3. Push changes to the main branch to trigger the deployment workflow

Example workflow files can be created for:
- Linting and testing on pull requests
- Building and deploying on merges to main branch

## Post-Deployment Verification

After deploying, verify that:

1. The application loads correctly
2. Authentication works
3. Realtime updates are functioning
4. Issues can be created and viewed
5. Reports are generated correctly

You can run the Cypress tests against the deployed application:

```bash
CYPRESS_BASE_URL=https://your-deployed-app.com npm run cypress:run
```

## Troubleshooting

### Common Issues

#### Supabase Connection Errors

If you see connection errors in the console:

1. Verify that your Supabase credentials are correct
2. Check if your IP is allowed in Supabase's security settings
3. Ensure the required tables exist in your Supabase project

#### Realtime Subscription Issues

If realtime updates aren't working:

1. Check that `VITE_ENABLE_REALTIME` is set to `true`
2. Verify that the tables have realtime enabled in Supabase
3. Check the browser console for subscription errors

#### Build Failures

If the build process fails:

1. Ensure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npm run tsc`
3. Verify that the environment variables are correctly set
