-- 🔧 SETUP TEST DATA FOR ADMIN & REVIEWER FUNCTIONALITY
-- Run this in your Supabase SQL Editor to create comprehensive test data

-- Step 1: Verify current setup
SELECT 'Checking database setup...' as status;

-- Check if core tables exist
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN 'EXISTS' ELSE 'MISSING' END as users_table,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions') 
    THEN 'EXISTS' ELSE 'MISSING' END as submissions_table,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') 
    THEN 'EXISTS' ELSE 'MISSING' END as reviews_table;

-- Step 2: Create test users with different roles
INSERT INTO users (id, email, password_hash, first_name, last_name, affiliation, role, created_at, updated_at)
VALUES 
  -- Admin user (you can update this to your email)
  (gen_random_uuid(), 'admin@panafricanjournal.com', '$2b$10$dummy.hash', 'Admin', 'User', 'Pan-African Journal', 'admin', NOW(), NOW()),
  
  -- Editor user
  (gen_random_uuid(), 'editor@panafricanjournal.com', '$2b$10$dummy.hash', 'Chief', 'Editor', 'Editorial Board', 'editor', NOW(), NOW()),
  
  -- Reviewer users
  (gen_random_uuid(), 'reviewer1@university.edu', '$2b$10$dummy.hash', 'Dr. Sarah', 'Johnson', 'University of Cape Town', 'reviewer', NOW(), NOW()),
  (gen_random_uuid(), 'reviewer2@university.edu', '$2b$10$dummy.hash', 'Prof. James', 'Mbeki', 'University of Ghana', 'reviewer', NOW(), NOW()),
  (gen_random_uuid(), 'reviewer3@university.edu', '$2b$10$dummy.hash', 'Dr. Amina', 'Hassan', 'University of Nairobi', 'reviewer', NOW(), NOW()),
  
  -- Author users
  (gen_random_uuid(), 'author1@research.org', '$2b$10$dummy.hash', 'Dr. Michael', 'Okafor', 'Nigeria Research Institute', 'author', NOW(), NOW()),
  (gen_random_uuid(), 'author2@research.org', '$2b$10$dummy.hash', 'Dr. Fatima', 'Al-Rashid', 'Cairo Social Work Center', 'author', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Step 3: Create test submissions
INSERT INTO submissions (id, title, abstract, author_id, author_first_name, author_last_name, author_email, author_affiliation, status, submission_date, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  title,
  abstract,
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.affiliation,
  status,
  submission_date,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Community-Based Social Work Interventions in Rural Ghana', 'This study examines the effectiveness of community-based social work interventions in addressing poverty and social exclusion in rural Ghanaian communities...', 'under_review', '2024-01-15'::date),
    ('Mental Health Services for Refugees in East Africa', 'An analysis of mental health service provision for refugee populations across Kenya, Uganda, and Tanzania, highlighting gaps and recommendations...', 'peer_review', '2024-01-20'::date),
    ('Gender-Based Violence Prevention in South African Townships', 'This research explores innovative approaches to preventing gender-based violence through community engagement and policy advocacy...', 'under_review', '2024-01-25'::date),
    ('Child Welfare Systems in West African Countries', 'A comparative study of child welfare systems across Nigeria, Ghana, and Senegal, examining policy frameworks and implementation challenges...', 'revisions_requested', '2024-02-01'::date),
    ('Social Policy and Economic Development in Post-Conflict Societies', 'This paper analyzes the role of social policy in promoting economic development and social cohesion in post-conflict African societies...', 'accepted', '2024-02-05'::date)
) AS submissions_data(title, abstract, status, submission_date)
CROSS JOIN (
  SELECT id, first_name, last_name, email, affiliation 
  FROM users 
  WHERE role = 'author' 
  LIMIT 1
) u;

-- Step 4: Create review assignments
INSERT INTO reviews (id, submission_id, reviewer_id, reviewer_email, reviewer_first_name, reviewer_last_name, status, review_deadline, assigned_date, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  r.id,
  r.email,
  r.first_name,
  r.last_name,
  CASE 
    WHEN random() < 0.3 THEN 'completed'
    WHEN random() < 0.6 THEN 'in_progress'
    ELSE 'pending'
  END,
  (NOW() + INTERVAL '2 weeks')::date,
  NOW() - INTERVAL '1 week',
  NOW(),
  NOW()
FROM submissions s
CROSS JOIN (
  SELECT id, email, first_name, last_name
  FROM users 
  WHERE role = 'reviewer'
  ORDER BY random()
  LIMIT 2
) r
WHERE s.status IN ('peer_review', 'under_review');

-- Step 5: Create some completed reviews with feedback
INSERT INTO review_comments (id, review_id, reviewer_id, comments, recommendation, confidential_comments, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  r.id,
  r.reviewer_id,
  CASE 
    WHEN random() < 0.5 THEN 'This manuscript presents a well-structured analysis of community-based interventions. The methodology is sound and the findings are significant for the field of social work in Africa.'
    ELSE 'The paper addresses an important topic but would benefit from a more comprehensive literature review and clearer presentation of the theoretical framework.'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'accept'
    WHEN random() < 0.6 THEN 'minor_revisions'
    WHEN random() < 0.8 THEN 'major_revisions'
    ELSE 'reject'
  END,
  'Please ensure that the ethical considerations section is expanded to address potential cultural sensitivities.',
  NOW(),
  NOW()
FROM reviews r
WHERE r.status = 'completed';

-- Step 6: Create volumes and issues for publication workflow
INSERT INTO volumes (id, volume_number, year, title, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 1, 2024, 'Community Social Work in Africa', 'Inaugural volume focusing on community-based social work practices across African contexts', NOW(), NOW()),
  (gen_random_uuid(), 2, 2024, 'Mental Health and Social Policy', 'Volume exploring mental health interventions and policy frameworks', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO issues (id, volume_id, issue_number, title, publication_date, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  v.id,
  1,
  'Foundations of African Social Work',
  '2024-03-01'::date,
  NOW(),
  NOW()
FROM volumes v
WHERE v.volume_number = 1
LIMIT 1;

-- Step 7: Create helper functions for testing
CREATE OR REPLACE FUNCTION get_test_data_summary()
RETURNS TABLE(
  table_name text,
  record_count bigint,
  sample_data text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'users'::text, COUNT(*), string_agg(email || ' (' || role || ')', ', ')
  FROM users
  UNION ALL
  SELECT 'submissions'::text, COUNT(*), string_agg(LEFT(title, 30) || '...', '; ')
  FROM submissions
  UNION ALL
  SELECT 'reviews'::text, COUNT(*), string_agg(status, ', ')
  FROM reviews
  UNION ALL
  SELECT 'volumes'::text, COUNT(*), string_agg(title, ', ')
  FROM volumes;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create function to assign reviewer to submission (for admin testing)
CREATE OR REPLACE FUNCTION assign_reviewer_to_submission(
  submission_uuid UUID,
  reviewer_email TEXT
)
RETURNS TEXT AS $$
DECLARE
  reviewer_record RECORD;
  submission_record RECORD;
  new_review_id UUID;
  result_msg TEXT;
BEGIN
  -- Check if reviewer exists
  SELECT id, first_name, last_name, email INTO reviewer_record
  FROM users 
  WHERE email = reviewer_email AND role IN ('reviewer', 'editor', 'admin');
  
  IF NOT FOUND THEN
    RETURN 'Reviewer with email ' || reviewer_email || ' not found or not authorized to review.';
  END IF;
  
  -- Check if submission exists
  SELECT id, title INTO submission_record
  FROM submissions 
  WHERE id = submission_uuid;
  
  IF NOT FOUND THEN
    RETURN 'Submission not found.';
  END IF;
  
  -- Check if reviewer is already assigned
  IF EXISTS (SELECT 1 FROM reviews WHERE submission_id = submission_uuid AND reviewer_id = reviewer_record.id) THEN
    RETURN 'Reviewer is already assigned to this submission.';
  END IF;
  
  -- Create new review assignment
  new_review_id := gen_random_uuid();
  
  INSERT INTO reviews (
    id, submission_id, reviewer_id, reviewer_email, 
    reviewer_first_name, reviewer_last_name, status, 
    review_deadline, assigned_date, created_at, updated_at
  ) VALUES (
    new_review_id, submission_uuid, reviewer_record.id, reviewer_record.email,
    reviewer_record.first_name, reviewer_record.last_name, 'pending',
    (NOW() + INTERVAL '3 weeks')::date, NOW(), NOW(), NOW()
  );
  
  result_msg := 'Successfully assigned ' || reviewer_record.first_name || ' ' || reviewer_record.last_name || 
                ' to review "' || LEFT(submission_record.title, 50) || '..."';
  
  RETURN result_msg;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Display summary
SELECT 'Test data setup complete!' as status;
SELECT * FROM get_test_data_summary();

-- Usage examples for testing:
-- 
-- 1. Assign a reviewer to a submission:
-- SELECT assign_reviewer_to_submission(
--   (SELECT id FROM submissions LIMIT 1), 
--   'reviewer1@university.edu'
-- );
--
-- 2. Check reviewer dashboard data:
-- SELECT 
--   r.id, s.title, r.status, r.review_deadline,
--   r.reviewer_first_name, r.reviewer_last_name
-- FROM reviews r
-- JOIN submissions s ON r.submission_id = s.id
-- WHERE r.reviewer_email = 'reviewer1@university.edu';
--
-- 3. Update your user to admin (replace email):
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';