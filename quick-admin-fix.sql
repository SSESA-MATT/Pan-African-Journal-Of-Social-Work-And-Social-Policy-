-- Quick Admin Dashboard Fix
-- Run this to get the admin dashboard working immediately

-- Just add the essential missing columns that are causing errors

-- Fix users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'author';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Fix submissions table (create if doesn't exist)
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL DEFAULT 'Untitled',
    abstract TEXT NOT NULL DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add basic indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow admins to see everything)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "admin_access_users" ON users;
DROP POLICY IF EXISTS "admin_access_submissions" ON submissions;

CREATE POLICY "admin_access_users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "admin_access_submissions" ON submissions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Insert a test admin user (replace with your actual user ID)
-- You'll need to get your user ID from Supabase auth and replace 'your-user-id-here'
-- INSERT INTO users (id, email, role, first_name, last_name) 
-- VALUES ('your-user-id-here', 'admin@example.com', 'admin', 'Admin', 'User')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Create a simple volumes table
CREATE TABLE IF NOT EXISTS volumes (
    id SERIAL PRIMARY KEY,
    volume_number INTEGER NOT NULL DEFAULT 1,
    year INTEGER NOT NULL DEFAULT 2024,
    title VARCHAR(255) DEFAULT 'Volume 1'
);

INSERT INTO volumes (volume_number, year, title) VALUES (1, 2024, 'Volume 1 - 2024') ON CONFLICT DO NOTHING;