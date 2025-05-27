# User Management System Fixes - Testing Guide

## Overview

This guide provides comprehensive testing procedures for the user management system fixes implemented to address issues with government official verification status, department display, and legal consent storage.

## Issues Fixed

### 1. **Verification Status Issue** ✅

- **Problem**: New government officials appearing as "verified" instead of "pending"
- **Root Cause**: Database trigger only fired on UPDATE, not INSERT operations
- **Fix**: Updated trigger to handle both INSERT and UPDATE operations

### 2. **Department Display Issue** ✅

- **Problem**: Department names not showing for new officials
- **Root Cause**: Department lookup logic was correct, but needed enhanced debugging
- **Fix**: Enhanced debug logging to track department assignment

### 3. **Legal Consent Timestamp Issue** ✅

- **Problem**: Individual timestamps showing as NULL
- **Root Cause**: Basic SignUpForm not capturing individual timestamps
- **Fix**: Updated both signup forms to use EnhancedLegalConsent component

### 4. **Database Trigger Issue** ✅

- **Problem**: Verification status not set correctly during signup
- **Root Cause**: Trigger only handled role changes, not initial profile creation
- **Fix**: Created new trigger function for INSERT and UPDATE operations

## Files Modified

### Database

- `supabase/migrations/20241201000005_add_individual_consent_timestamps.sql` - Enhanced with trigger fix
- `scripts/test-user-management-fixes.sql` - New comprehensive test script

### Components

- `src/components/auth/SignUpForm.tsx` - Enhanced with individual timestamp capture
- `src/components/admin/AdminPage.tsx` - Enhanced debug logging

### Services

- Legal consent service already properly implemented

## Testing Procedures

### 1. Database Migration Testing

```bash
# Run the migration
npx supabase migration up

# Or if using Supabase CLI directly
supabase db push
```

**Expected Results**:

- New trigger function `set_verification_status_on_insert_or_update()` created
- Trigger `trigger_set_verification_status` updated to handle INSERT operations
- Individual timestamp fields added to legal_consents table

### 2. Apply Database Migration

**Option A: Manual Application (Recommended)**
Run the migration script in Supabase SQL Editor:

```sql
-- Copy and paste contents of scripts/apply-user-management-fixes.sql
```

**Option B: CLI Application (if Supabase is running locally)**

```bash
npx supabase migration up
```

### 3. Database Validation Testing

**Step 1: Check Current Status**
Run the status check script in Supabase SQL Editor:

```sql
-- Copy and paste contents of scripts/check-user-management-status.sql
```

**Step 2: Test Trigger Functionality**
Run the test script in Supabase SQL Editor:

```sql
-- Copy and paste contents of scripts/test-user-management-fixes.sql
```

**Expected Results**:

- Trigger exists and handles both INSERT and UPDATE
- Individual timestamp fields exist in legal_consents table
- Existing data integrity is maintained
- Legal consent timestamps are properly structured

### 4. Frontend Registration Testing

#### Test 1: Basic SignUpForm

1. Navigate to signup page
2. Fill out basic citizen registration
3. Accept legal agreements (should capture individual timestamps)
4. Complete registration
5. Check browser console for legal consent logs
6. Verify in database that timestamps are populated

#### Test 2: Enhanced SignUpForm (Government Official)

1. Navigate to enhanced signup page
2. Select "Government Official" role
3. Choose a department from dropdown
4. Accept legal agreements (timestamps should be captured in real-time)
5. Complete CAPTCHA and registration
6. Check browser console for detailed logs
7. Verify in admin panel that user appears with:
   - "pending" verification status
   - Correct department name displayed
   - Legal consent properly stored

### 5. Admin Panel Testing

#### Test 1: Verification Status Display

1. Login as admin
2. Navigate to Admin Panel → Users tab
3. Look for newly registered officials
4. Verify they show:
   - "pending" verification status badge (gray/secondary color)
   - Verify (✓) and Reject (✗) buttons visible
   - Correct department name displayed

#### Test 2: Verification Workflow

1. Click verify button for a pending official
2. Confirm verification
3. Verify status changes to "verified"
4. Verify buttons disappear
5. Check that user can now access stakeholder dashboard

### 6. Legal Consent Validation Testing

#### Test 1: Database Records

```sql
-- Check recent legal consent records
SELECT
  lc.*,
  p.email,
  p.role
FROM legal_consents lc
JOIN profiles p ON lc.user_id = p.id
WHERE lc.created_at > NOW() - INTERVAL '1 hour'
ORDER BY lc.created_at DESC;
```

**Expected Results**:

- `terms_accepted_at`, `privacy_accepted_at`, `data_processing_accepted_at` fields populated
- Timestamps should be within seconds of each other for new registrations
- All boolean consent fields should be `true`

#### Test 2: Validation Function

```javascript
// In browser console after registration
const userId = 'USER_ID_HERE'; // Replace with actual user ID
const result = await validateLegalConsentStorage(userId);
console.log('Validation result:', result);
```

**Expected Results**:

- `result.success` should be `true`
- `result.isValid` should be `true`
- Console should show validation passed

## Troubleshooting

### Issue: Officials Still Showing as "Verified"

**Possible Causes**:

1. Migration not applied
2. Trigger not working
3. Cache issues

**Solutions**:

1. Run migration again: `npx supabase migration up`
2. Check trigger exists: Run test script section 1
3. Clear browser cache and refresh admin panel

### Issue: Department Names Not Showing

**Possible Causes**:

1. Department not selected during signup
2. Department lookup failing
3. Department table issues

**Solutions**:

1. Check browser console for debug logs
2. Verify department was selected during signup
3. Run test script section 8 to check department data

### Issue: Legal Consent Timestamps NULL

**Possible Causes**:

1. EnhancedLegalConsent component not working
2. Timestamp capture failing
3. Database insertion issues

**Solutions**:

1. Check browser console for consent logs
2. Verify EnhancedLegalConsent is being used
3. Run test script section 7 to check timestamp data

### Issue: Trigger Not Working

**Possible Causes**:

1. Migration failed
2. Permissions issues
3. Function syntax errors

**Solutions**:

1. Check migration status
2. Run test script section 11 to verify function exists
3. Check Supabase logs for errors

## Success Criteria

### ✅ Verification Status

- [ ] New government officials appear with "pending" status in admin panel
- [ ] Trigger correctly sets verification_status during INSERT operations
- [ ] Admin can verify/reject officials successfully

### ✅ Department Display

- [ ] Department names appear correctly for officials in admin panel
- [ ] Department selection during signup is preserved
- [ ] Department lookup logic works correctly

### ✅ Legal Consent Storage

- [ ] Individual timestamps are captured and stored
- [ ] Both signup forms use enhanced consent component
- [ ] Validation functions confirm proper storage

### ✅ Database Integrity

- [ ] No data corruption from migration
- [ ] Existing users unaffected
- [ ] All constraints and indexes working

## Monitoring

### Key Metrics to Monitor

1. **Registration Success Rate**: Should remain 100%
2. **Legal Consent Storage Rate**: Should be 100% for new registrations
3. **Verification Status Accuracy**: All new officials should be "pending"
4. **Department Assignment Rate**: Should be 100% for officials

### Log Monitoring

Watch for these console messages:

- "Legal consent stored successfully with individual timestamps"
- "Legal consent validation passed"
- "Official user [email]: verification_status = pending, department_id = [UUID], department_name = [Name]"

## Rollback Plan

If issues occur, rollback steps:

1. Revert migration: `npx supabase migration down`
2. Restore previous component versions from git
3. Clear application cache
4. Restart application

## Support

For issues with the fixes:

1. Check browser console for detailed error messages
2. Run the comprehensive test script
3. Review Supabase logs for database errors
4. Verify all migration steps completed successfully
