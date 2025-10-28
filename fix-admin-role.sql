-- 🔧 ADMIN ROLE VERIFICATION & FIX
-- Run this in Supabase SQL Editor to ensure admin role is properly set

-- Step 1: Check current users and their roles
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  created_at,
  updated_at
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 2: Find your specific user (replace with your email)
-- Uncomment and modify the email below:
-- SELECT id, email, role FROM users WHERE email = 'your-email@example.com';

-- Step 3: Update your role to admin (replace with your email)
-- Uncomment and modify the email below:
-- UPDATE users 
-- SET role = 'admin', updated_at = CURRENT_TIMESTAMP 
-- WHERE email = 'your-email@example.com';

-- Step 4: Verify the update (replace with your email)
-- Uncomment and modify the email below:
-- SELECT id, email, role, updated_at FROM users WHERE email = 'your-email@example.com';

-- Step 5: Check if auth.users table is in sync (for Supabase Auth)
-- This shows users in the auth system vs your users table
SELECT 
  au.email as auth_email,
  au.created_at as auth_created,
  u.email as users_email,
  u.role as users_role,
  u.created_at as users_created,
  CASE 
    WHEN u.email IS NULL THEN 'Missing in users table'
    WHEN au.email IS NULL THEN 'Missing in auth.users'
    ELSE 'Synced'
  END as sync_status
FROM auth.users au
FULL OUTER JOIN users u ON au.email = u.email
ORDER BY au.created_at DESC
LIMIT 10;

-- Step 6: If your user exists in auth.users but not in users table, create the profile
-- Uncomment and modify as needed:
/*
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  affiliation,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'your-email@example.com',
  'Your First Name',
  'Your Last Name',
  'Your Institution',
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = CURRENT_TIMESTAMP;
*/

-- Step 7: Create a function to easily promote users to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  result_msg TEXT;
  user_count INTEGER;
BEGIN
  -- Check if user exists
  SELECT COUNT(*) INTO user_count FROM users WHERE email = user_email;
  
  IF user_count = 0 THEN
    result_msg := 'User with email ' || user_email || ' not found.';
  ELSE
    -- Update user role
    UPDATE users 
    SET role = 'admin', updated_at = CURRENT_TIMESTAMP 
    WHERE email = user_email;
    
    result_msg := 'User ' || user_email || ' has been promoted to admin.';
  END IF;
  
  RETURN result_msg;
END;
$$ LANGUAGE plpgsql;

-- Usage example:
-- SELECT promote_to_admin('your-email@example.com');

-- Step 8: Verify admin permissions by checking what admin features are available
SELECT 
  'Admin users count' as metric,
  COUNT(*) as value
FROM users 
WHERE role = 'admin'

UNION ALL

SELECT 
  'Total users count',
  COUNT(*)
FROM users

UNION ALL

SELECT 
  'Submissions available for admin review',
  COUNT(*)
FROM submissions

UNION ALL

SELECT 
  'Reviews awaiting admin oversight',
  COUNT(*)
FROM reviews 
WHERE status IN ('pending', 'in_progress');

-- INSTRUCTIONS:
-- 1. Uncomment the lines with your email and run them
-- 2. If you don't see your user, check if you're logged in with the right email
-- 3. After updating role, clear browser localStorage and re-login
-- 4. If issues persist, run the JavaScript troubleshooter in browser console