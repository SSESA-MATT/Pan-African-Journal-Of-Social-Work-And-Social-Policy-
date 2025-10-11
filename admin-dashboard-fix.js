// 🔧 ADMIN DASHBOARD FIX
// Run this in browser console to fix the admin dashboard errors

console.log('🔧 FIXING ADMIN DASHBOARD');
console.log('========================');

async function fixAdminDashboard() {
  console.log('🔍 Testing admin API endpoints...');

  // Test statistics endpoint
  try {
    const statsResponse = await fetch('/api/submissions/statistics', {
      credentials: 'include'
    });
    console.log('Statistics endpoint:', statsResponse.status);
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Statistics working:', stats);
    } else {
      console.log('❌ Statistics failed:', await statsResponse.text());
    }
  } catch (error) {
    console.log('❌ Statistics error:', error);
  }

  // Test submissions endpoint
  try {
    const submissionsResponse = await fetch('/api/manuscripts/admin/all', {
      credentials: 'include'
    });
    console.log('Submissions endpoint:', submissionsResponse.status);
    
    if (submissionsResponse.ok) {
      const submissions = await submissionsResponse.json();
      console.log('✅ Submissions working:', submissions.length || 0, 'items');
    } else {
      console.log('❌ Submissions failed:', await submissionsResponse.text());
    }
  } catch (error) {
    console.log('❌ Submissions error:', error);
  }

  // Test users endpoint
  try {
    const usersResponse = await fetch('/api/users', {
      credentials: 'include'
    });
    console.log('Users endpoint:', usersResponse.status);
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Users working:', users.length || 0, 'users');
    } else {
      console.log('❌ Users failed:', await usersResponse.text());
    }
  } catch (error) {
    console.log('❌ Users error:', error);
  }

  console.log('\n🔄 Refreshing page to apply fixes...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

fixAdminDashboard();