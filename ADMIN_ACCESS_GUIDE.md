# 🔐 Admin Dashboard Access Guide

## 🎯 How Admin Accesses Their Dashboard - Complete Flow

### Step 1: 🔑 Admin Login Process

#### Option A: Direct Login

1. **Go to Login Page**: `localhost:3000/login`
2. **Enter Admin Credentials**:
   - Email: `admin@panafricanjournal.com` (or your admin email)
   - Password: Your admin password
3. **Click "Sign In"**

#### Option B: From Homepage

1. **Visit**: `localhost:3000`
2. **Click "Sign In"** button in navigation
3. **Enter admin credentials** as above

### Step 2: 🏠 After Successful Login

When admin logs in successfully, the system:

1. **Authenticates** the user credentials
2. **Identifies** user role as `admin`
3. **Stores** authentication token and user data
4. **Redirects** to homepage (`/`) initially
5. **Navigation menu updates** to show admin-specific options

### Step 3: 📱 Accessing Admin Dashboard

#### Method 1: Through Navigation Menu (Most Common)

Once logged in as admin, you'll see:

1. **Click your profile/avatar** in top navigation
2. **Dropdown menu appears** with role-based options
3. **Click "Admin Dashboard"** from the dropdown
4. **System redirects** to `/admin` page
5. **Admin Dashboard loads** with full permissions

#### Method 2: Direct URL Navigation

1. **Type in browser**: `localhost:3000/admin`
2. **System checks** if you're logged in and have admin role
3. **If authorized**: Dashboard loads immediately
4. **If not logged in**: Redirects to login page
5. **If wrong role**: Shows "Access Denied" message

#### Method 3: From Email Links

1. **Click links** in admin notification emails
2. **Links go directly** to admin dashboard sections
3. **System verifies** authentication and role automatically

### Step 4: 🛡️ Security & Role Verification

The admin dashboard is protected by:

```tsx
<ProtectedRoute allowedRoles={['admin', 'editor']}>
  <AdminDashboard />
</ProtectedRoute>
```

This means:

- ✅ **Admin role**: Full access
- ✅ **Editor role**: Full access
- ❌ **Author role**: Access denied
- ❌ **Reviewer role**: Access denied
- ❌ **Not logged in**: Redirect to login

### Step 5: 🎛️ What Admin Sees After Access

Once in the admin dashboard (`/admin`), admin can:

1. **📊 Overview Dashboard**
   - Manuscript submission statistics
   - Review progress tracking
   - System activity metrics

2. **📝 Submission Management**
   - View all manuscript submissions
   - Change manuscript status
   - Assign/reassign reviewers

3. **👥 Reviewer Assignment**
   - Access advanced reviewer matching
   - Assign multiple reviewers at once
   - Track reviewer workload

4. **👤 User Management**
   - Manage authors, reviewers, editors
   - Update user roles and permissions
   - View user activity

5. **⚙️ System Configuration**
   - Journal settings and policies
   - Email template management
   - Workflow rules configuration

## 🚀 Quick Access Summary

### 🎯 For Admin Users

1. **Login** → `localhost:3000/login`
2. **Navigate** → Click profile → "Admin Dashboard"
3. **Or Direct** → `localhost:3000/admin`
4. **Advanced Features** → `localhost:3000/admin/reviewer-assignment`

### 🔄 Navigation Flow

```text
Login Page → Authentication → Homepage → Profile Menu → Admin Dashboard
    ↓           ↓              ↓           ↓              ↓
  /login    Verify Admin    /    Click Avatar    /admin loads
```

## 🎪 Demo Mode Access (No Login Required)

For testing and demonstration:

- **URL**: `localhost:3000/demo`
- **Features**: Access all dashboards without login
- **Role Switching**: Can simulate admin, author, reviewer roles
- **Purpose**: System demonstration and testing

## 🔧 Troubleshooting Admin Access

### Problem: Can't Access Admin Dashboard

✅ **Solutions:**

1. **Check Login Status**: Are you logged in?
2. **Verify Role**: Is your account role set to 'admin' or 'editor'?
3. **Clear Cache**: Try logging out and back in
4. **Direct URL**: Try `localhost:3000/admin` directly

### Problem: "Access Denied" Message

✅ **Solutions:**

1. **Role Issue**: Your account needs 'admin' or 'editor' role
2. **Contact Admin**: Have another admin update your role
3. **Database Check**: Verify role in user table

### Problem: Navigation Menu Missing "Admin Dashboard"

✅ **Solutions:**

1. **Login Status**: Make sure you're logged in
2. **Role Verification**: Check your user role
3. **Page Refresh**: Try refreshing the page

## 📧 Admin Account Creation

To create an admin account:

1. **Register** normal account at `/register`
2. **Database Update**: Change role to 'admin' in users table
3. **Or Backend**: Use admin creation endpoint if available

## 🎉 Ready to Use

Your admin dashboard access is fully functional with:

- ✅ **Secure Authentication**: Role-based access control
- ✅ **Multiple Access Methods**: Navigation, direct URL, email links
- ✅ **Complete Admin Features**: All management tools available
- ✅ **Real-time Updates**: Live manuscript and user management

**Start by logging in at**: `localhost:3000/login` with admin credentials! 🚀
