-- Quick check script for existing reviewer setup
-- Run these queries in Supabase SQL Editor to verify your current setup

-- 1. Check all users and their roles
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role,
  created_at
FROM users 
WHERE role IN ('reviewer', 'editor', 'admin')
ORDER BY role, email;

-- 2. Check all submissions
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

-- 3. Check existing review assignments (if any)
SELECT 
  r.id as review_id,
  s.title as submission_title,
  s.status as submission_status,
  u.email as reviewer_email,
  u.first_name || ' ' || u.last_name as reviewer_name,
  r.status as review_status,
  r.assigned_at,
  r.due_date
FROM reviews r
JOIN submissions s ON r.submission_id = s.id
JOIN users u ON r.reviewer_id = u.id
ORDER BY r.assigned_at DESC;

-- 4. Check auth.users to see registered users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;