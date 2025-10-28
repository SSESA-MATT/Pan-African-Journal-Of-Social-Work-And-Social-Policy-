-- ADMIN SETUP SCRIPT
-- This script will help you become an admin and manage other admin users

-- Step 1: Check current database setup
-- Run this first to see what you have
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as users_table_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth' AND table_schema = 'auth') 
    THEN 'EXISTS' ELSE 'MISSING' 
  END as auth_users_table_status;

-- Step 2: Check existing users and their roles
-- This will show you all current users
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  created_at
FROM users 
ORDER BY created_at DESC;

-- Step 3: Make yourself admin (REPLACE 'your-email@example.com' with your actual email)
-- Option A: If you know your exact email
UPDATE users 
SET role = 'admin', updated_at = CURRENT_TIMESTAMP 
WHERE email = 'your-email@example.com';

-- Option B: If you're not sure about the exact email, first find it
-- Run this to see all users with similar email pattern:
-- SELECT id, email, role FROM users WHERE email ILIKE '%yourname%' OR email ILIKE '%yourdomain%';

-- Step 4: Verify you are now admin
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE email = 'your-email@example.com';

-- Step 5: Create additional admin users (if needed)
-- Replace with actual details for other admins
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  affiliation,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@panafricanjournal.com',
  '$2b$10$example_hash_replace_with_real', -- You'll need to generate this properly
  'System',
  'Administrator',
  'Pan-African Journal',
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Step 6: Grant admin privileges to existing users
-- Function to make any user admin by email
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_exists BOOLEAN;
  result_msg TEXT;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE email = user_email) INTO user_exists;
  
  IF user_exists THEN
    -- Update user to admin role
    UPDATE users 
    SET role = 'admin', updated_at = CURRENT_TIMESTAMP 
    WHERE email = user_email;
    
    result_msg := 'User ' || user_email || ' has been granted admin privileges.';
  ELSE
    result_msg := 'User ' || user_email || ' not found.';
  END IF;
  
  RETURN result_msg;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Function to remove admin privileges
CREATE OR REPLACE FUNCTION remove_admin_privileges(user_email TEXT, new_role TEXT DEFAULT 'author')
RETURNS TEXT AS $$
DECLARE
  user_exists BOOLEAN;
  result_msg TEXT;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE email = user_email) INTO user_exists;
  
  IF user_exists THEN
    -- Update user role
    UPDATE users 
    SET role = new_role, updated_at = CURRENT_TIMESTAMP 
    WHERE email = user_email;
    
    result_msg := 'User ' || user_email || ' role changed to ' || new_role || '.';
  ELSE
    result_msg := 'User ' || user_email || ' not found.';
  END IF;
  
  RETURN result_msg;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Function to list all admin users
CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    u.role,
    u.created_at
  FROM users u
  WHERE u.role = 'admin'
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- USAGE EXAMPLES:
-- 
-- 1. Make someone admin:
-- SELECT make_user_admin('user@example.com');
--
-- 2. Remove admin privileges:
-- SELECT remove_admin_privileges('user@example.com', 'reviewer');
--
-- 3. List all admins:
-- SELECT * FROM list_admin_users();
--
-- 4. Check specific user's role:
-- SELECT email, role FROM users WHERE email = 'user@example.com';