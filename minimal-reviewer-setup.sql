-- Minimal setup for existing reviewers to access real submissions
-- This works with your existing registered users
-- Run this in Supabase SQL Editor

-- Step 1: Ensure required columns exist in reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Step 2: Ensure required columns exist in submissions table  
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_type VARCHAR(50) DEFAULT 'research_article';

-- Step 3: Create the function to get reviewer-specific submissions
CREATE OR REPLACE FUNCTION get_submissions_for_reviewer(reviewer_user_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR(500),
  abstract TEXT,
  submission_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  submission_type VARCHAR(50),
  keywords JSONB,
  author_id UUID,
  author_first_name VARCHAR(100),
  author_last_name VARCHAR(100),
  author_affiliation VARCHAR(255),
  review_id VARCHAR(255),
  review_status VARCHAR(20),
  review_assigned_at TIMESTAMP WITH TIME ZONE,
  review_due_date TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.abstract,
    s.submission_date,
    s.created_at,
    COALESCE(s.submission_type, 'research_article') as submission_type,
    s.keywords,
    s.author_id,
    u.first_name as author_first_name,
    u.last_name as author_last_name,
    u.affiliation as author_affiliation,
    r.id as review_id,
    r.status as review_status,
    r.assigned_at as review_assigned_at,
    r.due_date as review_due_date
  FROM submissions s
  INNER JOIN reviews r ON s.id = r.submission_id
  LEFT JOIN users u ON s.author_id = u.id
  WHERE r.reviewer_id = reviewer_user_id
  AND r.status IN ('pending', 'in_progress')
  ORDER BY r.assigned_at ASC;
END;
$$;

-- Step 4: Create fallback function for general submissions
CREATE OR REPLACE FUNCTION get_submissions_for_review()
RETURNS TABLE (
  id UUID,
  title VARCHAR(500),
  abstract TEXT,
  submission_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  submission_type VARCHAR(50),
  keywords JSONB,
  author_id UUID,
  author_first_name VARCHAR(100),
  author_last_name VARCHAR(100),
  author_affiliation VARCHAR(255),
  review_id VARCHAR(255),
  review_status VARCHAR(20),
  review_assigned_at TIMESTAMP WITH TIME ZONE,
  review_due_date TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.abstract,
    s.submission_date,
    s.created_at,
    COALESCE(s.submission_type, 'research_article') as submission_type,
    s.keywords,
    s.author_id,
    u.first_name as author_first_name,
    u.last_name as author_last_name,
    u.affiliation as author_affiliation,
    r.id as review_id,
    r.status as review_status,
    r.assigned_at as review_assigned_at,
    r.due_date as review_due_date
  FROM submissions s
  LEFT JOIN reviews r ON s.id = r.submission_id
  LEFT JOIN users u ON s.author_id = u.id
  WHERE s.status IN ('submitted', 'under_review')
  ORDER BY s.submission_date DESC
  LIMIT 10;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_submissions_for_reviewer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_submissions_for_review() TO authenticated;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 6: Check existing data (you can uncomment these to verify your setup)
-- SELECT 'Users with reviewer role:' as info;
-- SELECT id, email, first_name, last_name, role FROM users WHERE role IN ('reviewer', 'editor', 'admin');

-- SELECT 'Existing submissions:' as info;
-- SELECT id, title, status, author_id, submission_date FROM submissions LIMIT 5;

-- SELECT 'Review assignments:' as info;
-- SELECT r.id, s.title, u.first_name || ' ' || u.last_name as reviewer_name, r.status 
-- FROM reviews r 
-- JOIN submissions s ON r.submission_id = s.id 
-- JOIN users u ON r.reviewer_id = u.id 
-- LIMIT 5;