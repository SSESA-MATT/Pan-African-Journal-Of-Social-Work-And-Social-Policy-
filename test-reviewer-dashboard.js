// Test script to validate reviewer dashboard setup
// Run this in browser console while logged in as a reviewer

async function testReviewerDashboard() {
  console.log('🧪 Testing Reviewer Dashboard Setup...');
  
  try {
    // Test 1: Check authentication
    console.log('\n1️⃣ Testing authentication...');
    const authResponse = await fetch('/api/reviewer-auth-debug', {
      credentials: 'include'
    });
    const authData = await authResponse.json();
    console.log('Auth status:', authData);
    
    if (!authData.authenticated) {
      console.error('❌ User not authenticated');
      return;
    }
    
    if (!['reviewer', 'editor', 'admin'].includes(authData.user?.role)) {
      console.error('❌ User does not have reviewer permissions');
      return;
    }
    
    console.log('✅ Authentication successful');
    
    // Test 2: Test dashboard API
    console.log('\n2️⃣ Testing dashboard API...');
    const dashboardResponse = await fetch('/api/reviews/dashboard', {
      credentials: 'include'
    });
    
    if (!dashboardResponse.ok) {
      console.error('❌ Dashboard API failed:', dashboardResponse.status);
      const errorData = await dashboardResponse.json();
      console.error('Error details:', errorData);
      return;
    }
    
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard API successful');
    console.log('Dashboard data:', dashboardData);
    
    // Test 3: Validate data structure
    console.log('\n3️⃣ Validating data structure...');
    
    const hasRealData = dashboardData.dataSource === 'database';
    console.log('Data source:', dashboardData.dataSource);
    
    if (hasRealData) {
      console.log('✅ Using real database data');
      console.log(`📊 Found ${dashboardData.pendingReviews.length} pending reviews`);
      
      // Check each pending review
      dashboardData.pendingReviews.forEach((review, index) => {
        console.log(`\n📝 Review ${index + 1}:`);
        console.log(`   Title: ${review.title}`);
        console.log(`   Author: ${review.author_first_name} ${review.author_last_name}`);
        console.log(`   Status: ${review.status}`);
        console.log(`   Submitted: ${review.submitted_at}`);
        console.log(`   Due: ${review.due_date}`);
        
        if (review.review_id) {
          console.log(`   Review ID: ${review.review_id}`);
        }
      });
    } else {
      console.log('⚠️ Still using mock data');
      console.log('This means either:');
      console.log('- No submissions are assigned to this reviewer');
      console.log('- Database functions are not working');
      console.log('- RLS policies are blocking access');
    }
    
    // Test 4: Check review stats
    console.log('\n4️⃣ Checking review statistics...');
    console.log('Review stats:', dashboardData.reviewStats);
    
    if (dashboardData.reviewStats.pendingCount > 0) {
      console.log('✅ Has pending reviews to work on');
    } else {
      console.log('ℹ️ No pending reviews (this is normal for new reviewers)');
    }
    
    console.log('\n🎉 Reviewer dashboard test completed!');
    
    // Test summary
    console.log('\n📋 TEST SUMMARY:');
    console.log(`✅ Authentication: ${authData.authenticated ? 'PASS' : 'FAIL'}`);
    console.log(`✅ API Response: ${dashboardResponse.ok ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Data Source: ${hasRealData ? 'REAL DATA' : 'MOCK DATA'}`);
    console.log(`✅ Pending Reviews: ${dashboardData.pendingReviews.length}`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testReviewerDashboard();