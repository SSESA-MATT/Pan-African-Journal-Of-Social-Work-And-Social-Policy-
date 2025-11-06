# Admin Dashboard 401 Errors - Fix Applied

## Problem Identified

The admin dashboard was showing **401 Unauthorized errors** on all API endpoints because of an **environment variable naming mismatch**.

### Root Cause
- **API Routes Expected**: `SUPABASE_SERVICE_ROLE_KEY`
- **Environment Files Had**: `SUPABASE_SERVICE_KEY`
- **Result**: API routes couldn't create admin Supabase client, causing authentication to fail

## Errors Observed
From the browser console, the following endpoints were failing with 401:
- `GET /api/submissions/statistics:1` - 401 (Unauthorized)
- `GET /api/admin/submissions?status...` - 401 (Unauthorized) 
- `GET /api/admin/users` - 401 (Unauthorized)
- `GET /api/users/stats` - 401 (Unauthorized)

## Solution Applied

### 1. Fixed Environment Variable Names ✅

**Updated `.env.local`:**
```bash
# Before
SUPABASE_SERVICE_KEY=eyJhbGci...

# After
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**Updated `.env.production`:**
```bash
# Before
SUPABASE_SERVICE_KEY=eyJhbGci...

# After
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 2. How This Fixes the Issue

The API routes in `frontend/src/app/api/admin/` use this pattern:

```typescript
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← This was undefined!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

When `SUPABASE_SERVICE_ROLE_KEY` was undefined, the admin client couldn't bypass RLS policies, causing authentication failures.

## Next Steps

### For Local Development
1. **Restart your Next.js dev server**:
   ```bash
   cd frontend
   # Press Ctrl+C to stop current server
   npm run dev
   ```

2. **Clear browser localStorage and cookies**:
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Storage → Clear site data
   - Or just logout and login again

3. **Test the admin dashboard**:
   - Login as admin user
   - Navigate to `/admin`
   - Verify all tabs load without 401 errors

### For Production (Vercel)

You need to add the environment variable to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variable:
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZWdlZnJsdG1yd2VodXpyYnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY2MTMwMCwiZXhwIjoyMDcwMjM3MzAwfQ.Y-ElwQGg_x09x72YVXACZ45i6gRiRjdcVPS8F7UWDyU
   Environment: Production, Preview, Development (check all)
   ```
4. **Redeploy** your application for the changes to take effect

## About the Mock Data

You mentioned seeing "mock data under volumes and issues". This appears to be **actual test/seed data** in your Supabase database from earlier testing. This is separate from the 401 issue.

To review or clean up this data:

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. Check the `volumes` and `issues` tables
4. Delete any test records you don't want

Alternatively, you can query/delete via SQL:

```sql
-- View volumes
SELECT * FROM volumes;

-- Delete test volumes (be careful!)
-- DELETE FROM volumes WHERE title LIKE '%test%';

-- View issues
SELECT * FROM issues;

-- Delete test issues (be careful!)
-- DELETE FROM issues WHERE title LIKE '%test%';
```

## Testing Checklist

After restarting the dev server and clearing browser storage:

- [ ] Login as admin user succeeds
- [ ] Admin dashboard loads without errors
- [ ] Overview tab shows statistics (no 401 errors)
- [ ] Submissions tab loads submission list
- [ ] Reviewers tab loads reviewer data
- [ ] Users tab loads user list
- [ ] Analytics tab loads statistics
- [ ] No 401/403/404 errors in browser console

## Files Modified

- `frontend/.env.local` - Fixed `SUPABASE_SERVICE_KEY` → `SUPABASE_SERVICE_ROLE_KEY`
- `frontend/.env.production` - Fixed `SUPABASE_SERVICE_KEY` → `SUPABASE_SERVICE_ROLE_KEY`

## Technical Details

### Authentication Flow
1. User logs in via `/api/auth/login`
2. Supabase Auth sets HTTP-only session cookies
3. Next.js middleware refreshes session on each request
4. API routes use `createRouteHandlerClient({ cookies })` to read session
5. Admin routes additionally use `SUPABASE_SERVICE_ROLE_KEY` for bypassing RLS

### Why Service Role Key is Needed
- Supabase uses Row Level Security (RLS) policies
- Regular authenticated users can only access their own data
- Admin operations need to read/update ANY user's data
- Service Role Key bypasses RLS for admin operations

## Expected Behavior After Fix

1. **Admin Dashboard**: All tabs load successfully
2. **API Calls**: All return 200 OK with data
3. **Statistics**: Display actual submission counts
4. **User Management**: Show all users in system
5. **No Console Errors**: No 401/403 errors in browser DevTools

---

**Status**: ✅ Fix Applied - Requires Server Restart & Browser Refresh
**Impact**: High - Affects all admin functionality
**Priority**: Critical - Blocking admin features
