// 🔧 ADMIN FIX SCRIPT - Run this after the debug script identifies issues
// This script provides automated fixes for common admin dashboard problems

console.log('🔧 Admin Fix Script Loaded');

// === FIX 1: USER PROFILE CREATION ===
async function createMissingUserProfile() {
  console.log('\n🛠️ Creating missing user profile...');
  
  try {
    // Get current auth user
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
    
    if (!authData.user) {
      console.log('❌ No authenticated user found in localStorage');
      return false;
    }

    const userData = {
      email: authData.user.email,
      first_name: 'Mathew', // Update with actual data
      last_name: 'Ssesanga', // Update with actual data
      role: 'admin',
      affiliation: 'Makerere University' // Update as needed
    };

    // Try to register/update user profile
    const response = await fetch('/api/auth/register-instant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: userData.email,
        password: 'TempPassword123!', // This will be ignored for existing users
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        affiliation: userData.affiliation
      })
    });

    const result = await response.json();
    console.log('Profile creation result:', result);
    return response.ok;
    
  } catch (error) {
    console.log('❌ Error creating profile:', error);
    return false;
  }
}

// === FIX 2: DIRECT DATABASE PROFILE CHECK ===
async function checkDatabaseProfile() {
  console.log('\n🔍 Checking database profile directly...');
  
  try {
    const response = await fetch('/api/test-db', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connection successful:', data);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Database check failed:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Database check error:', error);
    return false;
  }
}

// === FIX 3: REFRESH AUTHENTICATION ===
async function refreshAuthentication() {
  console.log('\n🔄 Refreshing authentication...');
  
  try {
    // Clear current auth data
    localStorage.removeItem('supabase.auth.token');
    
    // Force re-authentication
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    
  } catch (error) {
    console.log('❌ Auth refresh error:', error);
  }
}

// === FIX 4: FORCE PROFILE SYNC ===
async function forceProfileSync() {
  console.log('\n🔄 Force syncing user profile...');
  
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        action: 'sync',
        role: 'admin'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profile sync successful:', data);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Profile sync failed:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile sync error:', error);
    return false;
  }
}

// === MASTER FIX FUNCTION ===
async function runAllFixes() {
  console.log('\n🚀 Running All Admin Fixes...');
  console.log('='.repeat(50));
  
  // Step 1: Check database connection
  const dbOk = await checkDatabaseProfile();
  if (!dbOk) {
    console.log('❌ Database connection failed - check backend');
    return;
  }
  
  // Step 2: Try profile sync
  const syncOk = await forceProfileSync();
  if (syncOk) {
    console.log('✅ Profile sync successful - try refreshing page');
    return;
  }
  
  // Step 3: Try creating missing profile
  const createOk = await createMissingUserProfile();
  if (createOk) {
    console.log('✅ Profile created - try refreshing page');
    return;
  }
  
  // Step 4: Force re-authentication if all else fails
  console.log('🔄 All fixes attempted - forcing re-authentication...');
  setTimeout(() => {
    refreshAuthentication();
  }, 2000);
}

// === INDIVIDUAL FIX COMMANDS ===
console.log('\n📋 Available Fix Commands:');
console.log('- runAllFixes() - Run all fixes automatically');
console.log('- createMissingUserProfile() - Create user profile in database');
console.log('- checkDatabaseProfile() - Test database connection');
console.log('- forceProfileSync() - Sync profile data');
console.log('- refreshAuthentication() - Force re-login');

// Make functions globally available
window.adminFixes = {
  runAllFixes,
  createMissingUserProfile,
  checkDatabaseProfile,
  forceProfileSync,
  refreshAuthentication
};