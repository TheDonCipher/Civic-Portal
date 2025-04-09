# Government Issue Tracking Portal

## Project Overview

The Government Issue Tracking Portal is a professional web platform where citizens can create, track, and collaborate on civic issues while engaging with government stakeholders through a clean, accessible interface focused on transparency and action.

This platform bridges the gap between citizens and government entities by providing a structured way to report, discuss, and resolve community issues. It emphasizes transparency, accountability, and collaborative problem-solving.

## Features

- **Issue Management**: Create, view, filter, and track civic issues
- **Collaborative Solutions**: Comment on issues, propose solutions, and vote on proposals
- **Stakeholder Engagement**: Direct interaction between citizens and government representatives
- **Crowdfunding**: Support solutions through PayPal and Web3 wallet integrations
- **User Authentication**: Secure login via Google OAuth with role-based permissions
- **Real-time Updates**: Stay informed about issue status changes and new comments
- **Data Visualization**: View reports and statistics about issue resolution and community engagement
- **Responsive Design**: Accessible on desktop and mobile devices

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router v6
- Tailwind CSS
- Shadcn UI Components
- Lucide React Icons
- React Hook Form with Zod validation
- Recharts for data visualization

### Backend
- Supabase
  - PostgreSQL Database
  - Authentication
  - Storage
  - Realtime subscriptions

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd government-issue-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Generate Supabase types (after setting up your database)
   ```bash
   npm run types:supabase
   # or
   yarn types:supabase
   ```

### Database Setup

The project includes migration files in the `supabase/migrations` directory. These migrations will set up all necessary tables, functions, and policies for the application.

1. Apply migrations to your Supabase project
   ```bash
   npx supabase db push
   ```

## Developer Notes

### Project Structure

- `src/components`: UI components organized by feature
- `src/lib`: Utility functions, API calls, and Supabase client
- `src/hooks`: Custom React hooks
- `src/providers`: Context providers (Auth, Theme)
- `src/types`: TypeScript type definitions
- `supabase/migrations`: Database migration files

For a comprehensive analysis of the project's structure and architecture, see the [Project Structure and Architecture](docs/project_structure_and_architecture.md) document.

### Key Components

- `IssuesPage`: Main page for viewing and filtering issues
- `IssueGrid`: Displays issues in a responsive grid layout
- `IssueCard`: Individual issue card with summary information
- `IssueDetailDialog`: Detailed view of an issue with tabs for comments, solutions, and updates
- `CreateIssueDialog`: Form for submitting new issues
- `AuthDialog`: Handles user authentication
- `StakeholderDashboard`: Interface for government representatives

### State Management

The application uses React Context for global state management:

- `AuthProvider`: Manages user authentication state
- `IssueProvider`: Manages issue data and interactions

### Realtime Updates

Supabase realtime subscriptions are used to provide live updates for:

- New issues
- Comments
- Status changes
- Votes

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style and organization
- Use TypeScript for type safety
- Write unit tests for new features
- Use Tailwind CSS for styling
- Follow component-based architecture

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the types if you've modified the database schema
3. The PR will be merged once it has been reviewed and approved

## License

This project is licensed under the [MIT License](LICENSE).