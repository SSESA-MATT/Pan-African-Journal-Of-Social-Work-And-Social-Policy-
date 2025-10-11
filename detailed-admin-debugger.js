// 🔧 DETAILED ADMIN API DEBUGGER
// Run this to get detailed error information

console.log('🔧 DETAILED ADMIN API DEBUGGER');
console.log('===============================');

async function debugAdminAPIs() {
  
  const endpoints = [
    { name: 'Users API', url: '/api/users' },
    { name: 'Reviewers API', url: '/api/users/reviewers' },
    { name: 'Test Connection', url: '/api/test-connection' },
    { name: 'Health Check', url: '/api/health' },
    { name: 'Submissions Statistics', url: '/api/submissions/statistics' },
    { name: 'Admin Submissions', url: '/api/manuscripts/admin/all' }
  ];

  console.log('🔍 Testing each endpoint with detailed error info...\n');

  for (const endpoint of endpoints) {
    console.log(`\n🧪 Testing: ${endpoint.name}`);
    console.log(`📍 URL: ${endpoint.url}`);
    
    try {
      const response = await fetch(endpoint.url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`✅ Success:`, typeof data === 'object' && Array.isArray(data) ? `${data.length} items` : 'OK');
          if (Array.isArray(data) && data.length > 0) {
            console.log(`📋 Sample data:`, data[0]);
          }
        } catch (jsonError) {
          console.log(`✅ Success: Non-JSON response`);
        }
      } else {
        try {
          const errorData = await response.json();
          console.log(`❌ Error details:`, errorData);
        } catch (jsonError) {
          const errorText = await response.text();
          console.log(`❌ Error text:`, errorText.substring(0, 200));
        }
      }
      
    } catch (fetchError) {
      console.log(`💥 Fetch error:`, fetchError.message);
    }
  }

  // Test database connection directly
  console.log('\n🗄️ Testing database access...');
  try {
    const dbTest = await fetch('/api/health', { credentials: 'include' });
    if (dbTest.ok) {
      const health = await dbTest.json();
      console.log('📊 Database health:', health);
    }
  } catch (error) {
    console.log('❌ Database test failed:', error);
  }

  // Check current user permissions
  console.log('\n👤 Checking current user...');
  const storedUser = localStorage.getItem('africa_journal_user');
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    console.log('👤 Current user:', {
      email: userData.email,
      role: userData.role,
      id: userData.id
    });
  }
}

debugAdminAPIs();