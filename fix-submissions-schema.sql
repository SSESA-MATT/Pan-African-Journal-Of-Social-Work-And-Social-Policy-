-- Add missing content field to submissions table
-- This should be run in Supabase SQL Editor

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Add other potentially missing fields that the frontend expects
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS funding_statement TEXT,
ADD COLUMN IF NOT EXISTS conflict_of_interest TEXT,
ADD COLUMN IF NOT EXISTS ethics_statement TEXT,
ADD COLUMN IF NOT EXISTS data_availability TEXT,
ADD COLUMN IF NOT EXISTS corresponding_author VARCHAR(255);

-- Update existing records to have default values for new fields
UPDATE submissions 
SET 
  content = COALESCE(content, ''),
  funding_statement = COALESCE(funding_statement, ''),
  conflict_of_interest = COALESCE(conflict_of_interest, 'No conflicts declared'),
  ethics_statement = COALESCE(ethics_statement, ''),
  data_availability = COALESCE(data_availability, ''),
  corresponding_author = COALESCE(corresponding_author, '')
WHERE content IS NULL 
   OR funding_statement IS NULL 
   OR conflict_of_interest IS NULL 
   OR ethics_statement IS NULL 
   OR data_availability IS NULL 
   OR corresponding_author IS NULL;