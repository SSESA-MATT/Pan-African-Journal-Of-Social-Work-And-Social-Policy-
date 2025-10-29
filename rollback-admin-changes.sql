-- Rollback Admin Dashboard Changes
-- This script undoes the changes made by the admin fix scripts

-- Step 1: Remove the policies we created
DROP POLICY IF EXISTS "users_own_profile" ON users;
DROP POLICY IF EXISTS "users_update_profile" ON users;
DROP POLICY IF EXISTS "admin_users_access" ON users;
DROP POLICY IF EXISTS "authors_own_submissions" ON submissions;
DROP POLICY IF EXISTS "authors_update_submissions" ON submissions;
DROP POLICY IF EXISTS "authors_create_submissions" ON submissions;
DROP POLICY IF EXISTS "admin_submissions_access" ON submissions;
DROP POLICY IF EXISTS "public_volumes_read" ON volumes;
DROP POLICY IF EXISTS "admin_volumes_write" ON volumes;
DROP POLICY IF EXISTS "admin_reviewer_assignments" ON reviewer_assignments;
DROP POLICY IF EXISTS "admin_reviews" ON reviews;

-- Step 2: Disable RLS on tables we enabled it on (if they weren't using it before)
-- Note: Only disable if you're sure these tables didn't have RLS before
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE volumes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviewer_assignments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Step 3: Remove the constraint we added
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 4: Remove indexes we created (optional - these don't hurt to keep)
-- DROP INDEX IF EXISTS idx_users_role;
-- DROP INDEX IF EXISTS idx_users_email;
-- DROP INDEX IF EXISTS idx_submissions_status;
-- DROP INDEX IF EXISTS idx_submissions_author_id;

-- Step 5: Remove columns we added (BE CAREFUL - only remove if you're sure they didn't exist before)
-- WARNING: This will delete data! Only uncomment if you're sure these columns were added by our scripts

-- Check what columns exist first:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY column_name;

-- If you're sure these columns were added by our scripts, uncomment these lines:
-- ALTER TABLE users DROP COLUMN IF EXISTS role;
-- ALTER TABLE users DROP COLUMN IF EXISTS first_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS last_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS created_at;
-- ALTER TABLE users DROP COLUMN IF EXISTS updated_at;

-- ALTER TABLE submissions DROP COLUMN IF EXISTS keywords;
-- ALTER TABLE submissions DROP COLUMN IF EXISTS manuscript_type;
-- ALTER TABLE submissions DROP COLUMN IF EXISTS co_authors;
-- ALTER TABLE submissions DROP COLUMN IF EXISTS editorial_decision;
-- ALTER TABLE submissions DROP COLUMN IF EXISTS editorial_comments;

-- Step 6: Remove tables we created (only if they were created by our scripts)
-- WARNING: This will delete all data in these tables!

-- Check what tables exist first:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- If you're sure these tables were created by our scripts, uncomment these lines:
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS reviewer_assignments CASCADE;
-- DROP TABLE IF EXISTS volumes CASCADE;

-- Step 7: Re-enable any original RLS policies that might have existed
-- You'll need to recreate any original policies that were there before our changes
-- This depends on what your original setup was

-- Step 8: Restore original permissions
-- Grant basic permissions that might have been there originally
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Rollback completed. Check your admin dashboard now.' as status;

-- INSTRUCTIONS FOR SAFE ROLLBACK:
-- 1. First, run just the policy drops (Step 1) and test your dashboard
-- 2. If that fixes it, stop there
-- 3. If you still have issues, gradually uncomment other steps
-- 4. Always backup your data before dropping tables or columns!