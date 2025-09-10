-- SIMPLE VERSION: Just create basic test data without complex dependencies
-- Run this in Supabase SQL Editor

-- Step 1: Create volumes and issues first (no dependencies)
INSERT INTO volumes (volume_number, year, title, description, is_published) VALUES
(1, 2024, 'Inaugural Volume', 'The first volume of the Pan-African Journal of Social Work and Social Policy', true)
ON CONFLICT (volume_number, year) DO NOTHING;

INSERT INTO issues (volume_id, issue_number, title, description, is_published) VALUES
(1, 1, 'Issue 1: Foundations of African Social Work', 'Exploring foundational concepts in African social work practice', true)
ON CONFLICT (volume_id, issue_number) DO NOTHING;

-- Step 2: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_author ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_submission ON reviews(submission_id);
