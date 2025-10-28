-- Create a PostgreSQL function to safely fetch submissions for reviewers
-- This bypasses RLS issues by using a security definer function
-- Run this in Supabase SQL Editor

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
    s.submission_type,
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
  WHERE s.status IN ('submitted', 'under_review')
  AND r.status = 'pending'
  ORDER BY r.assigned_at ASC
  LIMIT 10;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_submissions_for_review() TO authenticated;

-- Create a function to get submissions assigned to a specific reviewer
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
    s.submission_type,
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

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_submissions_for_reviewer(UUID) TO authenticated;

-- Also create a simple function to get submission count for reviewers
CREATE OR REPLACE FUNCTION get_submission_counts_for_review()
RETURNS TABLE (
  total_submissions BIGINT,
  pending_review BIGINT,
  under_review BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'submitted') as pending_review,
    COUNT(*) FILTER (WHERE status = 'under_review') as under_review
  FROM submissions
  WHERE status IN ('submitted', 'under_review');
END;
$$;