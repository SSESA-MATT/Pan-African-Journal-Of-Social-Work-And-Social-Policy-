-- Super Simple Admin Dashboard Fix
-- This avoids all complex syntax and just gets things working

-- Step 1: Add missing columns to users table (if it exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'author';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL DEFAULT 'Untitled',
    abstract TEXT NOT NULL DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    author_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add basic indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Step 4: Enable RLS (this is safe to run multiple times)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "admin_users_policy" ON users;
DROP POLICY IF EXISTS "admin_submissions_policy" ON submissions;

-- Allow admins to access users
CREATE POLICY "admin_users_policy" ON users 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('admin', 'editor')
    )
);

-- Allow admins to access submissions  
CREATE POLICY "admin_submissions_policy" ON submissions 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('admin', 'editor')
    )
);

-- Step 6: Create basic volumes table
CREATE TABLE IF NOT EXISTS volumes (
    id SERIAL PRIMARY KEY,
    volume_number INTEGER NOT NULL DEFAULT 1,
    year INTEGER NOT NULL DEFAULT 2024,
    title VARCHAR(255) DEFAULT 'Volume 1'
);

-- Insert basic data
INSERT INTO volumes (volume_number, year, title) 
VALUES (1, 2024, 'Volume 1 - 2024') 
ON CONFLICT DO NOTHING;