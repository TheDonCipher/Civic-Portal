# Reports Module

## Overview

The Reports module provides real-time analytics and visualizations for the Government Issue Tracking Portal. It displays various metrics and charts related to civic issues, including issue distribution by category, resolution rates, response times, and citizen engagement.

## Components

### ReportsPage

The base reports page component that displays static analytics data.

### ReportsPageWithRealtime

An enhanced version of the reports page that includes real-time updates using the `useRealtimeReports` hook. This component automatically refreshes when changes are detected in the database.

### ReportsPageWithRealtimeHook

An alternative implementation of the real-time reports page that demonstrates a different approach to using the `useRealtimeReports` hook.

## Hooks

### useRealtimeReports

A custom hook that handles fetching and updating report data in real-time. It sets up Supabase subscriptions to listen for changes in the issues, comments, and votes tables, and automatically refreshes the data when changes are detected.

**Usage:**

```tsx
const {
  timeframe,        // Current timeframe (1m, 3m, 6m, 1y)
  setTimeframe,      // Function to change the timeframe
  reportData,        // The fetched report data
  loading,           // Loading state
  error,             // Error state
  lastUpdated,       // Timestamp of last update
  refreshData,       // Function to manually refresh data
} = useRealtimeReports("6m"); // Initial timeframe
```

## Data Structure

The report data follows this structure:

```typescript
interface ReportData {
  issuesByCategory: Array<{
    name: string;        // Category name
    value: number;       // Number of issues
    previousValue: number; // Number of issues in previous period
  }>;
  issuesByStatus: Array<{
    name: string;        // Status name (open, in-progress, resolved)
    value: number;       // Number of issues
    previousValue: number; // Number of issues in previous period
  }>;
  monthlyTrends: Array<{
    month: string;       // Month (e.g., "Jan 2024")
    issues: number;      // New issues created
    resolved: number;    // Issues resolved
    responseTime?: number; // Average response time in days
  }>;
  departmentPerformance?: Array<{
    name: string;        // Department name
    resolutionRate: number; // Percentage of issues resolved
    avgResponseDays: number; // Average response time in days
  }>;
  budgetAllocation?: Array<{
    category: string;    // Budget category
    allocated: number;   // Amount allocated
    spent: number;       // Amount spent
  }>;
  citizenEngagement?: Array<{
    month: string;       // Month
    votes: number;       // Number of votes
    comments: number;    // Number of comments
    satisfaction: number; // Satisfaction percentage
  }>;
}
```

## Real-time Updates

The reports module uses Supabase's real-time subscriptions to listen for changes in the following tables:

- `issues`: When issues are created, updated, or deleted
- `comments`: When comments are added to issues
- `issue_votes`: When users vote on issues

When changes are detected, the report data is automatically refreshed to reflect the latest state.

## Timeframe Selection

Users can select different timeframes for the reports:

- `1m`: Last month
- `3m`: Last 3 months
- `6m`: Last 6 months
- `1y`: Last year

Changing the timeframe triggers a new data fetch with the selected timeframe parameter.

## Performance Considerations

- The `useMemo` hook is used to calculate summary data to avoid unnecessary recalculations
- Real-time subscriptions are cleaned up when components unmount
- Loading states are provided to show appropriate UI during data fetching
