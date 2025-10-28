-- Storage bucket setup for manuscript files
-- Run this in your Supabase SQL Editor

-- Create storage bucket for manuscripts
INSERT INTO storage.buckets (id, name, public)
VALUES ('manuscripts', 'manuscripts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for manuscript bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload manuscripts" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'manuscripts' 
  AND auth.role() = 'authenticated'
);

-- Allow users to view manuscript files
CREATE POLICY "Anyone can view manuscripts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'manuscripts');

-- Allow authors to update their own manuscript files
CREATE POLICY "Authors can update own manuscripts" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'manuscripts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authors to delete their own manuscript files
CREATE POLICY "Authors can delete own manuscripts" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'manuscripts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
