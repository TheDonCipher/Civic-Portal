# Official Verification Workflow Testing Guide

This guide provides step-by-step instructions to test the complete official verification workflow in the Civic Portal.

## Prerequisites

1. Ensure the application is running locally or deployed
2. Have access to an admin account
3. Have access to test email accounts for creating official accounts

## Test Scenarios

### Scenario 1: Complete Verification Workflow (Happy Path)

#### Step 1: Register as Government Official
1. Navigate to the registration page
2. Select "Government Official" as account type
3. Fill in the form with test data:
   - Full Name: "Test Official"
   - Email: "testofficial@example.com"
   - Username: "testofficial"
   - Department: Select any department (e.g., "Health")
   - Password: Create a secure password
4. Accept terms and complete registration
5. Verify email if email verification is enabled

**Expected Result**: 
- User account created with `role: 'official'` and `verification_status: 'pending'`
- User receives welcome email
- User cannot access stakeholder dashboard yet

#### Step 2: Attempt to Access Stakeholder Dashboard (Before Verification)
1. Log in as the test official
2. Navigate to `/stakeholder` or try to access stakeholder features

**Expected Result**:
- User sees "Account Verification Pending" message
- Clear explanation of the verification process
- Options to "Contact Support" and "Return to Home"
- No access to stakeholder dashboard features

#### Step 3: Admin Verification Process
1. Log in as an admin user
2. Navigate to the Admin Panel (`/admin`)
3. Go to the "Users" tab
4. Find the test official in the list
5. Verify the user shows `verification_status: 'pending'`
6. Click the green checkmark (✓) button to verify the user
7. Confirm the verification in the dialog

**Expected Result**:
- User's `verification_status` changes to `'verified'`
- Admin sees success message
- Notification is sent to the official
- Real-time update reflects the change immediately

#### Step 4: Official Receives Notification
1. As the test official, check the notification bell in the header
2. Click on the notification bell

**Expected Result**:
- Notification badge shows unread count
- Notification appears with title "Account Verified! 🎉"
- Message explains verification success and dashboard access
- Clicking notification marks it as read

#### Step 5: Access Stakeholder Dashboard (After Verification)
1. As the verified official, navigate to `/stakeholder`
2. Explore the dashboard features

**Expected Result**:
- Full access to stakeholder dashboard
- Department-specific issue filtering
- Ability to manage issues within assigned department
- All stakeholder features available

### Scenario 2: Verification Rejection Workflow

#### Step 1: Register Another Official
1. Create another test official account following Step 1 above
2. Use different email: "testofficial2@example.com"

#### Step 2: Admin Rejects Verification
1. As admin, find the new official in the admin panel
2. Click the red X (✗) button to reject verification
3. Provide a rejection reason: "Invalid credentials provided"
4. Confirm the rejection

**Expected Result**:
- User's `verification_status` changes to `'rejected'`
- `verification_notes` field stores the rejection reason
- Notification sent to the official

#### Step 3: Official Sees Rejection
1. Log in as the rejected official
2. Try to access stakeholder dashboard
3. Check notifications

**Expected Result**:
- "Account Verification Rejected" message displayed
- Rejection reason shown in the message
- Notification explains the rejection
- Contact support option available

### Scenario 3: Notification System Testing

#### Step 1: Test Notification Reading
1. As any user with notifications, click the notification bell
2. Click on individual notifications
3. Use "Mark all read" button

**Expected Result**:
- Individual notifications marked as read when clicked
- "Mark all read" clears all unread notifications
- Notification badge updates correctly
- Database reflects read status changes

#### Step 2: Test Real-time Updates
1. Have admin and official accounts open in different browsers
2. Admin verifies/rejects an official
3. Check if official sees real-time updates

**Expected Result**:
- Changes appear immediately without page refresh
- Notifications appear in real-time
- Dashboard access updates immediately

### Scenario 4: Edge Cases and Error Handling

#### Step 1: Test Invalid State Transitions
1. Try to verify an already verified user
2. Try to reject an already rejected user

**Expected Result**:
- Appropriate error messages
- No duplicate notifications
- System handles gracefully

#### Step 2: Test Permission Boundaries
1. Try to access admin panel as non-admin
2. Try to access stakeholder dashboard as citizen
3. Try to verify users without admin privileges

**Expected Result**:
- Proper access control enforced
- Clear error messages
- Redirects to appropriate pages

## Database Verification

After each test, verify the database state:

### Check Profiles Table
```sql
SELECT id, username, role, verification_status, verification_notes, department_id 
FROM profiles 
WHERE role = 'official';
```

### Check Notifications Table
```sql
SELECT user_id, type, title, message, read, created_at 
FROM notifications 
ORDER BY created_at DESC;
```

### Check Audit Logs
```sql
SELECT action, resource_type, user_id, details, created_at 
FROM audit_logs 
WHERE action IN ('verification_update', 'role_update')
ORDER BY created_at DESC;
```

## Performance Testing

1. **Load Testing**: Create multiple official accounts and verify them simultaneously
2. **Real-time Testing**: Test with multiple users online to ensure real-time updates work
3. **Notification Scaling**: Test with many notifications to ensure performance

## Security Testing

1. **Authorization**: Ensure only admins can verify users
2. **Data Integrity**: Verify that verification status changes are properly logged
3. **Input Validation**: Test with invalid data in verification forms

## Troubleshooting Common Issues

### Issue: Notifications not appearing
- Check if notifications table exists and has proper RLS policies
- Verify notification creation in database
- Check browser console for errors

### Issue: Real-time updates not working
- Verify Supabase real-time is enabled
- Check subscription setup in components
- Ensure proper channel names and event types

### Issue: Access control not working
- Verify profile data is loaded correctly
- Check role and verification_status values
- Ensure proper authentication state

### Issue: Database errors
- Check if all migrations have been applied
- Verify table schemas match expected structure
- Check for missing columns or constraints

## Success Criteria

The verification workflow is considered successful when:

1. ✅ Officials can register and receive pending status
2. ✅ Unverified officials cannot access stakeholder features
3. ✅ Admins can verify/reject officials with proper feedback
4. ✅ Notifications are sent and received correctly
5. ✅ Verified officials gain full stakeholder access
6. ✅ Rejected officials see appropriate messages
7. ✅ Real-time updates work across all components
8. ✅ All database changes are properly logged
9. ✅ Error handling works for edge cases
10. ✅ Performance is acceptable under normal load
