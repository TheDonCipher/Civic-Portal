# Civic Portal - Botswana Government Issue Tracking System

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-5.2.0-646cff.svg)
![Supabase](https://img.shields.io/badge/Supabase-2.45.6-3ecf8e.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8.svg)
![Cypress](https://img.shields.io/badge/Cypress-14.2.1-17202c.svg)
![Playwright](https://img.shields.io/badge/Playwright-1.40.0-2EAD33.svg)
![Vitest](https://img.shields.io/badge/Vitest-1.0.0-6E9F18.svg)

A comprehensive civic engagement platform specifically designed for Botswana, enabling citizens to report, track, and collaborate on civic issues while facilitating transparent communication with government departments and stakeholders.

![Civic Portal](https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80)

## 📋 Table of Contents

- [Features](#-features)
- [Demo Mode](#-demo-mode)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start-demo-mode)
  - [Full Installation](#full-installation)
  - [Environment Setup](#environment-setup)
- [Development](#-development)
  - [Running the Application](#running-the-application)
  - [Project Structure](#project-structure)
  - [Core Modules](#core-modules)
  - [Testing](#testing)
- [Authentication & Roles](#-authentication--roles)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [Support](#-support)
- [License](#-license)

## ✨ Features

### For Citizens

- **Report Issues**: Submit civic issues with detailed descriptions, locations, images, and categorization
- **Track Progress**: Monitor issue status from creation through resolution with real-time updates
- **Engage with Officials**: Comment on issues and receive official updates from government departments
- **Vote & Support**: Vote on issues to help prioritize government attention and resource allocation
- **Propose Solutions**: Submit detailed solutions with implementation plans and cost estimates
- **Watch Issues**: Follow issues of interest and receive notifications about updates
- **User Dashboard**: Personal dashboard showing created issues, watched issues, and activity history

### For Government Officials (Stakeholders)

- **Department Dashboard**: Specialized interface for managing department-specific issues
- **Issue Status Management**: Update issue status through workflow stages (Open → In Progress → Resolved → Closed)
- **Official Updates**: Provide formal updates on issue progress and resolution plans
- **Solution Selection**: Review and select official solutions from citizen proposals
- **Performance Analytics**: Monitor department performance metrics and response times
- **Verification System**: Secure verification process for government officials through admin approval

### For Administrators

- **User Management**: Manage user roles, permissions, and verification status
- **Department Administration**: Create and manage government departments and assignments
- **Verification Workflow**: Review and approve government official verification requests
- **System Analytics**: Access comprehensive platform statistics and usage metrics
- **Audit Logging**: Track all administrative actions for compliance and security

### Platform Features

- **Demo Mode**: Explore the platform with sample data without creating an account
- **Real-time Updates**: Live notifications and data synchronization across all users
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Role-based Access**: Secure authentication with citizen, official, and admin roles
- **Botswana Integration**: Tailored for Botswana's 18 government departments and constituencies
- **Notification System**: In-app notifications for status changes and important updates
- **Data Visualization**: Interactive charts and analytics for issue trends and performance
- **Accessibility**: WCAG 2.1 compliant interface ensuring accessibility for all users

## 🎮 Demo Mode

The Civic Portal includes a comprehensive demo mode that allows users to explore all platform features without creating an account. Demo mode provides:

### Demo Features

- **Sample Data**: Pre-populated with realistic civic issues, comments, solutions, and user interactions
- **Role Switching**: Experience the platform from different user perspectives (citizen, stakeholder, admin)
- **Interactive Experience**: Fully functional interface with simulated data updates and notifications
- **Department Simulation**: Explore how different Botswana government departments manage issues
- **No Registration Required**: Immediate access to explore platform capabilities

### How to Use Demo Mode

1. **Access**: Click the "Demo Mode" toggle in the header navigation
2. **Explore**: Browse issues, view dashboards, and interact with sample data
3. **Switch Roles**: Use the demo user selector to experience different user types
4. **Learn**: Understand the platform workflow before creating a real account

### Demo Data Includes

- **150+ Sample Issues**: Covering all major categories and departments
- **Multiple User Types**: Citizens, verified officials, and administrators
- **Department Coverage**: All 18 Botswana government departments represented
- **Realistic Interactions**: Comments, solutions, votes, and status updates
- **Performance Metrics**: Sample analytics and reporting data

## 🛠 Tech Stack

### Frontend

- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.2.0 for fast development and optimized production builds
- **Routing**: React Router v6 for client-side navigation and protected routes
- **Styling**: Tailwind CSS 3.4.1 with custom Botswana government theme
- **UI Components**: Radix UI primitives with Shadcn UI for accessible, customizable components
- **Icons**: Lucide React for consistent, scalable icons
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Data Visualization**: Recharts for interactive, responsive charts and analytics
- **Animations**: Framer Motion for smooth UI transitions and micro-interactions
- **State Management**: React Context API with custom providers for auth, demo mode, and themes

### Backend (Supabase)

- **Database**: PostgreSQL with advanced features (triggers, RLS, functions)
- **Authentication**: Built-in auth with email/password and role-based access control
- **Storage**: Secure file storage for issue attachments and user avatars
- **Realtime**: WebSocket subscriptions for live updates and notifications
- **Row-Level Security**: Fine-grained access control policies for data protection
- **Database Functions**: Custom PostgreSQL functions for complex operations
- **Migrations**: Version-controlled database schema management

### Development & Testing

- **Testing Frameworks**:
  - Cypress 14.2.1 for comprehensive end-to-end testing
  - Playwright 1.40.0 for cross-browser testing
  - Vitest 1.0.0 for unit and integration testing
  - Jest DOM for enhanced testing utilities
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Quality**: ESLint for code linting and consistency
- **Package Management**: npm with lock file for reproducible builds
- **Development Server**: Vite dev server with hot module replacement
- **Documentation**: JSDoc for API documentation generation
- **Bundle Analysis**: Rollup visualizer and bundlesize for optimization

### Deployment & DevOps

- **Containerization**: Docker with multi-stage builds for production deployment
- **Web Server**: Nginx for serving static assets and routing
- **Environment Management**: Environment-specific configurations for dev/staging/production
- **Build Optimization**: Code splitting, tree shaking, and asset optimization

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher (recommended: v18.17.0+)
- **Package Manager**: npm (included with Node.js), yarn, or pnpm
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
- **Git**: For version control and repository cloning

### Quick Start (Demo Mode)

To quickly explore the platform without setup:

1. Clone and run the application locally:
   ```bash
   git clone https://github.com/your-username/civic-portal.git
   cd civic-portal
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser
3. Click "Demo Mode" toggle in the header navigation
4. Explore all features with realistic sample data
5. Switch between different user roles (citizen, stakeholder, admin)
6. No registration or database configuration required for demo mode

### Full Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/civic-portal.git
   cd civic-portal
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**

   Create your environment configuration:

   ```bash
   cp .env.example .env.local
   ```

4. **Configure Supabase credentials**

   Edit the `.env.local` file with your Supabase project credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Find these values in your Supabase project settings under "API" section.

5. **Set up the database**

   Run the database migrations (see [Database Setup](#-database-setup) section for details):

   ```bash
   # Using Supabase CLI (recommended)
   npx supabase db push

   # Or manually run the migration files in Supabase SQL Editor
   ```

## 💻 Development

### Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser**

   Navigate to `http://localhost:5173` to see the application running.

### Project Structure

```
├── src/
│   ├── components/       # UI components organized by feature
│   │   ├── admin/        # Admin panel components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Shared UI components
│   │   ├── dashboard/    # User dashboard components
│   │   ├── demo/         # Demo mode components
│   │   ├── issues/       # Issue management components
│   │   ├── layout/       # Layout components (header, footer, etc.)
│   │   ├── notifications/# Notification system components
│   │   ├── profile/      # User profile components
│   │   ├── reports/      # Analytics and reporting components
│   │   ├── stakeholder/  # Government official interface
│   │   └── ui/           # Base UI components (Radix/Shadcn)
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts    # Authentication hook with role checking
│   │   ├── useRealtimeIssues.ts  # Real-time issue updates
│   │   └── useRealtimeReports.ts # Real-time analytics
│   ├── lib/              # Utility functions and services
│   │   ├── api/          # API functions for data fetching
│   │   ├── auth.tsx      # Authentication context and utilities
│   │   ├── demoData.ts   # Demo mode sample data
│   │   ├── supabase.ts   # Supabase client configuration
│   │   ├── utils/        # Helper utilities and security functions
│   │   └── validation/   # Form validation schemas
│   ├── providers/        # Context providers
│   │   ├── AuthProvider.tsx    # Authentication state management
│   │   ├── DemoProvider.tsx    # Demo mode state management
│   │   └── ThemeProvider.tsx   # Theme and styling management
│   ├── types/            # TypeScript type definitions
│   │   ├── supabase.ts   # Generated Supabase types
│   │   └── *.ts          # Custom type definitions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── cypress/              # End-to-end tests
│   ├── e2e/              # Test specifications
│   └── support/          # Test utilities and commands
├── docs/                 # Documentation
│   ├── project_structure_and_architecture.md
│   ├── verification-workflow-implementation.md
│   └── verification-workflow-testing.md
├── scripts/              # Utility scripts for development
├── supabase/             # Supabase configuration and migrations
│   ├── config.toml       # Supabase project configuration
│   └── migrations/       # Database migration files
├── public/               # Static assets
├── Dockerfile            # Docker configuration for deployment
├── cypress.config.ts     # Cypress testing configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.ts        # Vite build configuration
```

### Core Modules

#### Issues Module

- **Components**: `IssuesPage`, `IssueGrid`, `IssueCard`, `IssueDetailDialog`, `CreateIssueDialog`, `LatestUpdates`
- **Functionality**: Create, view, filter, and interact with civic issues with real-time updates
- **Features**: Issue creation, commenting, voting, watching, solution proposals, status tracking
- **Key Files**: `src/components/issues/*`, `src/hooks/useRealtimeIssues.ts`

#### Authentication Module

- **Components**: `AuthDialog`, `SignInForm`, `SignUpForm`, `ResetPasswordForm`
- **Functionality**: Role-based authentication with Botswana government integration
- **Features**: Email/password auth, role assignment, department selection, verification workflow
- **Key Files**: `src/components/auth/*`, `src/lib/auth.tsx`, `src/providers/AuthProvider.tsx`

#### Stakeholder Module

- **Components**: `StakeholderDashboard`, `DepartmentPerformance`, `IssueManagement`
- **Functionality**: Government official interface for department-specific issue management
- **Features**: Issue status updates, official responses, performance analytics, verification system
- **Key Files**: `src/components/stakeholder/*`

#### Admin Module

- **Components**: `AdminPage`, `UserManagement`, `DepartmentManagement`, `VerificationWorkflow`
- **Functionality**: Platform administration and user management
- **Features**: User role management, verification approval, department administration, audit logging
- **Key Files**: `src/components/admin/*`

#### Demo Module

- **Components**: `DemoUserDashboard`, `DemoStakeholderDashboard`, `DemoModeToggle`
- **Functionality**: Comprehensive demo experience with sample data
- **Features**: Role switching, sample interactions, realistic data simulation
- **Key Files**: `src/components/demo/*`, `src/providers/DemoProvider.tsx`, `src/lib/demoData.ts`

#### Reports Module

- **Components**: `ReportsPage`, `ReportsPageWithRealtime`, `CategoryBreakdownChart`, `IssueStatusChart`, `TrendChart`
- **Functionality**: Real-time analytics and visualizations of civic issue data
- **Features**: Interactive charts, department performance metrics, trend analysis
- **Key Files**: `src/components/reports/*`, `src/hooks/useRealtimeReports.ts`

#### Profile Module

- **Components**: `ProfilePage`, `UserProfile`, `ProfileSettings`, `MyIssuesPage`
- **Functionality**: User profile management and personal dashboard
- **Features**: Profile editing, issue tracking, activity history, notification preferences
- **Key Files**: `src/components/profile/*`, `src/components/dashboard/*`

#### Notification Module

- **Components**: `NotificationCenter`, `NotificationItem`, `NotificationBadge`
- **Functionality**: Real-time notification system for status updates and interactions
- **Features**: In-app notifications, status change alerts, verification updates
- **Key Files**: `src/components/notifications/*`, `src/lib/utils/notificationUtils.ts`

## 🔐 Authentication & Roles

The Civic Portal implements a comprehensive role-based authentication system tailored for Botswana's government structure.

### User Roles

#### Citizens

- **Registration**: Open registration with email verification
- **Permissions**: Create issues, comment, vote, propose solutions, watch issues
- **Dashboard**: Personal dashboard with created and watched issues
- **Verification**: Automatic verification upon email confirmation

#### Government Officials (Stakeholders)

- **Registration**: Register with department assignment from 18 Botswana departments
- **Verification Process**: Requires admin approval for verification
- **Permissions**: All citizen permissions plus issue status management, official updates
- **Dashboard**: Department-specific stakeholder dashboard with performance metrics
- **Department Assignment**: Assigned to one of the 18 government departments

#### Administrators

- **Assignment**: Manually assigned by existing administrators
- **Permissions**: Full platform access including user management and system administration
- **Capabilities**: User role management, verification workflow, department administration
- **Audit Trail**: All admin actions are logged for compliance

### Botswana Government Departments

The platform supports all 18 official Botswana government departments:

1. Finance
2. International Relations
3. Health
4. Child Welfare and Basic Education
5. Higher Education
6. Lands and Agriculture
7. Youth and Gender Affairs
8. State Presidency
9. Justice and Correctional Services
10. Local Government and Traditional Affairs
11. Minerals and Energy
12. Communications and Innovation
13. Environment and Tourism
14. Labour and Home Affairs
15. Sports and Arts
16. Trade and Entrepreneurship
17. Transport and Infrastructure
18. Water and Human Settlement

### Verification Workflow

#### For Government Officials

1. **Registration**: Official registers and selects their department
2. **Pending Status**: Account created with "pending" verification status
3. **Admin Review**: Administrator reviews the verification request
4. **Approval/Rejection**: Admin approves or rejects with notification sent
5. **Access Granted**: Verified officials gain access to stakeholder dashboard

#### Security Features

- **Role-based Access Control**: Strict permission checking for all operations
- **Session Management**: Secure session handling with automatic expiration
- **Data Protection**: Row-level security policies in database
- **Audit Logging**: Comprehensive logging of all administrative actions
- **Input Validation**: Server-side validation for all user inputs

### Testing

The Civic Portal includes comprehensive testing coverage with multiple testing frameworks for different testing needs.

#### Testing Frameworks

**End-to-End Tests (Cypress)**

```bash
# Open Cypress test runner (interactive mode)
npm run cypress:open

# Run all Cypress E2E tests headlessly
npm run cypress:run

# Run E2E tests with server startup
npm run test:e2e:ci
```

**Cross-Browser Tests (Playwright)**

```bash
# Run Playwright tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

**Unit & Integration Tests (Vitest)**

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

#### Test Coverage

The test suite covers all major user flows and features:

- **Authentication Tests** (`cypress/e2e/auth.cy.ts`)

  - User registration and login
  - Role-based access control
  - Password reset functionality

- **Issue Management Tests** (`cypress/e2e/issues.cy.ts`)

  - Issue creation and editing
  - Commenting and voting
  - Status updates and filtering

- **User Interactions** (`cypress/e2e/issue-interactions.cy.ts`)

  - Issue watching and notifications
  - Solution proposals
  - User engagement features

- **Profile Management** (`cypress/e2e/profile.cy.ts`)

  - Profile editing and settings
  - User dashboard functionality
  - Activity tracking

- **Reports and Analytics** (`cypress/e2e/reports.cy.ts`, `cypress/e2e/realtime-reports.cy.ts`)

  - Dashboard analytics
  - Real-time data updates
  - Chart interactions and filtering

- **Integration Flows** (`cypress/e2e/integration-flows.cy.ts`)

  - Complete user journeys
  - Cross-feature interactions
  - End-to-end workflows

- **Home Page** (`cypress/e2e/home.cy.ts`)
  - Landing page functionality
  - Navigation and routing
  - Demo mode access

#### Test Configuration

- **Base URL**: `http://localhost:5173`
- **Viewport**: 1280x720 (configurable)
- **Timeouts**: 10 seconds default command timeout
- **Screenshots**: Enabled on test failures
- **Video Recording**: Disabled by default (can be enabled for CI)

## 🚢 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deployment Options

#### Build for Production

```bash
npm run build:prod
# or
yarn build:prod
# or
pnpm build:prod
```

This creates a `dist` directory with optimized production files.

#### Docker Deployment

```bash
# Build Docker image
docker build -t gov-issue-tracker .

# Run Docker container
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  gov-issue-tracker
```

## 🗄️ Database Setup

The Civic Portal uses Supabase as its backend database with PostgreSQL. The database schema includes comprehensive tables, functions, and security policies.

### Quick Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Install Supabase CLI** (recommended method)

   ```bash
   # Using npm
   npm install -g supabase

   # Using npx (no global installation)
   npx supabase --version
   ```

3. **Link to your Supabase project**

   ```bash
   npx supabase link --project-ref your-project-id
   ```

4. **Apply database migrations**

   ```bash
   # Push all migrations to your Supabase project
   npx supabase db push
   ```

5. **Generate TypeScript types** (recommended)

   ```bash
   npm run types:supabase
   ```

### Manual Setup (Alternative)

If you prefer to set up the database manually:

1. Copy the contents of `supabase/migrations/manual_setup.sql`
2. Run it in your Supabase SQL Editor
3. This will create all necessary tables, functions, and policies

### Database Schema

#### Core Tables

- **`profiles`** - User profile information with roles and verification status
- **`departments`** - Botswana government departments
- **`issues`** - Civic issues with categorization and status tracking
- **`comments`** - User comments on issues
- **`updates`** - Official updates from government stakeholders
- **`solutions`** - Proposed solutions for issues
- **`notifications`** - In-app notification system
- **`audit_logs`** - Administrative action logging

#### Relationship Tables

- **`issue_votes`** - User votes on issues
- **`issue_watchers`** - Users watching specific issues
- **`solution_votes`** - User votes on proposed solutions

#### Key Features

- **Row-Level Security (RLS)**: Comprehensive security policies for data protection
- **Real-time Subscriptions**: Enabled for live updates across the platform
- **Database Functions**: Custom PostgreSQL functions for complex operations
- **Triggers**: Automated actions for data consistency and notifications
- **Indexes**: Optimized for performance with proper indexing strategy

### Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 API Documentation

The Civic Portal uses a service-oriented architecture with well-organized API functions for all data operations.

### API Structure

All API functions are located in `src/lib/api/` and organized by domain:

- **`issuesApi.ts`** - Issue CRUD operations, filtering, and status management
- **`commentsApi.ts`** - Comment creation, retrieval, and management
- **`solutionsApi.ts`** - Solution proposals and voting
- **`statsApi.ts`** - Analytics, reports, and dashboard statistics
- **`userApi.ts`** - User profile management and authentication
- **`notificationsApi.ts`** - Notification system operations

### Key API Features

#### Real-time Subscriptions

```typescript
// Example: Subscribe to issue updates
const subscription = supabase
  .channel('issues-realtime')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'issues' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

#### Error Handling

All API functions include comprehensive error handling with user-friendly messages and logging.

#### Type Safety

Full TypeScript coverage with generated Supabase types ensures type safety across all API operations.

#### Security

- Row-level security policies enforce data access controls
- Input validation and sanitization
- Authentication checks for all protected operations

For detailed API documentation, see the individual API files in `src/lib/api/`.

## 📚 Documentation

The Civic Portal includes comprehensive documentation covering all aspects of the platform:

### Core Documentation

- **[README.md](README.md)** - Main project overview and setup guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and development workflow
- **[API.md](docs/API.md)** - Complete API documentation with examples
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment guide for various environments
- **[SECURITY.md](docs/SECURITY.md)** - Security architecture and best practices

### Technical Documentation

- **[Project Structure](docs/project_structure_and_architecture.md)** - Detailed architecture overview
- **[Technical Implementation Guide](docs/TECHNICAL_IMPLEMENTATION_GUIDE.md)** - Implementation details and patterns
- **[Performance Optimization](docs/PERFORMANCE_OPTIMIZATION.md)** - Performance best practices
- **[Verification Workflow](docs/verification-workflow-implementation.md)** - Official verification process

### Feature Documentation

- **[Features Documentation](docs/Features%20Documentation%20-%20Civic%20Portal.md)** - Comprehensive feature overview
- **[Comprehensive Review](docs/COMPREHENSIVE_REVIEW_AND_IMPLEMENTATION_PLAN.md)** - Codebase review and improvement plan

### Legal Documentation

- **[Privacy Policy](docs/DRAFT%20TEMPLATE%20-%20Privacy%20Policy%20-%20Botswana%20Civic%20Portal.md)** - Privacy policy template
- **[Terms of Service](<docs/DRAFT%20TEMPLATE%20-%20Terms%20of%20Service%20(ToS)%20-%20Botswana%20Civic%20Portal.md>)** - Terms of service template

### Generated Documentation

Generate API documentation from code comments:

```bash
# Generate JSDoc documentation
npm run docs:generate

# Serve documentation locally
npm run docs:serve
```

The generated documentation will be available at `http://localhost:8080`.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues

**Problem**: Connection errors or authentication failures with Supabase

**Solutions**:

1. Verify Supabase credentials in `.env.local` are correct
2. Check that your Supabase project is active and not paused
3. Ensure database migrations have been applied (`npx supabase db push`)
4. Verify your IP address is allowed in Supabase security settings

#### Real-time Features Not Working

**Problem**: Live updates, notifications, or real-time data sync not functioning

**Solutions**:

1. Check that real-time is enabled for your tables in Supabase
2. Verify WebSocket connections in browser developer tools
3. Ensure proper subscription cleanup in React components
4. Check browser console for subscription errors

#### Demo Mode Issues

**Problem**: Demo mode not loading or displaying incorrect data

**Solutions**:

1. Clear browser cache and local storage
2. Check that demo data is properly loaded in `src/lib/demoData.ts`
3. Verify demo mode toggle state in browser developer tools
4. Refresh the page to reset demo state

#### Authentication Problems

**Problem**: Login failures, role assignment issues, or verification workflow problems

**Solutions**:

1. Check email verification status in Supabase Auth dashboard
2. Verify user roles are correctly assigned in the profiles table
3. Ensure verification workflow is properly configured
4. Check admin permissions for verification approval

#### Build and Development Issues

**Problem**: Build failures, TypeScript errors, or development server issues

**Solutions**:

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Verify all environment variables are set correctly
4. Update dependencies if needed: `npm update`
5. Clear Vite cache: `rm -rf node_modules/.vite`
6. Check for port conflicts: Ensure port 5173 is available
7. Verify Node.js version: Use Node.js 18 or higher

#### Testing Issues

**Problem**: Test failures or testing framework issues

**Solutions**:

1. **Cypress Issues**:

   - Clear Cypress cache: `npx cypress cache clear`
   - Update browser: Ensure latest browser versions
   - Check test data: Verify test database state

2. **Playwright Issues**:

   - Install browsers: `npx playwright install`
   - Check browser dependencies: `npx playwright install-deps`
   - Verify test configuration in `playwright.config.ts`

3. **Vitest Issues**:
   - Clear test cache: `npm run test -- --clearCache`
   - Check test environment: Verify jsdom configuration
   - Update test dependencies: Check for version conflicts

#### Performance Issues

**Problem**: Slow loading times or poor performance

**Solutions**:

1. Check network tab in browser developer tools for slow requests
2. Verify database indexes are properly configured
3. Optimize image sizes and formats
4. Enable browser caching for static assets
5. Consider implementing pagination for large data sets

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/your-username/civic-portal/issues) for similar problems
2. Review the browser console for error messages
3. Check Supabase logs in your project dashboard
4. Create a new issue with detailed error information and steps to reproduce

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🌟 Acknowledgments

- **Botswana Government**: For the inspiration to create a platform that enhances civic engagement
- **Supabase**: For providing an excellent backend-as-a-service platform
- **React Community**: For the amazing ecosystem of tools and libraries
- **Open Source Contributors**: For the countless libraries that make this project possible

## 📞 Support

For support and questions:

### Documentation Resources

- **[Complete Documentation](docs/)** - Comprehensive guides and references
- **[API Documentation](docs/API.md)** - Detailed API reference with examples
- **[Troubleshooting Guide](#-troubleshooting)** - Common issues and solutions
- **[Contributing Guide](CONTRIBUTING.md)** - Development and contribution guidelines

### Community Support

- **[GitHub Issues](https://github.com/your-username/civic-portal/issues)** - Report bugs or request features
- **[GitHub Discussions](https://github.com/your-username/civic-portal/discussions)** - Community discussions and Q&A
- **[Security Issues](SECURITY.md)** - Report security vulnerabilities privately

### Development Support

- **Code Reviews**: Submit pull requests for community review
- **Feature Requests**: Use GitHub Issues with the "enhancement" label
- **Bug Reports**: Include detailed reproduction steps and environment info
- **Documentation**: Help improve documentation through pull requests

### Getting Help

1. **Check Documentation**: Review relevant documentation first
2. **Search Issues**: Look for existing solutions in GitHub Issues
3. **Ask Questions**: Use GitHub Discussions for general questions
4. **Report Bugs**: Create detailed bug reports with reproduction steps
5. **Request Features**: Propose new features with clear use cases

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/TheDonCipher/Civic-Portal?utm_source=oss&utm_medium=github&utm_campaign=TheDonCipher%2FCivic-Portal&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
---

**Built with ❤️ for better civic engagement and government transparency in Botswana.**

_Empowering citizens and government to work together for a better tomorrow._
