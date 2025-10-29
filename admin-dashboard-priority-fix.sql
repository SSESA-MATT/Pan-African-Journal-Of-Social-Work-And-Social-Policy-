-- Priority Fix: Get Admin Dashboard Working
-- This focuses only on the essential tables for admin functionality

-- First, let's see what we're working with
-- Run this to check current table structure:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Essential fix for admin dashboard
-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'author';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Ensure submissions table exists with basic structure
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL DEFAULT 'Untitled',
    abstract TEXT NOT NULL DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    author_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add essential columns to submissions if missing
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS manuscript_type VARCHAR(50) DEFAULT 'research_article';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS co_authors JSONB DEFAULT '[]';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS editorial_decision VARCHAR(50);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS editorial_comments TEXT;

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON submissions(author_id);

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create simple admin policies (drop existing first)
DROP POLICY IF EXISTS "admin_users_access" ON users;
DROP POLICY IF EXISTS "admin_submissions_access" ON submissions;
DROP POLICY IF EXISTS "users_own_profile" ON users;
DROP POLICY IF EXISTS "authors_own_submissions" ON submissions;

-- Allow users to see their own profile
CREATE POLICY "users_own_profile" ON users 
FOR SELECT USING (auth.uid() = id);

-- Allow admins to see and modify all users (including role changes)
CREATE POLICY "admin_users_access" ON users 
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Allow users to update their own profile (but not role)
CREATE POLICY "users_update_own_profile" ON users 
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    -- Users cannot change their own role
    (OLD.role = NEW.role OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor')))
);

-- Allow authors to see their own submissions
CREATE POLICY "authors_own_submissions" ON submissions 
FOR SELECT USING (auth.uid() = author_id);

-- Allow admins to see all submissions
CREATE POLICY "admin_submissions_access" ON submissions 
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Create basic volumes table for admin dashboard
CREATE TABLE IF NOT EXISTS volumes (
    id SERIAL PRIMARY KEY,
    volume_number INTEGER NOT NULL DEFAULT 1,
    year INTEGER NOT NULL DEFAULT 2024,
    title VARCHAR(255) DEFAULT 'Volume 1'
);

-- Enable RLS on volumes
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to volumes
DROP POLICY IF EXISTS "public_volumes_read" ON volumes;
CREATE POLICY "public_volumes_read" ON volumes FOR SELECT USING (true);

-- Allow admin write access to volumes
DROP POLICY IF EXISTS "admin_volumes_write" ON volumes;
CREATE POLICY "admin_volumes_write" ON volumes FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Insert basic data
INSERT INTO volumes (volume_number, year, title) 
VALUES (1, 2024, 'Volume 1 - 2024') 
ON CONFLICT DO NOTHING;

-- Create reviewer_assignments table if it doesn't exist (needed for admin dashboard)
CREATE TABLE IF NOT EXISTS reviewer_assignments (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'declined')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on reviewer_assignments
ALTER TABLE reviewer_assignments ENABLE ROW LEVEL SECURITY;

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comments TEXT NOT NULL,
    recommendation VARCHAR(50) NOT NULL CHECK (recommendation IN ('accept', 'minor_revisions', 'major_revisions', 'reject')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'completed')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Basic policies for reviewer tables
DROP POLICY IF EXISTS "admin_reviewer_assignments" ON reviewer_assignments;
CREATE POLICY "admin_reviewer_assignments" ON reviewer_assignments FOR ALL USING (
    auth.uid() = reviewer_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

DROP POLICY IF EXISTS "admin_reviews" ON reviews;
CREATE POLICY "admin_reviews" ON reviews FOR ALL USING (
    auth.uid() = reviewer_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Add some test data to make admin dashboard functional
-- (You can remove this later)
INSERT INTO users (id, email, role, first_name, last_name) 
SELECT 
    auth.uid(),
    'admin@example.com',
    'admin',
    'Admin',
    'User'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Ensure role constraint is properly set
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'editor', 'reviewer', 'author'));

-- Create a function to help admins promote users to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
    current_user_role TEXT;
BEGIN
    -- Check if current user is admin
    SELECT role INTO current_user_role 
    FROM users 
    WHERE id = auth.uid();
    
    IF current_user_role != 'admin' THEN
        RETURN 'Error: Only admins can promote users';
    END IF;
    
    -- Find the target user
    SELECT id INTO target_user_id 
    FROM users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'Error: User not found';
    END IF;
    
    -- Update the user role
    UPDATE users 
    SET role = 'admin', updated_at = CURRENT_TIMESTAMP 
    WHERE id = target_user_id;
    
    RETURN 'Success: User promoted to admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to help with bulk role updates
CREATE OR REPLACE FUNCTION bulk_update_user_roles(user_ids UUID[], new_role TEXT)
RETURNS TEXT AS $$
DECLARE
    current_user_role TEXT;
    updated_count INTEGER;
BEGIN
    -- Check if current user is admin
    SELECT role INTO current_user_role 
    FROM users 
    WHERE id = auth.uid();
    
    IF current_user_role NOT IN ('admin', 'editor') THEN
        RETURN 'Error: Insufficient permissions';
    END IF;
    
    -- Validate role
    IF new_role NOT IN ('admin', 'editor', 'reviewer', 'author') THEN
        RETURN 'Error: Invalid role';
    END IF;
    
    -- Update user roles
    UPDATE users 
    SET role = new_role, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ANY(user_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN 'Success: Updated ' || updated_count || ' users to ' || new_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some helpful views for admin dashboard
CREATE OR REPLACE VIEW admin_user_summary AS
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_signups
FROM users 
GROUP BY role;

-- Grant permissions on the view
GRANT SELECT ON admin_user_summary TO authenticated;

-- Success message
SELECT 'Admin dashboard with role management ready!' as status;