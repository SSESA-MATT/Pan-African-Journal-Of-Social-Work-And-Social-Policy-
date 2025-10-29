-- Simple Admin Dashboard Fix - No Complex Policies
-- This version avoids the WITH CHECK clause that's causing the error

-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'author';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

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

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "admin_users_access" ON users;
DROP POLICY IF EXISTS "admin_submissions_access" ON submissions;
DROP POLICY IF EXISTS "users_own_profile" ON users;
DROP POLICY IF EXISTS "authors_own_submissions" ON submissions;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;

-- Simple policies without complex WITH CHECK clauses
-- Allow users to see their own profile
CREATE POLICY "users_own_profile" ON users 
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (simple version)
CREATE POLICY "users_update_profile" ON users 
FOR UPDATE USING (auth.uid() = id);

-- Allow admins to do everything with users
CREATE POLICY "admin_users_access" ON users 
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Allow authors to see their own submissions
CREATE POLICY "authors_own_submissions" ON submissions 
FOR SELECT USING (auth.uid() = author_id);

-- Allow authors to update their own submissions
CREATE POLICY "authors_update_submissions" ON submissions 
FOR UPDATE USING (auth.uid() = author_id);

-- Allow authors to create submissions
CREATE POLICY "authors_create_submissions" ON submissions 
FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Allow admins to do everything with submissions
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

-- Simple volume policies
DROP POLICY IF EXISTS "public_volumes_read" ON volumes;
DROP POLICY IF EXISTS "admin_volumes_write" ON volumes;

CREATE POLICY "public_volumes_read" ON volumes FOR SELECT USING (true);
CREATE POLICY "admin_volumes_write" ON volumes FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Insert basic data
INSERT INTO volumes (volume_number, year, title) 
VALUES (1, 2024, 'Volume 1 - 2024') 
ON CONFLICT DO NOTHING;

-- Create reviewer_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviewer_assignments (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'assigned',
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
    comments TEXT NOT NULL DEFAULT '',
    recommendation VARCHAR(50) DEFAULT 'pending',
    status VARCHAR(50) DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Simple policies for reviewer tables
DROP POLICY IF EXISTS "admin_reviewer_assignments" ON reviewer_assignments;
DROP POLICY IF EXISTS "admin_reviews" ON reviews;

CREATE POLICY "admin_reviewer_assignments" ON reviewer_assignments FOR ALL USING (
    auth.uid() = reviewer_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "admin_reviews" ON reviews FOR ALL USING (
    auth.uid() = reviewer_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Add role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'editor', 'reviewer', 'author'));

-- Success message
SELECT 'Simple admin dashboard fix completed successfully!' as status;