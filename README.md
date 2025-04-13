# Government Issue Tracking Portal

## Project Overview

The Government Issue Tracking Portal is a professional web platform where citizens can create, track, and collaborate on civic issues while engaging with government stakeholders through a clean, accessible interface focused on transparency and action.

This platform bridges the gap between citizens and government entities by providing a structured way to report, discuss, and resolve community issues. It emphasizes transparency, accountability, and collaborative problem-solving.

![Government Issue Tracking Portal](https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80)

## Key Features

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

## Tech Stack

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

## Getting Started

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

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

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

## Application Structure

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

## Testing

The project includes comprehensive testing at multiple levels to ensure reliability and maintainability.

### Unit and Integration Tests

Unit and integration tests use Jest and React Testing Library to verify component behavior and business logic.

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test -- --coverage

# Run tests for a specific file or directory
npm run test -- src/components/issues
```

### End-to-End Tests

End-to-end tests use Cypress to simulate real user interactions and verify application flows.

```bash
# Open Cypress test runner
npm run cypress:open

# Run all E2E tests headlessly
npm run test:e2e
```

### Key Test Files

- **Unit/Integration Tests**:
  - `src/components/issues/__tests__/IssueGrid.test.tsx`
  - `src/components/reports/__tests__/ReportsPage.test.tsx`
  - `src/hooks/useRealtimeReports.test.ts`
  - `src/lib/api/statsApi.test.ts`
  - `src/lib/utils/__tests__/dbFunctions.test.tsx`

- **End-to-End Tests**:
  - `cypress/e2e/home.cy.ts` - Tests the home page and navigation
  - `cypress/e2e/auth.cy.ts` - Tests authentication flows
  - `cypress/e2e/issues.cy.ts` - Tests issue creation and management
  - `cypress/e2e/profile.cy.ts` - Tests user profile functionality
  - `cypress/e2e/reports.cy.ts` - Tests reports and analytics
  - `cypress/e2e/realtime-reports.cy.ts` - Tests real-time data updates
  - `cypress/e2e/issue-interactions.cy.ts` - Tests user interactions with issues
  - `cypress/e2e/integration-flows.cy.ts` - Tests end-to-end user journeys

## Deployment

The application can be deployed using various methods depending on your requirements.

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This creates a `dist` directory with optimized production files.

### Deployment Options

#### 1. Static Hosting (Recommended)

Deploy to Vercel, Netlify, or GitHub Pages for a simple, scalable solution.

**Vercel Deployment**
```bash
npm install -g vercel
vercel login
vercel
```

**Netlify Deployment**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### 2. Docker Deployment

Use the included Dockerfile for containerized deployment to any cloud provider.

```bash
# Build Docker image
docker build -t gov-issue-tracker .

# Run Docker container
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  gov-issue-tracker
```

**Docker Compose**

Create a `docker-compose.yml` file:
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
```

Then run:
```bash
docker-compose up -d
```

#### 3. Manual Deployment

Copy the `dist` directory to any web server that can serve static files.

**Nginx Configuration Example**
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

## Advanced Features

### Realtime Updates

The application uses Supabase's realtime subscriptions to provide live updates for:

- New issues and comments
- Status changes and updates
- Votes and watches
- Analytics and reports

Key implementation files:
- `src/hooks/useRealtimeIssues.ts`
- `src/hooks/useRealtimeComments.ts`
- `src/hooks/useRealtimeReports.ts`

### Data Visualization

The reports section uses Recharts to create interactive visualizations:

- Bar charts for category distribution
- Pie charts for status breakdown
- Line charts for trend analysis
- Area charts for time-series data

Key implementation files:
- `src/components/reports/CategoryBreakdownChart.tsx`
- `src/components/reports/IssueStatusChart.tsx`
- `src/components/reports/TrendChart.tsx`

### Authentication and Authorization

The application uses Supabase Auth with:

- Email/password authentication
- Google OAuth integration
- Role-based access control
- Protected routes for authenticated users

Key implementation files:
- `src/lib/auth.ts`
- `src/providers/AuthProvider.tsx`
- `src/components/auth/ProtectedRoute.tsx`

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests to ensure everything works**
   ```bash
   npm run test
   npm run test:e2e
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style and organization
- Write unit tests for new features
- Use Tailwind CSS for styling
- Follow component-based architecture
- Document new features and changes

## License

This project is licensed under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository or contact the project maintainers.

---

Built with ❤️ for better civic engagement and government transparency.
