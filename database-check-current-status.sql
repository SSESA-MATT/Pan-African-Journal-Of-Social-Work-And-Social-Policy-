-- Diagnostic Script: Check Current Database Schema
-- Run this FIRST in your Supabase SQL Editor to see what you already have

-- 1. Check if submissions table exists and what columns it has
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'manuscripts';

-- 3. Check existing RLS policies on submissions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'submissions';

-- 4. Check if storage extension is enabled
SELECT * FROM pg_extension WHERE extname = 'storage';

-- After running this, tell me what results you get and I'll create the exact SQL you need!
