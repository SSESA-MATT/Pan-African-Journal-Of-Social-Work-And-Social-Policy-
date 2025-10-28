-- Complete Database Setup for Pan-African Journal Platform
-- Run this in Supabase SQL Editor to ensure all tables exist

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'reviewer', 'author')),
  affiliation VARCHAR(255),
  bio TEXT,
  expertise TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volumes table
CREATE TABLE IF NOT EXISTS volumes (
  id SERIAL PRIMARY KEY,
  volume_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(volume_number, year)
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  volume_id INTEGER REFERENCES volumes(id) ON DELETE CASCADE,
  issue_number INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  cover_image_url VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(volume_id, issue_number)
);

-- Submissions table with all necessary columns
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  abstract TEXT NOT NULL,
  content TEXT,
  keywords TEXT[],
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  co_authors JSONB DEFAULT '[]',
  corresponding_author VARCHAR(255),
  manuscript_file_url VARCHAR(500),
  supplementary_files JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'published')),
  submission_type VARCHAR(50) DEFAULT 'research_article',
  manuscript_type VARCHAR(100) DEFAULT 'research_article',
  word_count INTEGER DEFAULT 0,
  funding_information TEXT,
  conflict_of_interest TEXT,
  ethics_approval TEXT,
  data_availability TEXT,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviewer assignments table
CREATE TABLE IF NOT EXISTS reviewer_assignments (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'declined')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, reviewer_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assignment_id INTEGER REFERENCES reviewer_assignments(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined')),
  recommendation VARCHAR(20) CHECK (recommendation IN ('accept', 'minor_revisions', 'major_revisions', 'reject')),
  comments TEXT,
  comments_to_author TEXT,
  comments_to_editor TEXT,
  review_file_url VARCHAR(500),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table (published submissions)
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  issue_id INTEGER REFERENCES issues(id) ON DELETE SET NULL,
  volume_id INTEGER REFERENCES volumes(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  abstract TEXT NOT NULL,
  content TEXT,
  keywords TEXT[],
  authors JSONB NOT NULL,
  pdf_url VARCHAR(500),
  doi VARCHAR(100) UNIQUE,
  page_start INTEGER,
  page_end INTEGER,
  citation_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  article_type VARCHAR(50) DEFAULT 'research_article',
  language_code VARCHAR(10) DEFAULT 'en',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  file_size INTEGER NOT NULL,
  upload_purpose VARCHAR(50),
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table (for review process communication)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submission_date ON submissions(submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_reviewer_id ON reviewer_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_submission_id ON reviewer_assignments(submission_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_status ON reviewer_assignments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_submission_id ON reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_articles_issue_id ON articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;

DROP POLICY IF EXISTS "Authors can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Authors can create submissions" ON submissions;
DROP POLICY IF EXISTS "Authors can update own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Reviewers can view assigned submissions" ON submissions;

DROP POLICY IF EXISTS "Reviewers can view own assignments" ON reviewer_assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON reviewer_assignments;

DROP POLICY IF EXISTS "Reviewers can manage own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;

DROP POLICY IF EXISTS "Articles are publicly readable" ON articles;

-- Create comprehensive RLS policies

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

-- Submissions policies
CREATE POLICY "Authors can view own submissions" ON submissions
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can create submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own submissions" ON submissions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all submissions" ON submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Reviewers can view assigned submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviewer_assignments 
      WHERE reviewer_assignments.submission_id = submissions.id 
      AND reviewer_assignments.reviewer_id = auth.uid()
    )
  );

-- Reviewer assignments policies
CREATE POLICY "Reviewers can view own assignments" ON reviewer_assignments
  FOR SELECT USING (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update own assignments" ON reviewer_assignments
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can manage assignments" ON reviewer_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

-- Reviews policies
CREATE POLICY "Reviewers can manage own reviews" ON reviews
  FOR ALL USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authors can view reviews of their submissions" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE submissions.id = reviews.submission_id 
      AND submissions.author_id = auth.uid()
    )
  );

-- Articles policies (publicly readable)
CREATE POLICY "Articles are publicly readable" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage articles" ON articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

-- File uploads policies
CREATE POLICY "Users can view own uploads" ON file_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create uploads" ON file_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view related comments" ON comments
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT author_id FROM submissions WHERE id = comments.submission_id
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ language 'plpgsql';

-- Create triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_volumes_updated_at ON volumes;
CREATE TRIGGER update_volumes_updated_at BEFORE UPDATE ON volumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviewer_assignments_updated_at ON reviewer_assignments;
CREATE TRIGGER update_reviewer_assignments_updated_at BEFORE UPDATE ON reviewer_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to sync user metadata to users table after email confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $
BEGIN
  -- Only insert if user doesn't already exist and email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    INSERT INTO public.users (id, email, first_name, last_name, affiliation, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'affiliation', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'author')
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      affiliation = EXCLUDED.affiliation,
      role = EXCLUDED.role,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profile on email confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default volume and issue for testing
INSERT INTO volumes (volume_number, year, title, description, is_published) VALUES
(1, 2024, 'Inaugural Volume', 'The first volume of the Pan-African Journal of Social Work and Social Policy', true)
ON CONFLICT (volume_number, year) DO NOTHING;

INSERT INTO issues (volume_id, issue_number, title, description, is_published) VALUES
(1, 1, 'Issue 1: Foundations of African Social Work', 'Exploring foundational concepts in African social work practice', true)
ON CONFLICT (volume_id, issue_number) DO NOTHING;