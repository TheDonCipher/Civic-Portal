# Admin Debug Panel Documentation

## Overview

The Admin Debug Panel is a comprehensive debugging and monitoring interface designed specifically for administrators of the Civic Portal. It provides real-time insights into system health, performance metrics, error tracking, and database monitoring.

## Features

### 1. System Health Dashboard
- **Database Connection Status**: Real-time monitoring of Supabase connection health
- **Response Time Tracking**: Measures and displays database query response times
- **Connection Quality Indicators**: Visual indicators for connection performance
- **Real-time Subscription Monitoring**: Tracks active WebSocket connections

### 2. Performance Monitoring
- **Memory Usage Tracking**: Monitors JavaScript heap memory consumption
- **Core Web Vitals Integration**: Tracks LCP, FID, and CLS metrics
- **API Latency Monitoring**: Measures response times for API calls
- **Component Render Performance**: Tracks rendering performance metrics

### 3. Error Tracking & Logging
- **Error Count Monitoring**: Displays total error count and recent error timestamps
- **Error Log Storage**: Stores errors in localStorage for debugging
- **Error Details Display**: Shows detailed error information with timestamps
- **Error Log Management**: Ability to clear error logs and export debug data

### 4. Database Health Monitoring
- **Table Health Checks**: Monitors critical database tables
- **Row Count Tracking**: Displays record counts for each table
- **Function Availability**: Checks for required database functions
- **RLS Policy Validation**: Verifies Row Level Security policies

### 5. Real-time Activity Monitor
- **Live Event Streaming**: Real-time monitoring of database changes
- **Event Type Tracking**: Monitors INSERT, UPDATE, DELETE operations
- **Subscription Management**: Start/stop real-time monitoring
- **Event Statistics**: Displays event counts by type

### 6. Authentication Debugging
- **Session Validation**: Checks user authentication status
- **Role Verification**: Validates user roles and permissions
- **Profile Status**: Monitors user profile completeness
- **Permission Checks**: Validates specific permissions

## Components

### SystemDebugPanel
Main container component that orchestrates all debug functionality.

**Location**: `src/components/admin/SystemDebugPanel.tsx`

**Features**:
- Collapsible interface with expand/collapse functionality
- Tabbed navigation for different debug categories
- Export functionality for debug data
- Real-time refresh capabilities

### DatabaseHealthChecker
Monitors database connectivity and table health.

**Location**: `src/components/admin/DatabaseHealthChecker.tsx`

**Monitored Tables**:
- `profiles` - User profile data
- `issues` - Issue tracking records
- `comments` - Comment system data
- `solutions` - Solution proposals
- `departments` - Government departments
- `notifications` - Notification system
- `votes` - Voting records
- `watchers` - Issue watchers

**Health Indicators**:
- ✅ **Healthy**: Table accessible with data
- ⚠️ **Warning**: Table accessible but may need attention
- ❌ **Error**: Table inaccessible or missing

### RealtimeMonitor
Provides live monitoring of database changes.

**Location**: `src/components/admin/RealtimeMonitor.tsx`

**Capabilities**:
- Real-time event streaming
- Event filtering by table
- Event type statistics
- Subscription management
- Event history with timestamps

### AuthDebugPanel
Enhanced authentication debugging interface.

**Location**: `src/components/admin/AuthDebugPanel.tsx`

**Checks**:
- User session validity
- Profile completeness
- Role assignments
- Permission validations

## Usage

### Accessing the Debug Panel

1. **Admin Access Required**: Only users with `admin` role can access the debug panel
2. **Location**: Available in the Admin Dashboard at `/admin`
3. **Visibility**: Panel appears below the main admin statistics

### Navigation

The debug panel uses a tabbed interface:

- **Overview**: System summary and quick actions
- **Database**: Database health and connection monitoring
- **Real-time**: Live activity monitoring
- **Performance**: Performance metrics and monitoring
- **Errors**: Error tracking and management
- **Auth**: Authentication debugging

### Quick Actions

- **Refresh**: Updates all system health metrics
- **Export**: Downloads comprehensive debug data as JSON
- **Expand/Collapse**: Toggle detailed view
- **Clear Logs**: Remove stored error logs

## Configuration

### Environment Variables

The debug panel respects these environment variables:

```env
VITE_ENABLE_REALTIME=true          # Enable real-time monitoring
VITE_SHOW_CONNECTION_STATUS=true   # Show connection status
VITE_ENABLE_ANALYTICS=true         # Enable performance analytics
```

### Performance Monitoring

The panel integrates with the performance monitoring system:

```typescript
import { performanceMonitor } from '@/lib/utils/performanceMonitor';

// Initialize performance monitoring
performanceMonitor.init();

// Track custom metrics
performanceMonitor.trackCustomMetric('admin-action', duration);
```

## Troubleshooting

### Common Issues

1. **Debug Panel Not Visible**
   - Ensure user has `admin` role
   - Check authentication status
   - Verify admin route access

2. **Database Health Errors**
   - Check Supabase connection
   - Verify database migrations
   - Validate RLS policies

3. **Real-time Monitoring Issues**
   - Check WebSocket connections
   - Verify real-time subscriptions
   - Ensure proper permissions

4. **Performance Metrics Missing**
   - Verify browser support for Performance API
   - Check memory monitoring availability
   - Ensure performance monitor initialization

### Debug Data Export

The export functionality provides:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "systemHealth": {
    "database": { "status": "healthy", "connectionTime": 45.2 },
    "realtime": { "status": "connected", "subscriptions": 6 },
    "performance": { "memoryUsage": 23.4, "renderTime": 12.1 },
    "errors": { "count": 0, "recentErrors": [] }
  },
  "debugInfo": {
    "profilesCount": 150,
    "departmentsCount": 18,
    "issuesCount": 45
  },
  "userInfo": {
    "id": "user-id",
    "role": "admin",
    "hasProfile": true
  },
  "performanceReport": {
    "coreWebVitals": { "lcp": 1200, "fid": 50, "cls": 0.1 },
    "navigation": { "domContentLoaded": 800 },
    "memoryUsage": { "usedJSHeapSize": 24000000 }
  }
}
```

## Security Considerations

- **Admin Only Access**: Panel is restricted to admin users only
- **Sensitive Data**: Debug data may contain sensitive information
- **Export Security**: Exported data should be handled securely
- **Real-time Monitoring**: Monitor subscription limits to prevent abuse

## Best Practices

1. **Regular Monitoring**: Check debug panel regularly for system health
2. **Error Management**: Clear error logs periodically
3. **Performance Tracking**: Monitor memory usage and performance metrics
4. **Export Data**: Export debug data for analysis when issues occur
5. **Real-time Usage**: Use real-time monitoring judiciously to avoid performance impact

## Integration with Existing Systems

The debug panel integrates with:

- **Error Boundary System**: Captures and displays React errors
- **Performance Monitor**: Tracks Core Web Vitals and custom metrics
- **Supabase Configuration**: Validates database setup
- **Authentication System**: Monitors auth status and permissions
- **Real-time Subscriptions**: Tracks WebSocket connections

## Future Enhancements

Planned improvements include:

- **Historical Data**: Store and display historical performance data
- **Alert System**: Automated alerts for critical issues
- **Advanced Filtering**: Enhanced filtering for real-time events
- **Performance Benchmarks**: Baseline performance comparisons
- **Custom Dashboards**: Configurable debug dashboards
- **Integration APIs**: External monitoring system integration
