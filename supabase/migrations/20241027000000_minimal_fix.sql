-- Minimal Database Fix - Only add what's absolutely necessary
-- This migration focuses on getting the admin dashboard working

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Step 1: Ensure users table exists with minimal required columns
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'author' 
        CHECK (role IN ('admin', 'editor', 'reviewer', 'author')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Ensure submissions table exists with minimal required columns
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted' 
        CHECK (status IN ('submitted', 'under_review', 'assigned_for_review', 'revision_requested', 'accepted', 'rejected', 'published', 'withdrawn')),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add missing columns to existing tables (safely)
DO $$
BEGIN
    -- Add missing columns to users table if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'affiliation') THEN
        ALTER TABLE users ADD COLUMN affiliation VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'orcid') THEN
        ALTER TABLE users ADD COLUMN orcid VARCHAR(50);
    END IF;
    
    -- Add missing columns to submissions table if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'keywords') THEN
        ALTER TABLE submissions ADD COLUMN keywords TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'manuscript_type') THEN
        ALTER TABLE submissions ADD COLUMN manuscript_type VARCHAR(50) DEFAULT 'research_article';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'co_authors') THEN
        ALTER TABLE submissions ADD COLUMN co_authors JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'manuscript_file_url') THEN
        ALTER TABLE submissions ADD COLUMN manuscript_file_url VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'submission_date') THEN
        ALTER TABLE submissions ADD COLUMN submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'editorial_decision') THEN
        ALTER TABLE submissions ADD COLUMN editorial_decision VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'editorial_comments') THEN
        ALTER TABLE submissions ADD COLUMN editorial_comments TEXT;
    END IF;
END $$;

-- Step 4: Create essential indexes (only if columns exist)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Step 5: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Step 6: Create basic RLS policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Authors can view their own submissions" ON users;
DROP POLICY IF EXISTS "Admins and editors can view all submissions" ON submissions;

-- Basic user policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Basic submission policies  
CREATE POLICY "Authors can view their own submissions" ON submissions
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Admins and editors can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Step 7: Create a simple volumes table for basic functionality
CREATE TABLE IF NOT EXISTS volumes (
    id SERIAL PRIMARY KEY,
    volume_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic volume data
INSERT INTO volumes (volume_number, year, title) VALUES 
(1, 2024, 'Volume 1 - 2024')
ON CONFLICT DO NOTHING;

-- Add basic table comments
COMMENT ON TABLE users IS 'User profiles for the journal system';
COMMENT ON TABLE submissions IS 'Manuscript submissions from authors';
COMMENT ON TABLE volumes IS 'Journal volumes';