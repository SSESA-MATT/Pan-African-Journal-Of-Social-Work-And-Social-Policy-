-- Targeted Admin Fix - Keep Progress, Fix Issues
-- This keeps the good changes and fixes only the problematic parts

-- Step 1: Make RLS policies more permissive (instead of removing them)
-- This should restore analytics and dashboard functionality

-- Drop the restrictive policies
DROP POLICY IF EXISTS "users_own_profile" ON users;
DROP POLICY IF EXISTS "users_update_profile" ON users;
DROP POLICY IF EXISTS "admin_users_access" ON users;
DROP POLICY IF EXISTS "authors_own_submissions" ON submissions;
DROP POLICY IF EXISTS "authors_update_submissions" ON submissions;
DROP POLICY IF EXISTS "authors_create_submissions" ON submissions;
DROP POLICY IF EXISTS "admin_submissions_access" ON submissions;

-- Create more permissive policies that allow analytics to work
-- Allow authenticated users to read most data (for analytics)
CREATE POLICY "authenticated_read_users" ON users 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "users_update_own" ON users 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admin_manage_users" ON users 
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- More permissive submission policies
CREATE POLICY "authenticated_read_submissions" ON submissions 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authors_manage_own_submissions" ON submissions 
FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "admin_manage_submissions" ON submissions 
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Keep volumes accessible for analytics
DROP POLICY IF EXISTS "public_volumes_read" ON volumes;
DROP POLICY IF EXISTS "admin_volumes_write" ON volumes;

CREATE POLICY "public_read_volumes" ON volumes FOR SELECT USING (true);
CREATE POLICY "admin_manage_volumes" ON volumes FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Step 2: Ensure analytics tables are accessible
-- Enable RLS but with permissive policies for analytics tables that might exist

-- Check if these tables exist and make them accessible for analytics
DO $$
BEGIN
    -- Make article_metrics accessible if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_metrics') THEN
        ALTER TABLE article_metrics ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "public_read_metrics" ON article_metrics;
        CREATE POLICY "public_read_metrics" ON article_metrics FOR SELECT USING (true);
    END IF;
    
    -- Make system_metrics accessible if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_metrics') THEN
        ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "admin_read_system_metrics" ON system_metrics;
        CREATE POLICY "admin_read_system_metrics" ON system_metrics FOR SELECT USING (
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
        );
    END IF;
    
    -- Make search_analytics accessible if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'search_analytics') THEN
        ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "admin_read_search_analytics" ON search_analytics;
        CREATE POLICY "admin_read_search_analytics" ON search_analytics FOR SELECT USING (
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
        );
    END IF;
END $$;

-- Step 3: Grant necessary permissions for analytics and dashboard
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 4: Create a view for admin analytics (if needed)
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    'users' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_count
FROM users
UNION ALL
SELECT 
    'submissions' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_count
FROM submissions;

-- Grant access to the view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Success message
SELECT 'Targeted fix applied - analytics should be restored' as status;