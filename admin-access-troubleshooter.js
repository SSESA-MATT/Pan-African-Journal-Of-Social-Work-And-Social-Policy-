// 🔧 ADMIN ACCESS TROUBLESHOOTER
// Run this in browser console to diagnose and fix admin dashboard access issues

console.log('🔍 ADMIN ACCESS TROUBLESHOOTER');
console.log('==============================');

async function troubleshootAdminAccess() {
  
  // Step 1: Check stored authentication data
  console.log('\n1️⃣ Checking stored authentication data...');
  
  const storedToken = localStorage.getItem('africa_journal_access_token');
  const storedUser = localStorage.getItem('africa_journal_user');
  
  console.log('Stored token exists:', !!storedToken);
  console.log('Stored user exists:', !!storedUser);
  
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      console.log('Stored user data:', userData);
      console.log('Stored user role:', userData.role);
      console.log('Stored user email:', userData.email);
    } catch (e) {
      console.log('❌ Error parsing stored user data:', e);
    }
  }
  
  // Step 2: Check current authentication state
  console.log('\n2️⃣ Checking current auth state...');
  
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include',
      headers: {
        'Authorization': storedToken ? `Bearer ${storedToken}` : ''
      }
    });
    
    if (response.ok) {
      const currentUser = await response.json();
      console.log('✅ Current user from API:', currentUser);
      console.log('Current user role:', currentUser.role);
      console.log('Current user email:', currentUser.email);
      
      // Check if stored data is outdated
      if (storedUser) {
        const storedUserData = JSON.parse(storedUser);
        if (storedUserData.role !== currentUser.role) {
          console.log('⚠️ FOUND ISSUE: Stored role is outdated!');
          console.log(`Database role: ${currentUser.role}`);
          console.log(`Stored role: ${storedUserData.role}`);
          
          // Fix: Update stored user data
          console.log('🔧 Fixing: Updating stored user data...');
          localStorage.setItem('africa_journal_user', JSON.stringify(currentUser));
          console.log('✅ User data updated in localStorage');
          
          console.log('🔄 Please refresh the page to see admin dashboard');
          return;
        }
      }
      
    } else {
      console.log('❌ Failed to get current user:', response.status);
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.log('❌ Error checking current user:', error);
  }
  
  // Step 3: Test admin endpoint access
  console.log('\n3️⃣ Testing admin endpoint access...');
  
  try {
    const adminTest = await fetch('/api/users', {
      credentials: 'include',
      headers: {
        'Authorization': storedToken ? `Bearer ${storedToken}` : ''
      }
    });
    
    console.log('Admin API status:', adminTest.status);
    if (adminTest.ok) {
      console.log('✅ Admin API accessible');
    } else {
      console.log('❌ Admin API not accessible:', adminTest.status);
    }
  } catch (error) {
    console.log('❌ Error testing admin API:', error);
  }
  
  // Step 4: Check admin page accessibility
  console.log('\n4️⃣ Testing admin page access...');
  
  try {
    const adminPageTest = await fetch('/admin', {
      method: 'HEAD',
      credentials: 'include'
    });
    
    console.log('Admin page status:', adminPageTest.status);
    if (adminPageTest.ok) {
      console.log('✅ Admin page accessible');
    } else {
      console.log('❌ Admin page not accessible:', adminPageTest.status);
    }
  } catch (error) {
    console.log('❌ Error testing admin page:', error);
  }
  
  // Step 5: Provide solutions
  console.log('\n🔧 SOLUTIONS:');
  console.log('=============');
  
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      console.log('❌ Your stored role is NOT admin');
      console.log('✅ SOLUTION 1: Clear browser storage and re-login');
      console.log('   Run: clearAuthAndReload()');
      console.log('');
      console.log('✅ SOLUTION 2: Update your role in database first, then run:');
      console.log('   await refreshUserData()');
    } else {
      console.log('✅ Your stored role IS admin');
      console.log('💡 Try these solutions:');
      console.log('   1. Hard refresh the page (Ctrl+F5)');
      console.log('   2. Clear cache and re-login');
      console.log('   3. Check network tab for errors');
    }
  } else {
    console.log('❌ No stored user data found');
    console.log('✅ SOLUTION: Please log in first');
  }
}

// Helper function to clear auth and reload
function clearAuthAndReload() {
  console.log('🧹 Clearing authentication data...');
  localStorage.removeItem('africa_journal_access_token');
  localStorage.removeItem('africa_journal_refresh_token');
  localStorage.removeItem('africa_journal_user');
  console.log('✅ Auth data cleared');
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// Helper function to refresh user data from API
async function refreshUserData() {
  console.log('🔄 Refreshing user data from API...');
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('africa_journal_user', JSON.stringify(userData));
      console.log('✅ User data refreshed:', userData);
      console.log('🔄 Please reload the page');
      return userData;
    } else {
      console.log('❌ Failed to refresh user data:', response.status);
    }
  } catch (error) {
    console.log('❌ Error refreshing user data:', error);
  }
}

// Helper function to force admin role update
async function forceAdminRoleUpdate(email) {
  console.log(`🔧 Forcing admin role update for: ${email}`);
  console.log('Note: This requires admin privileges or direct database access');
  
  try {
    const response = await fetch('/api/admin/users/update-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        role: 'admin'
      })
    });
    
    if (response.ok) {
      console.log('✅ Role updated via API');
      await refreshUserData();
    } else {
      console.log('❌ API role update failed:', response.status);
      console.log('💡 Update role in Supabase database directly:');
      console.log(`UPDATE users SET role = 'admin' WHERE email = '${email}';`);
    }
  } catch (error) {
    console.log('❌ Error updating role:', error);
  }
}

// Auto-run the troubleshooter
troubleshootAdminAccess();

// Export helper functions for manual use
window.clearAuthAndReload = clearAuthAndReload;
window.refreshUserData = refreshUserData;
window.forceAdminRoleUpdate = forceAdminRoleUpdate;

console.log('\n💡 QUICK COMMANDS:');
console.log('clearAuthAndReload() - Clear all auth data and reload');
console.log('refreshUserData() - Refresh user data from API'); 
console.log('forceAdminRoleUpdate("your@email.com") - Force admin role update');