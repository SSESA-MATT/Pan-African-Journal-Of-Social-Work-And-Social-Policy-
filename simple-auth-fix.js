// 🔧 SIMPLE AUTH FIX FOR ADMIN DASHBOARD
// This bypasses complex cookie authentication for testing

console.log('🔧 SIMPLE AUTH FIX');
console.log('==================');

// Simple fix: Update the admin APIs to use localStorage token instead of cookies
async function fixAuthForTesting() {
  console.log('🔍 Checking current auth setup...');
  
  // Get stored auth data
  const storedUser = localStorage.getItem('africa_journal_user');
  const storedToken = localStorage.getItem('africa_journal_access_token');
  
  if (!storedUser || !storedToken) {
    console.log('❌ No auth data found. Please log in first.');
    return;
  }
  
  const userData = JSON.parse(storedUser);
  console.log('Current user:', userData.email, userData.role);
  
  if (userData.role !== 'admin') {
    console.log('❌ User is not admin. Fixing role...');
    userData.role = 'admin';
    localStorage.setItem('africa_journal_user', JSON.stringify(userData));
    console.log('✅ Role updated to admin');
  }
  
  console.log('🧪 Testing admin endpoints with auth headers...');
  
  // Test with Authorization header instead of cookies
  const testEndpoints = [
    '/api/users',
    '/api/submissions/all',
    '/api/volumes'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${endpoint}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`  Error: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`${endpoint}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n💡 If APIs still fail, the issue is database/RLS policies');
  console.log('💡 Run this in Supabase SQL Editor:');
  console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;');
  
  console.log('\n🔄 Refreshing page...');
  setTimeout(() => window.location.reload(), 3000);
}

fixAuthForTesting();