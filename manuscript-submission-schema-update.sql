-- Additional columns needed for manuscript submissions
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS corresponding_author VARCHAR(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS funding_statement TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS conflict_of_interest TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ethics_statement TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS data_availability TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS manuscript_type VARCHAR(50) DEFAULT 'research';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS manuscript_file_public_id VARCHAR(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Optional: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submission_date ON submissions(submission_date);

-- Row Level Security for submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authors can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Authors can insert own submissions" ON submissions;
DROP POLICY IF EXISTS "Authors can update own submissions" ON submissions;
DROP POLICY IF EXISTS "Editors can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Reviewers can view assigned submissions" ON submissions;

-- Authors can view their own submissions
CREATE POLICY "Authors can view own submissions" 
ON submissions FOR SELECT 
USING (auth.uid() = author_id);

-- Authors can insert their own submissions
CREATE POLICY "Authors can insert own submissions" 
ON submissions FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own submissions (only if status is 'submitted' or 'revision_requested')
CREATE POLICY "Authors can update own submissions" 
ON submissions FOR UPDATE 
USING (
  auth.uid() = author_id 
  AND status IN ('submitted', 'revision_requested')
);

-- Editors can view all submissions
CREATE POLICY "Editors can view all submissions" 
ON submissions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'editor')
  )
);

-- Reviewers can view submissions assigned to them
CREATE POLICY "Reviewers can view assigned submissions" 
ON submissions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM reviews 
    WHERE reviews.submission_id = submissions.id 
    AND reviews.reviewer_id = auth.uid()
  )
);
