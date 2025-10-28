-- Check what tables you currently have in your database
-- Run this to see what's missing

-- Check existing tables
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if you have the core tables needed
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as users_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions' AND table_schema = 'public') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as submissions_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as reviews_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'volumes' AND table_schema = 'public') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as volumes_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issues' AND table_schema = 'public') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as issues_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles' AND table_schema = 'public') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as articles_table;
