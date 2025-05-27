# API Documentation - Civic Portal

This document provides comprehensive documentation for the Civic Portal API, including all available endpoints, data structures, and integration guidelines.

## Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## API Overview

The Civic Portal API is built on Supabase, providing a RESTful interface with real-time capabilities. All API operations are organized into service modules for better maintainability and type safety.

### Base URL

```
Production: https://your-project.supabase.co/rest/v1/
Development: Configured via VITE_SUPABASE_URL environment variable
Local Supabase: http://localhost:54321/rest/v1/ (if using local Supabase)
```

### API Architecture

- **Service Layer**: Organized API functions in `src/lib/api/`
- **Type Safety**: Full TypeScript coverage with generated types
- **Error Handling**: Consistent error responses and logging
- **Real-time**: WebSocket subscriptions for live updates
- **Security**: Row-level security and authentication

### API Services

| Service       | File                  | Description                                    |
| ------------- | --------------------- | ---------------------------------------------- |
| Issues        | `issuesApi.ts`        | Issue CRUD operations, filtering, status mgmt  |
| Comments      | `commentsApi.ts`      | Comment system and real-time updates           |
| Solutions     | `solutionsApi.ts`     | Solution proposals, voting, official selection |
| Statistics    | `statsApi.ts`         | Analytics, reporting, dashboard metrics        |
| Users         | `userApi.ts`          | User profile management and authentication     |
| Notifications | `notificationsApi.ts` | Notification system and real-time alerts       |
| Updates       | `updatesApi.ts`       | Official updates from government stakeholders  |
| Departments   | `departmentsApi.ts`   | Government department management               |

## Authentication

### Authentication Methods

#### JWT Tokens

All API requests require authentication using JWT tokens provided by Supabase Auth.

```typescript
// Authentication header
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'apikey': process.env.VITE_SUPABASE_ANON_KEY
}
```

#### Role-Based Access

API endpoints enforce role-based access control:

- **Public**: Accessible without authentication
- **Authenticated**: Requires valid user session
- **Official**: Requires verified government official status
- **Admin**: Requires administrator privileges

### Authentication Flow

```typescript
// Login example
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Use session token for API calls
const { data: issues } = await supabase
  .from('issues')
  .select('*')
  .eq('author_id', data.user.id);
```

## Data Models

### Core Entities

#### User Profile

```typescript
interface Profile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  role: 'citizen' | 'official' | 'admin';
  department_id?: string;
  constituency?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}
```

#### Issue

```typescript
interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  department_id?: string;
  author_id: string;
  vote_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}
```

#### Comment

```typescript
interface Comment {
  id: string;
  issue_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

#### Solution

```typescript
interface Solution {
  id: string;
  issue_id: string;
  author_id: string;
  title: string;
  description: string;
  implementation_plan?: string;
  estimated_cost?: number;
  vote_count: number;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Department

```typescript
interface Department {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  head_official_id?: string;
  created_at: string;
}
```

## API Endpoints

### Issues API (`issuesApi.ts`)

#### Get All Issues

```typescript
// Function signature
async function getIssues(filters?: IssueFilters): Promise<Issue[]>;

// Usage
const issues = await getIssues({
  category: 'infrastructure',
  status: 'open',
  department_id: 'dept-123',
});
```

#### Create Issue

```typescript
// Function signature
async function createIssue(issueData: CreateIssueData): Promise<Issue>;

// Usage
const newIssue = await createIssue({
  title: 'Pothole on Main Street',
  description: 'Large pothole causing traffic issues',
  category: 'infrastructure',
  location: 'Main Street, Gaborone',
});
```

#### Update Issue Status

```typescript
// Function signature (Officials/Admins only)
async function updateIssueStatus(
  issueId: string,
  status: IssueStatus
): Promise<Issue>;

// Usage
const updatedIssue = await updateIssueStatus('issue-123', 'in_progress');
```

#### Vote on Issue

```typescript
// Function signature
async function voteOnIssue(issueId: string): Promise<void>;

// Usage
await voteOnIssue('issue-123');
```

#### Watch Issue

```typescript
// Function signature
async function watchIssue(issueId: string): Promise<void>;

// Usage
await watchIssue('issue-123');
```

### Comments API (`commentsApi.ts`)

#### Get Comments

```typescript
// Function signature
async function getComments(issueId: string): Promise<Comment[]>;

// Usage
const comments = await getComments('issue-123');
```

#### Create Comment

```typescript
// Function signature
async function createComment(
  issueId: string,
  content: string
): Promise<Comment>;

// Usage
const comment = await createComment(
  'issue-123',
  'This is a serious issue that needs attention.'
);
```

### Solutions API (`solutionsApi.ts`)

#### Get Solutions

```typescript
// Function signature
async function getSolutions(issueId: string): Promise<Solution[]>;

// Usage
const solutions = await getSolutions('issue-123');
```

#### Create Solution

```typescript
// Function signature
async function createSolution(
  solutionData: CreateSolutionData
): Promise<Solution>;

// Usage
const solution = await createSolution({
  issue_id: 'issue-123',
  title: 'Temporary Traffic Diversion',
  description: 'Implement temporary traffic routing while repairs are made',
  implementation_plan: 'Set up traffic cones and signage',
  estimated_cost: 5000,
});
```

#### Vote on Solution

```typescript
// Function signature
async function voteOnSolution(solutionId: string): Promise<void>;

// Usage
await voteOnSolution('solution-123');
```

### Statistics API (`statsApi.ts`)

#### Get Dashboard Stats

```typescript
// Function signature
async function getDashboardStats(): Promise<DashboardStats>;

// Usage
const stats = await getDashboardStats();
// Returns: { totalIssues, openIssues, resolvedIssues, totalUsers }
```

#### Get Department Performance

```typescript
// Function signature
async function getDepartmentPerformance(
  departmentId?: string
): Promise<DepartmentPerformance[]>;

// Usage
const performance = await getDepartmentPerformance('dept-123');
```

#### Get Issue Trends

```typescript
// Function signature
async function getIssueTrends(
  timeframe: 'week' | 'month' | 'year'
): Promise<TrendData[]>;

// Usage
const trends = await getIssueTrends('month');
```

### User API (`userApi.ts`)

#### Get User Profile

```typescript
// Function signature
async function getUserProfile(userId: string): Promise<Profile>;

// Usage
const profile = await getUserProfile('user-123');
```

#### Update Profile

```typescript
// Function signature
async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile>;

// Usage
const updatedProfile = await updateProfile('user-123', {
  full_name: 'John Doe',
  username: 'johndoe',
});
```

#### Get User Issues

```typescript
// Function signature
async function getUserIssues(userId: string): Promise<Issue[]>;

// Usage
const userIssues = await getUserIssues('user-123');
```

### Notifications API (`notificationsApi.ts`)

#### Get Notifications

```typescript
// Function signature
async function getNotifications(userId: string): Promise<Notification[]>;

// Usage
const notifications = await getNotifications('user-123');
```

#### Mark as Read

```typescript
// Function signature
async function markNotificationAsRead(notificationId: string): Promise<void>;

// Usage
await markNotificationAsRead('notification-123');
```

## Real-time Subscriptions

### Issue Updates

```typescript
// Subscribe to issue changes
const subscription = supabase
  .channel('issues-realtime')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'issues' },
    (payload) => {
      console.log('Issue updated:', payload);
      // Handle real-time issue updates
    }
  )
  .subscribe();

// Cleanup subscription
subscription.unsubscribe();
```

### Comment Updates

```typescript
// Subscribe to new comments on specific issue
const subscription = supabase
  .channel(`comments-${issueId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `issue_id=eq.${issueId}`,
    },
    (payload) => {
      console.log('New comment:', payload.new);
      // Handle new comment
    }
  )
  .subscribe();
```

### Notification Updates

```typescript
// Subscribe to user notifications
const subscription = supabase
  .channel(`notifications-${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New notification:', payload.new);
      // Show notification to user
    }
  )
  .subscribe();
```

## Error Handling

### Error Response Format

```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: any;
  hint?: string;
}
```

### Common Error Codes

- `PGRST116`: Row not found
- `23505`: Unique constraint violation
- `42501`: Insufficient privileges
- `23503`: Foreign key constraint violation

### Error Handling Example

```typescript
try {
  const issue = await createIssue(issueData);
  return issue;
} catch (error) {
  console.error('Failed to create issue:', error);

  if (error.code === '23505') {
    throw new Error('Issue with this title already exists');
  } else if (error.code === '42501') {
    throw new Error('You do not have permission to create issues');
  } else {
    throw new Error('Failed to create issue. Please try again.');
  }
}
```

## Rate Limiting

### Rate Limits by Endpoint

| Endpoint Category | Rate Limit    | Window   |
| ----------------- | ------------- | -------- |
| Authentication    | 5 requests    | 1 minute |
| Issue Creation    | 10 requests   | 1 hour   |
| Comments          | 30 requests   | 1 hour   |
| Voting            | 100 requests  | 1 hour   |
| Read Operations   | 1000 requests | 1 hour   |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Examples

### Complete Issue Creation Flow

```typescript
// 1. Create issue
const issue = await createIssue({
  title: 'Street Light Outage',
  description: 'Multiple street lights are not working on Oak Avenue',
  category: 'infrastructure',
  location: 'Oak Avenue, Gaborone',
});

// 2. Subscribe to updates
const subscription = supabase
  .channel(`issue-${issue.id}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'issues',
      filter: `id=eq.${issue.id}`,
    },
    (payload) => {
      console.log('Issue updated:', payload);
    }
  )
  .subscribe();

// 3. Add comment
await createComment(issue.id, 'This affects the entire neighborhood safety');

// 4. Vote on issue
await voteOnIssue(issue.id);

// 5. Watch for updates
await watchIssue(issue.id);
```

### Dashboard Data Fetching

```typescript
// Fetch all dashboard data
const [stats, trends, recentIssues] = await Promise.all([
  getDashboardStats(),
  getIssueTrends('month'),
  getIssues({ limit: 10, orderBy: 'created_at' }),
]);

console.log('Dashboard data:', { stats, trends, recentIssues });
```

---

This API documentation provides comprehensive guidance for integrating with the Civic Portal platform, ensuring developers can effectively utilize all available features and maintain consistency with the platform's architecture.
