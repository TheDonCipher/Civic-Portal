# Storage Setup Guide for Civic Portal

## Issues Fixed

The following errors have been identified and need to be resolved:

1. **Missing `votes` and `watchers` tables** - Causing 404 errors
2. **Missing storage bucket** - Causing image upload RLS policy errors
3. **Image loading issues** - Fallback images not loading properly

## Step 1: Run the Updated Migration Script

The `supabase/migrations/fix_categories_simple.sql` file has been updated to include the missing tables. Run this script in your Supabase SQL Editor:

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the entire contents of `supabase/migrations/fix_categories_simple.sql`
4. Click "Run"

This will create:
- ✅ `issue_categories` table with proper department associations
- ✅ `votes` table (that the frontend expects)
- ✅ `watchers` table (that the frontend expects)
- ✅ Proper RLS policies for all tables
- ✅ Performance indexes

## Step 2: Create Storage Bucket for Images

Since SQL cannot create storage buckets, you need to do this manually in the Supabase dashboard:

### Create the Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Set the following:
   - **Name**: `issues`
   - **Public bucket**: ✅ **Checked** (so images can be publicly accessible)
   - **File size limit**: `50MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### Set Storage Policies

After creating the bucket, you need to set up RLS policies. Go to **Storage** > **Policies** and create these policies for the `issues` bucket:

#### Policy 1: Allow Public Read Access
```sql
-- Policy Name: "Public Access"
-- Operation: SELECT
-- Target roles: public
-- Policy definition:
true
```

#### Policy 2: Allow Authenticated Users to Upload
```sql
-- Policy Name: "Authenticated users can upload"
-- Operation: INSERT
-- Target roles: authenticated
-- Policy definition:
auth.uid() IS NOT NULL
```

#### Policy 3: Allow Users to Update Their Own Files
```sql
-- Policy Name: "Users can update own files"
-- Operation: UPDATE
-- Target roles: authenticated
-- Policy definition:
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: Allow Users to Delete Their Own Files
```sql
-- Policy Name: "Users can delete own files"
-- Operation: DELETE
-- Target roles: authenticated
-- Policy definition:
auth.uid()::text = (storage.foldername(name))[1]
```

## Step 3: Alternative Storage Setup (If Manual Setup Doesn't Work)

If the manual setup is complex, you can temporarily disable image uploads and use fallback images:

### Option A: Use External Image Service
Update the fallback image URL in the code to use a reliable CDN:

```typescript
// In CreateIssueDialog.tsx, replace the fallback URL with:
const fallbackImage = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop";
```

### Option B: Disable Image Uploads Temporarily
Comment out the image upload functionality in `CreateIssueDialog.tsx` until storage is properly configured.

## Step 4: Verify the Fix

After completing the above steps:

1. **Test issue creation** - Create a new issue without images first
2. **Test voting** - Try voting on an issue
3. **Test watching** - Try watching/unwatching an issue
4. **Test image upload** - Try creating an issue with an image

## Expected Results

After these fixes:
- ✅ No more 404 errors for `votes` and `watchers` tables
- ✅ Image uploads work without RLS policy errors
- ✅ Issues can be created, voted on, and watched successfully
- ✅ All database operations work smoothly

## Troubleshooting

### If you still get 404 errors:
- Verify the migration script ran successfully
- Check that the tables exist in your database schema
- Ensure RLS is enabled and policies are created

### If image uploads still fail:
- Verify the storage bucket exists and is public
- Check that all storage policies are created correctly
- Test with a small image file first

### If images don't load:
- Check browser console for CORS errors
- Verify the storage bucket is public
- Test the image URLs directly in browser
