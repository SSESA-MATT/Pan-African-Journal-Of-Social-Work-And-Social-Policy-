-- Enable RLS on the submissions table
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow authenticated users to insert their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow authors to view their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow admins to view all submissions" ON public.submissions;

-- 1. Policy: Allow authenticated users to insert their own submissions
CREATE POLICY "Allow authenticated users to insert their own submissions"
ON public.submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 2. Policy: Allow authors to view their own submissions
CREATE POLICY "Allow authors to view their own submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

-- 3. Policy: Allow admins to view all submissions
CREATE POLICY "Allow admins to view all submissions"
ON public.submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
