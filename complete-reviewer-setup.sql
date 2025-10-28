-- Complete setup script for reviewer dashboard with real data
-- Run these SQL commands in your Supabase SQL Editor in this order

-- Step 1: Ensure all required columns exist in submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_type VARCHAR(50) DEFAULT 'research_article';

-- Step 2: Ensure all required columns exist in reviews table  
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comments_to_author TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comments_to_editor TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Update reviews table to use VARCHAR for id to match our data
-- This might fail if the id column is already UUID, which is fine
DO $$
BEGIN
    BEGIN
        ALTER TABLE reviews ALTER COLUMN id TYPE VARCHAR(255);
    EXCEPTION
        WHEN OTHERS THEN
            -- Column is already correct type or can't be changed, continue
            NULL;
    END;
END $$;

-- Step 4: Create test users with known UUIDs (these should match your auth.users table)
-- You'll need to create these users in Supabase Auth first, then run this to add profile data
INSERT INTO users (id, email, first_name, last_name, role, affiliation, expertise) VALUES
('00000000-0000-0000-0000-000000000001', 'author@test.com', 'Amara', 'Okonkwo', 'author', 'University of Cape Town', ARRAY['Ubuntu philosophy', 'community social work']),
('00000000-0000-0000-0000-000000000002', 'reviewer@test.com', 'Kwame', 'Asante', 'reviewer', 'University of Ghana', ARRAY['decolonial practice', 'child protection']),
('00000000-0000-0000-0000-000000000003', 'editor@test.com', 'Thandiwe', 'Mthembu', 'editor', 'University of the Witwatersrand', ARRAY['editorial management', 'social justice']),
('11111111-1111-1111-1111-111111111111', 'reviewer2@test.com', 'Dr. Aisha', 'Ngozi', 'reviewer', 'University of Lagos', ARRAY['gender studies', 'community development']),
('22222222-2222-2222-2222-222222222222', 'reviewer3@test.com', 'Prof. Mandla', 'Sibeko', 'reviewer', 'University of Pretoria', ARRAY['social policy', 'child welfare'])
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  affiliation = EXCLUDED.affiliation,
  expertise = EXCLUDED.expertise;

-- Step 5: Create test submissions
INSERT INTO submissions (id, title, abstract, keywords, author_id, status, submission_date, submission_type) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Ubuntu Philosophy and Community-Based Social Work: A Decolonial Approach to Practice',
  'This study examines the integration of Ubuntu philosophy into community-based social work practice across three African countries. Using participatory action research methodology, we explore how Indigenous knowledge systems can enhance social work interventions in rural and urban communities. The research involved 120 participants from South Africa, Ghana, and Kenya, including social workers, community leaders, and service users. Findings reveal that Ubuntu-informed practice models significantly improve community engagement, cultural responsiveness, and sustainable outcomes.',
  '["Ubuntu", "decolonial practice", "community-based social work", "Indigenous knowledge", "participatory action research"]'::jsonb,
  '00000000-0000-0000-0000-000000000001',
  'submitted',
  NOW() - INTERVAL '2 days',
  'research_article'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Digital Divides and Social Justice: Technology Access in Post-Apartheid South Africa',
  'An exploration of how digital inequalities perpetuate social injustices in contemporary South Africa. This mixed-methods study examines barriers to technology access and proposes community-centered solutions for digital inclusion. The research combines quantitative analysis of digital access patterns with qualitative interviews from 80 participants across urban and rural communities.',
  '["digital divide", "social justice", "technology access", "post-apartheid", "digital inclusion"]'::jsonb,
  '00000000-0000-0000-0000-000000000001',
  'submitted',
  NOW() - INTERVAL '5 days',
  'research_article'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Gender-Based Violence Prevention in West African Communities',
  'This ethnographic study documents innovative approaches to GBV prevention developed by women''s cooperatives in Ghana, Nigeria, and Senegal. The research highlights community-led strategies that challenge traditional intervention models and emphasize collective action, economic empowerment, and cultural transformation.',
  '["gender-based violence", "women cooperatives", "West Africa", "community prevention", "ethnography"]'::jsonb,
  '00000000-0000-0000-0000-000000000001',
  'submitted',
  NOW() - INTERVAL '1 day',
  'research_article'
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Mental Health Support Systems in Post-Conflict African Communities',
  'A comprehensive analysis of community-based mental health support systems in post-conflict environments across Uganda, Rwanda, and Sierra Leone. This study examines how traditional healing practices integrate with modern psychological interventions to provide holistic mental health care in communities recovering from trauma.',
  '["mental health", "post-conflict", "community healing", "traditional medicine", "trauma recovery"]'::jsonb,
  '00000000-0000-0000-0000-000000000001',
  'submitted',
  NOW() - INTERVAL '3 days',
  'research_article'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  abstract = EXCLUDED.abstract,
  keywords = EXCLUDED.keywords,
  status = EXCLUDED.status,
  submission_type = EXCLUDED.submission_type;

-- Step 6: Create review assignments to connect submissions to reviewers
INSERT INTO reviews (id, submission_id, reviewer_id, status, assigned_at, due_date, comments_to_author, comments_to_editor) VALUES
(
  'review-001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Ubuntu Philosophy submission
  '00000000-0000-0000-0000-000000000002', -- reviewer@test.com (Kwame Asante)
  'pending',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '20 days',
  NULL,
  NULL
),
(
  'review-002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- Digital Divides submission
  '11111111-1111-1111-1111-111111111111', -- reviewer2@test.com (Dr. Aisha Ngozi)
  'pending',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '18 days',
  NULL,
  NULL
),
(
  'review-003',
  'cccccccc-cccc-cccc-cccc-cccccccccccc', -- GBV Prevention submission
  '22222222-2222-2222-2222-222222222222', -- reviewer3@test.com (Prof. Mandla Sibeko)
  'pending',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '20 days',
  NULL,
  NULL
),
(
  'review-004',
  'dddddddd-dddd-dddd-dddd-dddddddddddd', -- Mental Health submission
  '00000000-0000-0000-0000-000000000002', -- reviewer@test.com (Kwame Asante)
  'pending',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '19 days',
  NULL,
  NULL
),
(
  'review-005',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Ubuntu Philosophy submission (second reviewer)
  '11111111-1111-1111-1111-111111111111', -- reviewer2@test.com (Dr. Aisha Ngozi)
  'pending',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '20 days',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  assigned_at = EXCLUDED.assigned_at,
  due_date = EXCLUDED.due_date;

-- Step 7: Create the reviewer-specific function
DROP FUNCTION IF EXISTS get_submissions_for_reviewer(UUID);

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

-- Step 8: Update the general function to include review data
DROP FUNCTION IF EXISTS get_submissions_for_review();

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

-- Step 9: Create useful indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_submission_id ON reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 10: Verify the setup with some test queries
-- You can run these to check if everything is working:

-- Check users:
-- SELECT id, email, first_name, last_name, role FROM users WHERE role IN ('reviewer', 'author');

-- Check submissions:
-- SELECT id, title, status, author_id, submission_date FROM submissions;

-- Check review assignments:
-- SELECT r.id as review_id, s.title, u.first_name || ' ' || u.last_name as reviewer_name, r.status, r.assigned_at
-- FROM reviews r
-- JOIN submissions s ON r.submission_id = s.id
-- JOIN users u ON r.reviewer_id = u.id;

-- Test the reviewer function:
-- SELECT * FROM get_submissions_for_reviewer('00000000-0000-0000-0000-000000000002');