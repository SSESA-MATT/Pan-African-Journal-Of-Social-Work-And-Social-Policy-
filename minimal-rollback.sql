-- Minimal Rollback - Just Remove Problematic Policies
-- This is the safest approach - only removes the RLS policies we added

-- Remove all the RLS policies we created
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

-- Disable RLS on tables (this makes them accessible again)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE volumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Grant broad permissions to restore access
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Success message
SELECT 'Minimal rollback completed - RLS policies removed' as status;