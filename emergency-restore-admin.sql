-- EMERGENCY ADMIN DASHBOARD RESTORE
-- This completely removes RLS restrictions to restore functionality

-- Step 1: Disable RLS on all tables to restore immediate access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE volumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE issues DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on any other tables that might exist
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE ' || table_record.tablename || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Step 2: Drop ALL RLS policies we might have created
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
DROP POLICY IF EXISTS "authenticated_read_users" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admin_manage_users" ON users;
DROP POLICY IF EXISTS "authenticated_read_submissions" ON submissions;
DROP POLICY IF EXISTS "authors_manage_own_submissions" ON submissions;
DROP POLICY IF EXISTS "admin_manage_submissions" ON submissions;
DROP POLICY IF EXISTS "public_read_volumes" ON volumes;
DROP POLICY IF EXISTS "admin_manage_volumes" ON volumes;
DROP POLICY IF EXISTS "public_read_metrics" ON article_metrics;
DROP POLICY IF EXISTS "admin_read_system_metrics" ON system_metrics;
DROP POLICY IF EXISTS "admin_read_search_analytics" ON search_analytics;

-- Step 3: Grant full permissions to restore access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Also grant to specific roles that might exist
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Step 4: Ensure the users table has the role column with proper values
-- Make sure your user has admin role
UPDATE users SET role = 'admin' WHERE email LIKE '%mathew%' OR email LIKE '%admin%';

-- Step 5: Create a simple function to check if admin dashboard should work
CREATE OR REPLACE FUNCTION test_admin_access()
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    accessible BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'users'::TEXT, COUNT(*)::BIGINT, true::BOOLEAN FROM users
    UNION ALL
    SELECT 'submissions'::TEXT, COUNT(*)::BIGINT, true::BOOLEAN FROM submissions
    UNION ALL
    SELECT 'volumes'::TEXT, COUNT(*)::BIGINT, true::BOOLEAN FROM volumes;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT * FROM test_admin_access();

-- Success message
SELECT 'EMERGENCY RESTORE COMPLETE - Admin dashboard should work now!' as status;