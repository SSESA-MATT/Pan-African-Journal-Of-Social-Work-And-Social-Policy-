-- Drop the function if it exists to ensure a clean setup
DROP FUNCTION IF EXISTS public.get_user_role(user_id uuid);

-- Create a function to get a user's role without triggering RLS policies.
-- This function runs with the permissions of the user who defined it (the 'postgres' superuser),
-- bypassing the RLS checks that cause the infinite recursion.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Temporarily switch to the 'postgres' role to bypass RLS
  SET LOCAL ROLE postgres;
  
  -- Query the users table to get the role
  SELECT role INTO user_role FROM public.users WHERE id = user_id;
  
  -- Revert to the original role
  RESET ROLE;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
