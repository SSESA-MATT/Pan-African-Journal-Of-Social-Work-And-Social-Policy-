-- Diagnostic queries to check why the submission isn't showing up
-- Run these in Supabase SQL Editor to diagnose the issue

-- 1. Check the exact structure and values of your submission
SELECT 
  id,
  title,
  abstract,
  status,
  submission_date,
  created_at,
  submission_type,
  author_id,
  keywords
FROM submissions 
WHERE title ILIKE '%Intersections%'
LIMIT 5;

-- 2. Check all submissions and their statuses
SELECT 
  id,
  title,
  status,
  author_id,
  submission_date,
  created_at
FROM submissions 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check what columns actually exist in your submissions table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check the users table for the author
SELECT 
  id,
  email,
  first_name,
  last_name,
  role
FROM users 
WHERE id::text LIKE '5c8908ab-df6%';

-- 5. Test the exact query the API is using
SELECT 
  s.id,
  s.title,
  s.abstract,
  s.keywords,
  s.status,
  s.submission_date,
  s.created_at,
  s.submission_type,
  u.first_name,
  u.last_name,
  u.affiliation
FROM submissions s
LEFT JOIN users u ON s.author_id = u.id
WHERE s.status IN ('submitted', 'under_review')
ORDER BY s.submission_date DESC
LIMIT 10;