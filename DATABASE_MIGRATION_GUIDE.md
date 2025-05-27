# Database Migration Guide - Security Hardening

## 🚨 IMPORTANT: Run These Migrations in Order

The previous migration failed because of table structure conflicts. Use these **safe migrations** instead.

---

## 📋 MIGRATION FILES

**RECOMMENDED (Simplest):**

1. **`20241201000003_security_simple.sql`** - Complete security setup in one file (RECOMMENDED)
2. **`20241201000002_rls_policies.sql`** - Adds Row-Level Security policies

**ALTERNATIVE (If you prefer step-by-step):**

1. **`20241201000001_security_hardening_safe.sql`** - Creates security tables and basic structure (FIXED)
2. **`20241201000002_rls_policies.sql`** - Adds Row-Level Security policies

**OPTIONAL:** 3. **`database-schema-with-sample-data.sql`** - Adds sample data for testing

---

## 🔧 STEP-BY-STEP INSTRUCTIONS

### Step 1: Run the Simple Security Migration (RECOMMENDED)

**In Supabase Dashboard → SQL Editor:**

```sql
-- Copy and paste the contents of:
-- supabase/migrations/20241201000003_security_simple.sql
```

**OR if you prefer the step-by-step approach:**

```sql
-- Copy and paste the contents of:
-- supabase/migrations/20241201000001_security_hardening_safe.sql (FIXED)
```

**Expected Output:**

```
NOTICE: Created rate_limits table
NOTICE: Created security_logs table
NOTICE: Created audit_logs table
NOTICE: Created index: idx_rate_limits_action_identifier
NOTICE: Enabled RLS on table: profiles
NOTICE: Created audit trigger for profiles table
NOTICE: === SECURITY HARDENING MIGRATION COMPLETED SUCCESSFULLY ===
```

### Step 2: Run the RLS Policies Migration

**In Supabase Dashboard → SQL Editor:**

```sql
-- Copy and paste the contents of:
-- supabase/migrations/20241201000002_rls_policies.sql
```

**Expected Output:**

```
NOTICE: Created RLS policies for profiles table
NOTICE: Created RLS policies for issues table
NOTICE: Created RLS policies for comments table
NOTICE: Created RLS policies for security tables
NOTICE: === RLS POLICIES MIGRATION COMPLETED SUCCESSFULLY ===
```

### Step 3: Verify Migration Success

**Run this verification query:**

```sql
-- Check that security tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('rate_limits', 'security_logs', 'audit_logs')
ORDER BY table_name;

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'issues', 'comments', 'rate_limits', 'security_logs', 'audit_logs')
ORDER BY tablename;

-- Check that policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'issues', 'comments', 'rate_limits', 'security_logs', 'audit_logs')
ORDER BY tablename, policyname;
```

**Expected Results:**

- 3 security tables created
- RLS enabled on all tables (rowsecurity = true)
- Multiple policies created for each table

---

## 🔍 TROUBLESHOOTING

### If Step 1 Fails:

**Error: "relation already exists"**

```sql
-- Check existing tables
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('rate_limits', 'security_logs', 'audit_logs');

-- If tables exist but have wrong structure, drop them:
DROP TABLE IF EXISTS rate_limits CASCADE;
DROP TABLE IF EXISTS security_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Then re-run Step 1
```

### If Step 2 Fails:

**Error: "policy already exists"**

```sql
-- Check existing policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename = 'profiles';

-- The migration handles this automatically with DROP POLICY IF EXISTS
-- Just re-run the migration
```

### If Audit Triggers Fail:

**Error: "function does not exist"**

```sql
-- Check if function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'audit_trigger_function';

-- If missing, create it manually:
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, operation, old_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, operation, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✅ POST-MIGRATION VERIFICATION

### Test Security Features:

1. **Test Rate Limiting:**

```sql
-- Insert a test rate limit record
INSERT INTO rate_limits (action, identifier, success)
VALUES ('sign-in', 'test@example.com', false);

-- Verify it was inserted
SELECT * FROM rate_limits WHERE identifier = 'test@example.com';
```

2. **Test Security Logging:**

```sql
-- Insert a test security log
INSERT INTO security_logs (event, details)
VALUES ('test_event', '{"test": true}');

-- Verify it was inserted
SELECT * FROM security_logs WHERE event = 'test_event';
```

3. **Test Audit Logging:**

```sql
-- Update a profile (if you have one) to trigger audit log
-- The audit trigger should automatically create an entry in audit_logs
```

4. **Test RLS Policies:**

```sql
-- Try to access rate_limits as a non-admin user
-- Should return no results due to RLS
SELECT * FROM rate_limits;
```

---

## 🚀 AFTER SUCCESSFUL MIGRATION

### Update Application Configuration:

1. **Restart your development server:**

```bash
npm run dev
```

2. **Run security tests:**

```bash
npm run test src/tests/security.test.ts
```

3. **Test authentication with rate limiting:**

   - Try multiple failed login attempts
   - Verify rate limiting kicks in after 5 attempts

4. **Check browser console for CSP headers:**
   - Open Developer Tools → Network tab
   - Look for Content-Security-Policy headers

---

## 📞 SUPPORT

If you encounter issues:

1. **Check the Supabase logs** in the dashboard
2. **Verify your database permissions**
3. **Ensure you're running the migrations in order**
4. **Contact the development team** with specific error messages

**The security implementation is now ready for production use!**
