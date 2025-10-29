-- Safe Base Schema Migration - Core Tables for Journal Platform
-- This migration safely creates tables and handles existing schemas

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Check if users table exists and add missing columns
DO $$
BEGIN
    -- Create users table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            role VARCHAR(50) NOT NULL DEFAULT 'author' 
                CHECK (role IN ('admin', 'editor', 'reviewer', 'author')),
            affiliation VARCHAR(255),
            bio TEXT,
            orcid VARCHAR(50),
            expertise TEXT[],
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add missing columns to existing users table
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
            ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'expertise') THEN
            ALTER TABLE users ADD COLUMN expertise TEXT[];
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'orcid') THEN
            ALTER TABLE users ADD COLUMN orcid VARCHAR(50);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
            ALTER TABLE users ADD COLUMN bio TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'affiliation') THEN
            ALTER TABLE users ADD COLUMN affiliation VARCHAR(255);
        END IF;
    END IF;
END $$;

-- Volumes table
CREATE TABLE IF NOT EXISTS volumes (
    id SERIAL PRIMARY KEY,
    volume_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(volume_number, year)
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    volume_id INTEGER NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
    issue_number INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT,
    cover_image_url VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(volume_id, issue_number)
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT[],
    manuscript_type VARCHAR(50) DEFAULT 'research_article' 
        CHECK (manuscript_type IN ('research_article', 'review_article', 'case_study', 'editorial', 'letter', 'book_review')),
    status VARCHAR(50) NOT NULL DEFAULT 'submitted' 
        CHECK (status IN ('submitted', 'under_review', 'assigned_for_review', 'revision_requested', 'accepted', 'rejected', 'published', 'withdrawn')),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    co_authors JSONB DEFAULT '[]',
    manuscript_file_url VARCHAR(500),
    manuscript_file_name VARCHAR(255),
    manuscript_file_size INTEGER,
    supplementary_files JSONB DEFAULT '[]',
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    editorial_decision VARCHAR(50),
    editorial_comments TEXT,
    decision_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Articles table (published submissions)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    issue_id INTEGER REFERENCES issues(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT[],
    authors JSONB NOT NULL DEFAULT '[]',
    manuscript_type VARCHAR(50) DEFAULT 'research_article',
    content TEXT,
    pdf_url VARCHAR(500),
    html_url VARCHAR(500),
    page_start INTEGER,
    page_end INTEGER,
    article_number VARCHAR(50),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Only create is_active index if the column exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_manuscript_type ON submissions(manuscript_type);
CREATE INDEX IF NOT EXISTS idx_submissions_submission_date ON submissions(submission_date);
CREATE INDEX IF NOT EXISTS idx_submissions_title_gin ON submissions USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_submissions_abstract_gin ON submissions USING gin(to_tsvector('english', abstract));

CREATE INDEX IF NOT EXISTS idx_articles_issue_id ON articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_articles_submission_id ON articles(submission_id);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_title_gin ON articles USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_volumes_year ON volumes(year);
CREATE INDEX IF NOT EXISTS idx_volumes_is_published ON volumes(is_published);

CREATE INDEX IF NOT EXISTS idx_issues_volume_id ON issues(volume_id);
CREATE INDEX IF NOT EXISTS idx_issues_is_published ON issues(is_published);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'volumes') THEN
        DROP TRIGGER IF EXISTS update_volumes_updated_at ON volumes;
        CREATE TRIGGER update_volumes_updated_at BEFORE UPDATE ON volumes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'issues') THEN
        DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
        CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'submissions') THEN
        DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
        CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles') THEN
        DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
        CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Drop existing submission policies
DROP POLICY IF EXISTS "Authors can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Authors can create submissions" ON submissions;
DROP POLICY IF EXISTS "Authors can update their own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins and editors can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins and editors can update all submissions" ON submissions;

-- RLS Policies for submissions table
CREATE POLICY "Authors can view their own submissions" ON submissions
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can create submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own submissions" ON submissions
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins and editors can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins and editors can update all submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Insert some initial data
INSERT INTO volumes (volume_number, year, title, description) VALUES 
(1, 2024, 'Volume 1 - 2024', 'Inaugural volume of the Pan African Journal of Social Work and Social Policy')
ON CONFLICT (volume_number, year) DO NOTHING;

INSERT INTO issues (volume_id, issue_number, title, description) VALUES 
(1, 1, 'Issue 1 - Foundations', 'Foundational articles establishing the journal''s scope and vision')
ON CONFLICT (volume_id, issue_number) DO NOTHING;

-- Add table comments for documentation
COMMENT ON TABLE users IS 'Extended user profiles linked to Supabase auth';
COMMENT ON TABLE volumes IS 'Journal volumes organized by year';
COMMENT ON TABLE issues IS 'Journal issues within volumes';
COMMENT ON TABLE submissions IS 'Manuscript submissions from authors';
COMMENT ON TABLE articles IS 'Published articles derived from accepted submissions';