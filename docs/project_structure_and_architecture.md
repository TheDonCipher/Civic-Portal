# Government Issue Tracking Portal - Project Structure and Architecture

## Overview

The Government Issue Tracking Portal is a web application built with React, TypeScript, and Vite that enables citizens to report, track, and collaborate on civic issues while engaging with government stakeholders. This document provides a comprehensive analysis of the project's structure and architecture to guide developers.

## Directory Structure

```
.
├── public/               # Static assets served directly
├── src/                  # Source code
│   ├── components/       # UI components organized by feature
│   │   ├── about/        # About page components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Shared utility components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── faq/          # FAQ page components
│   │   ├── issues/       # Issue tracking components
│   │   ├── layout/       # Layout components (header, footer, etc.)
│   │   ├── profile/      # User profile components
│   │   ├── reports/      # Reporting and analytics components
│   │   ├── stakeholder/  # Government stakeholder components
│   │   └── ui/           # Shadcn UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and services
│   │   ├── api/          # API service functions
│   │   └── utils/        # Utility helper functions
│   ├── providers/        # Context providers
│   ├── stories/          # Storybook stories
│   ├── tempobook/        # Tempo platform specific files
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global CSS
├── supabase/             # Supabase configuration and migrations
│   └── migrations/       # Database migration files
└── tailwind.config.js    # Tailwind CSS configuration
```

## Key Components and Their Relationships

### Core Application Structure

- **App.tsx**: The root component that sets up routing and global providers
- **AuthProvider.tsx**: Manages authentication state and user profiles
- **ThemeProvider.tsx**: Handles theme settings and preferences

### Feature Components

#### Issues Module

The Issues module is the core functionality of the application, allowing users to create, view, and interact with civic issues.

- **IssuesPage.tsx**: Container component for the issues feature
  - Manages issue data fetching and state
  - Handles issue creation, filtering, and selection
  - Coordinates between child components

- **IssueGrid.tsx**: Displays issues in a responsive grid layout
  - Renders individual IssueCard components
  - Implements filtering and sorting functionality

- **IssueCard.tsx**: Card component for individual issues
  - Displays issue summary information
  - Handles user interactions like voting

- **IssueDetailDialog.tsx**: Modal for viewing detailed issue information
  - Shows tabs for comments, solutions, and updates
  - Manages issue-specific actions

- **CreateIssueDialog.tsx**: Form for submitting new issues
  - Implements form validation
  - Handles file uploads

#### Authentication Module

- **AuthDialog.tsx**: Modal for authentication
  - Contains SignInForm and SignUpForm
  - Manages authentication state

- **SignInForm.tsx**: Form for user login
- **SignUpForm.tsx**: Form for user registration
- **ResetPasswordForm.tsx**: Form for password reset

#### Profile Module

- **ProfilePage.tsx**: User profile page
  - Shows user information and activity
  - Provides access to profile settings

- **ProfileSettings.tsx**: Form for updating user profile

#### Stakeholder Module

- **StakeholderDashboard.tsx**: Dashboard for government representatives
  - Shows issue statistics and management tools
  - Provides access to official response features

## Data Flow and State Management

### Application State Architecture

The application uses a combination of React Context API and local component state to manage data flow and state:

1. **Global State Management**:
   - **AuthContext**: Manages user authentication state across the application
   - **ThemeContext**: Manages theme preferences (light/dark mode)
   - **IssueProvider**: Manages issue data and interactions for the Issues module

2. **Local Component State**:
   - Individual components maintain their own local state for UI interactions
   - Form components use React Hook Form for form state management
   - Dialog components manage their open/closed state internally

### Data Flow Patterns

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Context        │     │  API Services   │     │  Supabase       │
│  Providers      │◄────┤  (lib/api)      │◄────┤  Database       │
│                 │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌────────────────┐      ┌─────────────────┐
│                │      │                 │
│  Container     │      │  UI Components  │
│  Components    │─────►│  (Presentational)│
│                │      │                 │
└────────────────┘      └─────────────────┘
```

### Key Data Flows

1. **Authentication Flow**:
   - User credentials flow from auth forms to AuthProvider
   - AuthProvider interacts with Supabase auth services
   - Authentication state is made available throughout the app
   - Protected routes check auth state before rendering

2. **Issue Management Flow**:
   - Issues are fetched from Supabase via API services
   - Data is stored in IssueProvider context
   - Container components access issue data from context
   - UI components receive data as props from containers
   - User interactions trigger API calls to update data
   - Realtime subscriptions update state when data changes

3. **User Profile Flow**:
   - Profile data is fetched during authentication
   - Profile updates flow from forms to AuthProvider
   - AuthProvider updates both Supabase auth and profiles table

### State Persistence

- Authentication state is persisted using Supabase's session management
- Theme preferences are stored in localStorage
- Form data is temporarily stored in component state during editing

## API Structure and Data Models

### API Service Layer

The application uses a service-oriented architecture for API interactions, with all Supabase database operations abstracted through service functions:

1. **Service Organization**:
   - API services are organized by domain in the `src/lib/api` directory
   - Each service file contains related functions for a specific domain (e.g., issues, users, stats)
   - Helper functions are extracted into separate files to maintain modularity

2. **Key API Services**:
   - **issuesApi.ts**: Functions for CRUD operations on issues
   - **commentsApi.ts**: Functions for managing issue comments
   - **solutionsApi.ts**: Functions for managing proposed solutions
   - **statsApi.ts**: Functions for fetching statistics and dashboard data
   - **userApi.ts**: Functions for user profile management

### Data Models

The application's data models are defined in TypeScript interfaces and align with the Supabase database schema:

1. **Core Data Models**:
   - **Issue**: Represents a civic issue with properties like title, description, category, status, location
   - **Comment**: Represents a user comment on an issue
   - **Solution**: Represents a proposed solution to an issue
   - **User**: Represents a user profile with role and preferences
   - **Stakeholder**: Represents a government stakeholder with department and jurisdiction

2. **Relationship Models**:
   - **IssueVote**: Tracks user votes on issues
   - **SolutionVote**: Tracks user votes on proposed solutions
   - **IssueFollower**: Tracks users following specific issues

### API Design Patterns

1. **Error Handling**:
   - All API functions include consistent error handling
   - Errors are logged and optionally reported to monitoring services
   - User-friendly error messages are returned for UI display

2. **Data Transformation**:
   - Raw database data is transformed into application-specific formats
   - Helper functions handle complex data transformations
   - Computed properties are added where needed

3. **Pagination and Filtering**:
   - List endpoints support pagination parameters
   - Filter options are passed as structured objects
   - Sort parameters control result ordering