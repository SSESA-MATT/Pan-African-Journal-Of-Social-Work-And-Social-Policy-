// Database Connection Test
// Tests if we can connect to the database and if basic tables exist

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection and Schema');
  console.log('=' .repeat(50));
  
  try {
    // Test basic API endpoint that should work
    console.log('\n1. Testing basic API connectivity...');
    const response = await fetch('http://localhost:3004/api/users/stats');
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API is responding');
      console.log('   📊 User stats:', JSON.stringify(data, null, 2));
    } else {
      console.log(`   ❌ API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.log('   Error details:', errorText.substring(0, 200));
    }
    
    // Test admin submissions endpoint specifically
    console.log('\n2. Testing admin submissions endpoint...');
    const adminResponse = await fetch('http://localhost:3004/api/admin/submissions');
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('   ✅ Admin submissions API is working');
      console.log('   📄 Found submissions:', adminData.submissions?.length || 0);
    } else {
      console.log(`   ❌ Admin API error: ${adminResponse.status} - ${adminResponse.statusText}`);
      const errorText = await adminResponse.text();
      console.log('   Error details:', errorText.substring(0, 300));
    }
    
    // Test other critical endpoints
    const endpoints = [
      '/api/submissions/all',
      '/api/admin/users',
      '/api/admin/reviewers'
    ];
    
    console.log('\n3. Testing other critical endpoints...');
    for (const endpoint of endpoints) {
      try {
        const resp = await fetch(`http://localhost:3004${endpoint}`);
        const status = resp.ok ? '✅' : '❌';
        console.log(`   ${status} ${endpoint}: ${resp.status}`);
        
        if (!resp.ok) {
          const errorText = await resp.text();
          console.log(`      Error: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   💥 ${endpoint}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('\n💥 Critical test error:', error.message);
  }
  
  console.log('\n🏁 Database connection test completed');
}

// Run the test
testDatabaseConnection();