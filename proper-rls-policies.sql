-- 🔐 PROPER RLS POLICIES FOR ADMIN ACCESS
-- Run this in Supabase SQL Editor instead of disabling RLS

-- 1) Create a SECURITY DEFINER helper function to check admin/editor status
--    (avoids selecting from `users` inside policies which can cause recursion)
DROP FUNCTION IF EXISTS is_admin(uuid);
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM users WHERE id = $1 AND role IN ('admin', 'editor')
  );
$$;

-- Grant execute to authenticated so policies can call it
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- 2) Users table policy: allow admins/editors or owner
DROP POLICY IF EXISTS "admin_full_access_users" ON users;
CREATE POLICY "admin_full_access_users" ON users
  FOR ALL
  USING (
    is_admin(auth.uid())
    OR id = auth.uid()
  );

-- 3) Submissions table: allow admins/editors or the author
DROP POLICY IF EXISTS "admin_full_access_submissions" ON submissions;
CREATE POLICY "admin_full_access_submissions" ON submissions
  FOR ALL
  USING (
    is_admin(auth.uid())
    OR author_id = auth.uid()
  );

-- 4) Reviews table: allow admins/editors or assigned reviewer
DROP POLICY IF EXISTS "admin_full_access_reviews" ON reviews;
CREATE POLICY "admin_full_access_reviews" ON reviews
  FOR ALL
  USING (
    is_admin(auth.uid())
    OR reviewer_id = auth.uid()
  );

-- 5) Volumes and issues (admin/editor only)
DROP POLICY IF EXISTS "admin_volumes_access" ON volumes;
CREATE POLICY "admin_volumes_access" ON volumes
  FOR ALL
  USING (
    is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "admin_issues_access" ON issues;
CREATE POLICY "admin_issues_access" ON issues
  FOR ALL
  USING (
    is_admin(auth.uid())
  );

-- 6) Enable RLS on tables (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- 7) Verification: show the auth user and profile (run manually or paste below)
-- SELECT au.id as auth_id, au.email as auth_email, u.id as user_id, u.email as user_email, u.role as user_role
-- FROM auth.users au
-- LEFT JOIN users u ON au.id = u.id
-- WHERE au.email = 'ssesangamatthew24@gmail.com';

-- 8) (Optional) Create admin profile if not present
-- INSERT INTO users (id, email, first_name, last_name, affiliation, role, created_at, updated_at)
-- SELECT au.id, au.email,
--   COALESCE(au.raw_user_meta_data->>'first_name', 'Mathew'),
--   COALESCE(au.raw_user_meta_data->>'last_name', 'Ssesanga'),
--   COALESCE(au.raw_user_meta_data->>'affiliation', 'Makerere University'),
--   'admin', NOW(), NOW()
-- FROM auth.users au
-- WHERE au.email = 'ssesangamatthew24@gmail.com'
-- AND NOT EXISTS (SELECT 1 FROM users WHERE id = au.id);

-- Notes:
--  - The `is_admin` function is SECURITY DEFINER so it runs with the owner's
--    privileges and avoids RLS recursion. Create this script in the Supabase
--    SQL Editor and run it as a privileged user (the SQL Editor session is
--    normally adequate).
--  - After running, verify any legacy/conflicting policies are removed and
--    test by logging in as the admin and hitting the author/reviewer pages.