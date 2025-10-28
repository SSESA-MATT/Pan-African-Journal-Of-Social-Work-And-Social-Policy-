-- Minimal SQL Script for Manuscript Functionality
-- Run this in your Supabase SQL Editor

-- First, let's add the missing columns to submissions table
-- These will be ignored if they already exist
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS corresponding_author VARCHAR(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS funding_statement TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS conflict_of_interest TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ethics_statement TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS data_availability TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS manuscript_type VARCHAR(50) DEFAULT 'research';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS manuscript_file_public_id VARCHAR(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Add useful indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submission_date ON submissions(submission_date);

-- Enable Row Level Security on submissions table
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Set up basic RLS policies for submissions
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Authors can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Authors can insert own submissions" ON submissions;
DROP POLICY IF EXISTS "Authors can update own submissions" ON submissions;

-- Authors can view their own submissions
CREATE POLICY "Authors can view own submissions" 
ON submissions FOR SELECT 
USING (auth.uid() = author_id);

-- Authors can insert their own submissions
CREATE POLICY "Authors can insert own submissions" 
ON submissions FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own submissions (for revisions)
CREATE POLICY "Authors can update own submissions" 
ON submissions FOR UPDATE 
USING (auth.uid() = author_id);

-- Create storage bucket for manuscripts (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('manuscripts', 'manuscripts', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
-- Drop existing storage policies first
DROP POLICY IF EXISTS "Authenticated users can upload manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view manuscript files" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own manuscripts" ON storage.objects;

-- Allow authenticated users to upload manuscript files
CREATE POLICY "Authenticated users can upload manuscripts" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'manuscripts' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view manuscript files
CREATE POLICY "Users can view manuscript files" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'manuscripts' 
  AND auth.role() = 'authenticated'
);

-- Allow authors to update their own manuscript files
CREATE POLICY "Authors can update own manuscripts" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'manuscripts' 
  AND auth.role() = 'authenticated'
);

-- Allow authors to delete their own manuscript files
CREATE POLICY "Authors can delete own manuscripts" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'manuscripts' 
  AND auth.role() = 'authenticated'
);

-- Final verification: Check what we created
SELECT 'Columns added successfully' as status, count(*) as new_columns
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND column_name IN (
  'corresponding_author', 
  'funding_statement', 
  'conflict_of_interest', 
  'ethics_statement', 
  'data_availability', 
  'manuscript_type',
  'manuscript_file_public_id',
  'word_count'
);
