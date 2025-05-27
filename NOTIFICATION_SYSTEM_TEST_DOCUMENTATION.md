# Civic Portal Notification System - Comprehensive Test Suite

## Overview

This document describes the comprehensive test suite for the Civic Portal notification system, covering all notification types, delivery mechanisms, user targeting, security, and performance aspects.

## Test Structure

### 1. Integration Tests (`NotificationSystem.integration.test.tsx`)

**Purpose**: Tests the complete notification system workflow including UI components, real-time delivery, and user interactions.

**Key Test Areas**:
- ✅ **Notification Types Validation**: Tests all 13 notification types
- ✅ **Notification Triggers**: Validates automatic notification creation
- ✅ **User Targeting**: Ensures correct recipient selection
- ✅ **Real-time Delivery**: Tests Supabase real-time subscriptions
- ✅ **UI Behavior**: NotificationBell component functionality
- ✅ **Edge Cases**: Error handling and empty states

### 2. Database Integration Tests (`NotificationDatabase.integration.test.tsx`)

**Purpose**: Tests actual database operations, triggers, and RLS policies using real Supabase connections.

**Key Test Areas**:
- ✅ **CRUD Operations**: Create, read, update, delete notifications
- ✅ **Database Triggers**: Automatic notification creation on data changes
- ✅ **Security & RLS**: Row Level Security policy enforcement
- ✅ **Performance**: Bulk operations and query efficiency
- ✅ **Data Integrity**: Referential integrity and JSON data handling

## Notification Types Tested

### Issue-Related Notifications
- `issue_update` - When issues are updated
- `status_change` - When issue status changes

### Engagement Notifications  
- `comment` - New comments on watched issues
- `solution` - New solutions proposed for issues

### System Notifications
- `verification_approved` - User verification approved
- `verification_rejected` - User verification rejected  
- `role_changed` - User role updated
- `system` - General system notifications

### Admin Notifications
- `general` - General announcements
- `info` - Informational messages
- `success` - Success notifications
- `warning` - Warning messages
- `error` - Error notifications

## Test Coverage Areas

### 1. Trigger Validation ✅

Tests that notifications are automatically created when:
- Issue status changes (open → in_progress → resolved → closed)
- New comments are added to issues
- New solutions are proposed
- User verification status changes
- Admin sends system-wide announcements

### 2. User Targeting ✅

Validates correct notification delivery to:
- **Issue Watchers**: Users watching specific issues
- **Issue Authors**: Users who created issues
- **Comment Participants**: Users who commented on issues
- **Department Officials**: Stakeholders assigned to relevant departments
- **All Users**: For admin announcements
- **Role-Based**: Specific user roles for certain notification types

### 3. Real-time Delivery ✅

Tests Supabase real-time functionality:
- Real-time subscription setup with user-specific filtering
- Live notification delivery without page refresh
- Proper event handling for INSERT/UPDATE operations
- Security validation in real-time events
- Subscription cleanup on component unmount

### 4. Database Integration ✅

Comprehensive database testing:
- **CRUD Operations**: Full lifecycle of notification management
- **RLS Policies**: User isolation and permission enforcement
- **Triggers**: Database-level automatic notification creation
- **Performance**: Bulk operations and query optimization
- **Data Types**: JSON data, priorities, expiration dates

### 5. Security Testing ✅

Security validation includes:
- **User Isolation**: Users can only see their own notifications
- **Permission Validation**: Users can only modify their own data
- **Role-Based Access**: Different permissions for citizens/officials/admins
- **Self-Notification Prevention**: Users don't get notified of their own actions
- **RLS Policy Enforcement**: Database-level security validation

### 6. UI Behavior Testing ✅

NotificationBell component testing:
- **Unread Count Display**: Accurate badge showing unread notifications
- **Categorization**: Proper grouping in tabs (Issues, Engagement, System, Admin)
- **Mark as Read**: Individual and bulk read functionality
- **Priority Badges**: Visual indicators for high/urgent notifications
- **Real-time Updates**: Live UI updates when new notifications arrive
- **Empty States**: Graceful handling of no notifications

## Test Data Management

### Test Data Factory (`notificationTestHelpers.ts`)

Provides utilities for creating consistent test data:
- **Users**: Citizens, stakeholders, admins with proper roles
- **Issues**: Test issues with department assignments
- **Comments**: Official and community comments
- **Solutions**: Official and community solutions
- **Notifications**: All types with proper metadata

### Database Helpers

Utilities for database operations:
- **Insert/Retrieve**: Direct database operations for testing
- **Cleanup**: Automated test data removal
- **Trigger Testing**: Simulate database triggers
- **Performance Testing**: Bulk operations and timing

### Cleanup Utilities (`cleanupNotificationTests.ts`)

Automated cleanup system:
- **Comprehensive Cleanup**: Removes all test data after tests
- **Specific Cleanup**: Targeted removal by test IDs
- **Verification**: Confirms successful cleanup
- **Error Handling**: Graceful handling of cleanup failures

## Running the Tests

### Prerequisites

1. **Environment Setup**:
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Database Setup**:
   - Ensure notification system migrations are applied
   - Verify RLS policies are enabled
   - Confirm triggers are installed

### Running Tests

```bash
# Run all notification tests
npm run test -- --grep "Notification"

# Run integration tests only
npm run test src/components/notifications/__tests__/NotificationSystem.integration.test.tsx

# Run database tests only  
npm run test src/components/notifications/__tests__/NotificationDatabase.integration.test.tsx

# Run with coverage
npm run test:coverage -- --grep "Notification"

# Run in watch mode
npm run test:watch -- --grep "Notification"
```

### Test Cleanup

```bash
# Manual cleanup after tests
npm run test src/test/scripts/cleanupNotificationTests.ts
```

## Test Configuration

### Vitest Configuration

The test suite uses Vitest with:
- **JSdom Environment**: For React component testing
- **Mock Setup**: Comprehensive mocking of Supabase and external dependencies
- **Coverage Reporting**: Detailed coverage metrics
- **Parallel Execution**: Optimized test performance

### Mock Configuration

Key mocks include:
- **Supabase Client**: Complete mock with real-time simulation
- **Auth System**: User authentication and role management
- **React Router**: Navigation and routing
- **Framer Motion**: Animation library for performance

## Expected Test Results

### Success Criteria

All tests should pass with:
- ✅ **100% Notification Type Coverage**: All 13 types tested
- ✅ **Complete Trigger Validation**: All automatic triggers working
- ✅ **Security Compliance**: RLS policies enforced
- ✅ **Performance Standards**: Queries under 1 second, bulk operations under 5 seconds
- ✅ **UI Functionality**: All user interactions working correctly

### Coverage Targets

- **Lines**: >90%
- **Functions**: >90%
- **Branches**: >85%
- **Statements**: >90%

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure RLS policies allow test operations

2. **Test Data Conflicts**:
   - Run cleanup script before tests
   - Use unique test IDs
   - Check for orphaned test data

3. **Real-time Subscription Failures**:
   - Verify Supabase real-time is enabled
   - Check subscription permissions
   - Ensure proper channel cleanup

### Debug Mode

```bash
# Run tests with debug output
DEBUG=true npm run test -- --grep "Notification"

# Run specific test with verbose output
npm run test -- --reporter=verbose src/components/notifications/__tests__/NotificationSystem.integration.test.tsx
```

## Maintenance

### Regular Tasks

1. **Update Test Data**: Keep test data current with schema changes
2. **Review Coverage**: Ensure new features are tested
3. **Performance Monitoring**: Track test execution times
4. **Cleanup Verification**: Regularly verify cleanup effectiveness

### Adding New Tests

When adding new notification features:

1. **Update Type Definitions**: Add new notification types to test arrays
2. **Create Test Data**: Add factory methods for new entities
3. **Test Triggers**: Verify automatic notification creation
4. **Update Documentation**: Keep this document current

## Conclusion

This comprehensive test suite ensures the Civic Portal notification system is robust, secure, and performant. The tests cover all critical functionality and provide confidence in the system's reliability for Botswana's civic engagement platform.
