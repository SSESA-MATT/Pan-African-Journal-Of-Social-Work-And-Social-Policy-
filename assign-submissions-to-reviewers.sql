-- Script to assign existing submissions to reviewers
-- Modify the UUIDs below to match your actual reviewer and submission IDs
-- Run this AFTER checking your existing setup with check-existing-setup.sql

-- First, let's see what we have to work with:
-- Uncomment and run these to see your data:

-- SELECT 'Your reviewers:' as info;
-- SELECT id, email, first_name, last_name FROM users WHERE role = 'reviewer';

-- SELECT 'Your submissions:' as info; 
-- SELECT id, title, status FROM submissions WHERE status IN ('submitted', 'under_review');

-- Example assignments - REPLACE THE UUIDs WITH YOUR ACTUAL DATA:
-- 
-- INSERT INTO reviews (
--   id, 
--   submission_id, 
--   reviewer_id, 
--   status, 
--   assigned_at, 
--   due_date
-- ) VALUES 
-- (
--   gen_random_uuid(), -- generates a random UUID for the review
--   'YOUR_SUBMISSION_ID_HERE', -- replace with actual submission ID
--   'YOUR_REVIEWER_ID_HERE',   -- replace with actual reviewer ID
--   'pending',
--   NOW(),
--   NOW() + INTERVAL '21 days'
-- );

-- Here's a template to create assignments:
-- Copy this template and fill in your actual IDs:

/*
INSERT INTO reviews (
  id, 
  submission_id, 
  reviewer_id, 
  status, 
  assigned_at, 
  due_date,
  comments_to_author,
  comments_to_editor
) VALUES 
(
  gen_random_uuid(),
  'SUBMISSION_UUID_HERE',  -- Get from submissions table
  'REVIEWER_UUID_HERE',    -- Get from users table where role='reviewer'
  'pending',
  NOW(),
  NOW() + INTERVAL '21 days',
  NULL,
  NULL
);
*/

-- Or use this dynamic query to assign the first submission to the first reviewer:
-- (Uncomment to use - but be careful, this will create real assignments!)

/*
WITH first_submission AS (
  SELECT id FROM submissions 
  WHERE status = 'submitted' 
  ORDER BY created_at DESC 
  LIMIT 1
),
first_reviewer AS (
  SELECT id FROM users 
  WHERE role = 'reviewer' 
  ORDER BY created_at 
  LIMIT 1
)
INSERT INTO reviews (
  id, 
  submission_id, 
  reviewer_id, 
  status, 
  assigned_at, 
  due_date
)
SELECT 
  gen_random_uuid(),
  fs.id,
  fr.id,
  'pending',
  NOW(),
  NOW() + INTERVAL '21 days'
FROM first_submission fs, first_reviewer fr
WHERE NOT EXISTS (
  SELECT 1 FROM reviews 
  WHERE submission_id = fs.id AND reviewer_id = fr.id
);
*/