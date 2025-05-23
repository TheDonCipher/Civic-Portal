# Government Issue Tracking Portal

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.2.0-646cff.svg)
![Supabase](https://img.shields.io/badge/Supabase-2.45.6-3ecf8e.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8.svg)

A professional web platform where citizens can create, track, and collaborate on civic issues while engaging with government stakeholders through a clean, accessible interface focused on transparency and action.

![Government Issue Tracking Portal](https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Development](#-development)
  - [Running the Application](#running-the-application)
  - [Project Structure](#project-structure)
  - [Testing](#testing)
- [Deployment](#-deployment)
- [Supabase Setup](#-supabase-setup)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

### For Citizens
- **Report Issues**: Easily submit civic issues with detailed descriptions, locations, and images
- **Track Progress**: Follow the status of reported issues from submission to resolution
- **Engage with Officials**: Comment on issues and receive updates from government representatives
- **Vote on Issues**: Support important issues to help prioritize government attention
- **Propose Solutions**: Suggest ways to address community problems
- **Crowdfund Solutions**: Contribute financially to community-driven solutions

### For Government Officials
- **Issue Management**: Track, prioritize, and update the status of reported issues
- **Constituent Engagement**: Respond directly to citizen concerns and provide updates
- **Data Analytics**: Access comprehensive reports and visualizations on civic issues
- **Performance Metrics**: Monitor resolution rates, response times, and citizen satisfaction
- **Department Coordination**: Assign issues to relevant departments and track their performance

### Platform Features
- **Real-time Updates**: Instant notifications when issues are updated or commented on
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices
- **Secure Authentication**: Role-based access control with Google OAuth integration
- **Data Visualization**: Interactive charts and maps for issue analysis
- **Accessibility**: WCAG 2.1 compliant interface for all users

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 for client-side navigation
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: Shadcn UI for accessible, customizable components
- **Icons**: Lucide React for consistent, scalable icons
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Data Visualization**: Recharts for interactive, responsive charts
- **Animations**: Framer Motion for smooth UI transitions

### Backend (Supabase)
- **Database**: PostgreSQL for relational data storage
- **Authentication**: Built-in auth with social provider integration
- **Storage**: Secure file storage for issue attachments and images
- **Realtime**: WebSocket subscriptions for live updates
- **Edge Functions**: Serverless functions for custom backend logic
- **Row-Level Security**: Fine-grained access control policies

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or pnpm
- Supabase account (free tier available)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/government-issue-tracker.git
   cd government-issue-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Environment Setup

1. **Create environment file**
   
   Copy the example environment file to create your local environment configuration:
   ```bash
   cp .env.example .env.local
   ```

2. **Configure Supabase credentials**
   
   Edit the `.env.local` file and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase project settings.

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
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Shared UI components
│   │   ├── issues/       # Issue management components
│   │   ├── layout/       # Layout components (header, footer, etc.)
│   │   ├── profile/      # User profile components
│   │   ├── reports/      # Analytics and reporting components
│   │   ├── stakeholder/  # Government official interface
│   │   └── ui/           # Base UI components (shadcn)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and services
│   │   ├── api/          # API functions for data fetching
│   │   └── utils/        # Helper utilities
│   ├── providers/        # Context providers
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── cypress/              # End-to-end tests
├── supabase/             # Supabase configuration and migrations
│   └── migrations/       # Database migration files
└── public/               # Static assets
```

### Core Modules

#### Issues Module
- **Components**: `IssuesPage`, `IssueGrid`, `IssueCard`, `IssueDetailDialog`, `CreateIssueDialog`
- **Functionality**: Create, view, filter, and interact with civic issues
- **Key Files**: `src/components/issues/*`

#### Reports Module
- **Components**: `ReportsPage`, `ReportsPageWithRealtime`, `CategoryBreakdownChart`, `IssueStatusChart`, `TrendChart`
- **Functionality**: View analytics and visualizations of civic issue data
- **Key Files**: `src/components/reports/*`

#### Authentication Module
- **Components**: `AuthDialog`, `SignInForm`, `SignUpForm`, `ResetPasswordForm`
- **Functionality**: User authentication and account management
- **Key Files**: `src/components/auth/*`, `src/lib/auth.ts`, `src/providers/AuthProvider.tsx`

#### Profile Module
- **Components**: `ProfilePage`, `UserProfile`, `ProfileSettings`
- **Functionality**: View and edit user profile information
- **Key Files**: `src/components/profile/*`

#### Stakeholder Module
- **Components**: `StakeholderDashboard`, `DepartmentPerformance`, `IssueAssignment`
- **Functionality**: Government official interface for managing issues
- **Key Files**: `src/components/stakeholder/*`

### Testing

#### Unit and Integration Tests

Unit and integration tests use Jest and React Testing Library to verify component behavior and business logic.

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test -- --coverage

# Run tests for a specific file or directory
npm run test -- src/components/issues
```

#### End-to-End Tests

End-to-end tests use Cypress to simulate real user interactions and verify application flows.

```bash
# Open Cypress test runner
npm run cypress:open

# Run all E2E tests headlessly
npm run test:e2e

# Run E2E tests in CI environment
npm run test:e2e:ci
```

### Key Test Files

- **Unit/Integration Tests**:
  - `src/components/issues/__tests__/IssueGrid.test.tsx`
  - `src/components/reports/__tests__/ReportsPage.test.tsx`
  - `src/hooks/useRealtimeReports.test.ts`
  - `src/lib/api/statsApi.test.ts`
  - `src/lib/utils/__tests__/dbFunctions.test.tsx`

- **End-to-End Tests**:
  - `cypress/e2e/issues.cy.ts` - Tests issue creation and management
  - `cypress/e2e/profile.cy.ts` - Tests user profile functionality
  - `cypress/e2e/reports.cy.ts` - Tests reports and analytics
  - `cypress/e2e/realtime-reports.cy.ts` - Tests real-time data updates
  - `cypress/e2e/issue-interactions.cy.ts` - Tests user interactions with issues
  - `cypress/e2e/integration-flows.cy.ts` - Tests end-to-end user journeys
  - `cypress/e2e/reports-dashboard.cy.ts` - Tests the reports dashboard

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

## 🗄️ Supabase Setup

### Database Setup

The project includes migration files in the `supabase/migrations` directory that will set up all necessary tables, functions, and policies.

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Link to your Supabase project**
   ```bash
   supabase link --project-ref your-project-id
   ```

3. **Apply migrations**
   ```bash
   supabase db push
   ```

4. **Generate TypeScript types** (optional but recommended)
   ```bash
   npm run types:supabase
   # or
   yarn types:supabase
   # or
   pnpm types:supabase
   ```

### Key Database Tables

- `issues` - Stores all reported civic issues
- `comments` - User comments on issues
- `updates` - Official updates on issues
- `solutions` - Proposed solutions for issues
- `profiles` - User profile information
- `issue_votes` - Tracks user votes on issues
- `issue_watchers` - Tracks users watching issues

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🔧 Troubleshooting

### Common Issues

#### Supabase Connection Errors

If you see connection errors in the console:

1. Verify that your Supabase credentials are correct in your `.env.local` file
2. Check if your IP is allowed in Supabase's security settings
3. Ensure the required tables exist in your Supabase project

The application includes a `ConnectionStatus` component that will display connection status in the bottom right corner of the screen during development.

#### Realtime Subscription Issues

If realtime updates aren't working:

1. Check that `VITE_ENABLE_REALTIME` is set to `true` in your environment
2. Verify that the tables have realtime enabled in Supabase
3. Check the browser console for subscription errors

#### Build Failures

If the build process fails:

1. Ensure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npm run tsc`
3. Verify that the environment variables are correctly set

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Built with ❤️ for better civic engagement and government transparency.
