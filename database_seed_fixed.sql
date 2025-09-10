-- Fixed Test data for Pan-African Journal Platform
-- Run this in Supabase SQL Editor to create test users and data

-- Option 1: Create test data WITHOUT foreign key dependencies
-- This avoids the auth user constraint issue

-- First, let's create volumes and issues (no foreign key dependencies)
INSERT INTO volumes (volume_number, year, title, description, is_published) VALUES
(1, 2024, 'Inaugural Volume', 'The first volume of the Pan-African Journal of Social Work and Social Policy', true)
ON CONFLICT (volume_number, year) DO NOTHING;

INSERT INTO issues (volume_id, issue_number, title, description, is_published) VALUES
(1, 1, 'Issue 1: Foundations of African Social Work', 'Exploring foundational concepts in African social work practice', true)
ON CONFLICT (volume_id, issue_number) DO NOTHING;

-- Create basic test users in the users table (without auth dependency)
-- These will be placeholder users for development
INSERT INTO users (id, email, first_name, last_name, role, affiliation, expertise, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'author@test.com', 'Amara', 'Okonkwo', 'author', 'University of Cape Town', ARRAY['Ubuntu philosophy', 'community social work'], NOW()),
('00000000-0000-0000-0000-000000000002', 'reviewer@test.com', 'Kwame', 'Asante', 'reviewer', 'University of Ghana', ARRAY['decolonial practice', 'child protection'], NOW()),
('00000000-0000-0000-0000-000000000003', 'editor@test.com', 'Thandiwe', 'Mthembu', 'editor', 'University of the Witwatersrand', ARRAY['editorial management', 'social justice'], NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  affiliation = EXCLUDED.affiliation,
  expertise = EXCLUDED.expertise;

-- Now create test submissions (after users exist)
INSERT INTO submissions (title, abstract, keywords, author_id, status, manuscript_file_url, submitted_at) VALUES
(
  'Ubuntu Philosophy and Community-Based Social Work: A Decolonial Approach to Practice',
  'This study examines the integration of Ubuntu philosophy into community-based social work practice across three African countries. Using participatory action research methodology, we explore how Indigenous knowledge systems can enhance social work interventions in rural and urban communities. The research involved 120 participants from South Africa, Ghana, and Kenya, including social workers, community leaders, and service users. Findings reveal that Ubuntu-informed practice models significantly improve community engagement, cultural responsiveness, and sustainable outcomes. The study concludes with recommendations for decolonizing social work education and practice in African contexts.',
  ARRAY['Ubuntu', 'decolonial practice', 'community-based social work', 'Indigenous knowledge', 'participatory action research'],
  '00000000-0000-0000-0000-000000000001',
  'submitted',
  'manuscripts/ubuntu-community-social-work.pdf',
  NOW() - INTERVAL '2 days'
),
(
  'Digital Divides and Social Justice: Technology Access in Post-Apartheid South Africa',
  'An exploration of how digital inequalities perpetuate social injustices in contemporary South Africa. This mixed-methods study examines barriers to technology access and proposes community-centered solutions for digital inclusion. The research combines quantitative analysis of digital access patterns with qualitative interviews from 80 participants across urban and rural communities in three provinces.',
  ARRAY['digital divide', 'social justice', 'technology access', 'post-apartheid', 'digital inclusion'],
  '00000000-0000-0000-0000-000000000001',
  'under_review',
  'manuscripts/digital-divides-sa.pdf',
  NOW() - INTERVAL '5 days'
),
(
  'Gender-Based Violence Prevention in West African Communities',
  'This ethnographic study documents innovative approaches to GBV prevention developed by women''s cooperatives in Ghana, Nigeria, and Senegal. The research highlights community-led strategies that challenge traditional intervention models and emphasize collective action, economic empowerment, and cultural transformation.',
  ARRAY['gender-based violence', 'women cooperatives', 'West Africa', 'community prevention', 'ethnography'],
  '00000000-0000-0000-0000-000000000001',
  'submitted',
  'manuscripts/gbv-prevention-west-africa.pdf',
  NOW() - INTERVAL '1 day'
);

-- Create some test reviews (after submissions exist)
INSERT INTO reviews (submission_id, reviewer_id, status, recommendation, comments_to_author, comments_to_editor, assigned_at, completed_at) VALUES
(
  (SELECT id FROM submissions WHERE title LIKE 'Digital Divides%' LIMIT 1), -- Get the actual submission ID
  '00000000-0000-0000-0000-000000000002',
  'completed',
  'minor_revision',
  'This is an important and timely study that addresses critical issues of digital inequality in South Africa. The methodology is sound and the findings are compelling. However, I recommend the following minor revisions: 1) Expand the literature review to include more recent African scholarship on digital divides, 2) Strengthen the connection between theoretical framework and findings, 3) Provide more specific recommendations for policy implementation.',
  'The paper makes a valuable contribution to understanding digital inequalities in the African context. The author demonstrates good grasp of the subject matter and the research is well-executed. With minor revisions, this will be a strong addition to the journal.',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '3 days'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_author ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_submission ON reviews(submission_id);
