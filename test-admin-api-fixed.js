// Admin API Test - Fixed Routes
// Run in browser console while logged in as admin

async function testFixedAdminAPIs() {
  console.log('🔧 Testing Fixed Admin API Routes...');
  
  try {
    // Test 1: Statistics API
    console.log('\n📊 Testing Statistics API...');
    const statsResponse = await fetch('/api/submissions/statistics', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Statistics API SUCCESS:', statsData);
    } else {
      const errorData = await statsResponse.text();
      console.log('❌ Statistics API FAILED:', statsResponse.status, errorData);
    }

    // Test 2: User Stats API
    console.log('\n👥 Testing User Stats API...');
    const userStatsResponse = await fetch('/api/users/stats', {
      method: 'GET', 
      credentials: 'include'
    });
    
    if (userStatsResponse.ok) {
      const userStatsData = await userStatsResponse.json();
      console.log('✅ User Stats API SUCCESS:', userStatsData);
    } else {
      const errorData = await userStatsResponse.text();
      console.log('❌ User Stats API FAILED:', userStatsResponse.status, errorData);
    }

    // Test 3: All Submissions API
    console.log('\n📄 Testing All Submissions API...');
    const submissionsResponse = await fetch('/api/submissions/all', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (submissionsResponse.ok) {
      const submissionsData = await submissionsResponse.json();
      console.log('✅ All Submissions API SUCCESS:', submissionsData);
    } else {
      const errorData = await submissionsResponse.text();
      console.log('❌ All Submissions API FAILED:', submissionsResponse.status, errorData);
    }

    // Test 4: Admin Submissions API (the original working one)
    console.log('\n🔐 Testing Admin Submissions API...');
    const adminSubsResponse = await fetch('/api/admin/submissions', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (adminSubsResponse.ok) {
      const adminSubsData = await adminSubsResponse.json();
      console.log('✅ Admin Submissions API SUCCESS:', adminSubsData);
    } else {
      const errorData = await adminSubsResponse.text();
      console.log('❌ Admin Submissions API FAILED:', adminSubsResponse.status, errorData);
    }

    console.log('\n🎉 Admin API testing complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testFixedAdminAPIs();