// Comprehensive Admin Dashboard Fix and Test Script
// This script tests all admin functionality and provides detailed diagnostics

async function testEndpoint(url, description) {
  console.log(`\\n🧪 Testing: ${description}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS: ${response.status}`);
      
      // Log relevant data info
      if (data.submissions) {
        console.log(`   📄 Found ${data.submissions.length} submissions`);
      } else if (data.users) {
        console.log(`   👥 Found ${data.users.length} users`);
      } else if (data.tests) {
        console.log(`   🔍 Diagnostic tests completed`);
      } else {
        console.log(`   📊 Data type: ${typeof data}`);
      }
      
      return { success: true, data, status: response.status };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ ERROR: ${response.status} - ${response.statusText}`);
      console.log(`   Details: ${errorText.substring(0, 200)}...`);
      
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.log(`   💥 NETWORK ERROR: ${error.message}`);
    return { success: false, error: error.message, status: 0 };
  }
}

async function runComprehensiveTest() {
  console.log('🚀 COMPREHENSIVE ADMIN DASHBOARD FIX & TEST');
  console.log('=' .repeat(60));
  console.log('Testing all admin functionality and providing diagnostics');
  
  const baseUrl = 'http://localhost:3004';
  const results = {};
  
  // Test 1: Diagnostics API
  results.diagnostics = await testEndpoint(
    `${baseUrl}/api/admin/diagnostics`,
    'Admin Diagnostics API'
  );
  
  // Test 2: Admin Submissions
  results.adminSubmissions = await testEndpoint(
    `${baseUrl}/api/admin/submissions`,
    'Admin Submissions API'
  );
  
  // Test 3: Admin Users
  results.adminUsers = await testEndpoint(
    `${baseUrl}/api/admin/users`,
    'Admin Users API'
  );
  
  // Test 4: Admin Reviewers
  results.adminReviewers = await testEndpoint(
    `${baseUrl}/api/admin/reviewers`,
    'Admin Reviewers API'
  );
  
  // Test 5: User Stats
  results.userStats = await testEndpoint(
    `${baseUrl}/api/users/stats`,
    'User Statistics API'
  );
  
  // Test 6: General Submissions
  results.submissions = await testEndpoint(
    `${baseUrl}/api/submissions/all`,
    'General Submissions API'
  );
  
  // Generate comprehensive report
  console.log('\\n📋 COMPREHENSIVE TEST REPORT');
  console.log('=' .repeat(60));
  
  const totalTests = Object.keys(results).length;
  const successfulTests = Object.values(results).filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  
  console.log(`\\n📊 OVERALL STATISTICS:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Successful: ${successfulTests} (${Math.round(successfulTests/totalTests*100)}%)`);
  console.log(`   Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
  
  // Detailed results
  console.log(`\\n🔍 DETAILED RESULTS:`);
  Object.entries(results).forEach(([testName, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${testName}: HTTP ${result.status}`);
    
    if (!result.success && result.error) {
      console.log(`      Error: ${result.error.substring(0, 100)}...`);
    }
  });
  
  // Specific diagnostics analysis
  if (results.diagnostics?.success && results.diagnostics.data?.tests) {
    console.log(`\\n🔧 DATABASE DIAGNOSTICS:`);
    const tests = results.diagnostics.data.tests;
    
    Object.entries(tests).forEach(([testName, testResult]) => {
      const status = testResult.status === 'success' ? '✅' : 
                   testResult.status === 'authenticated' ? '✅' : 
                   testResult.status === 'not_authenticated' ? '⚠️' : '❌';
      console.log(`   ${status} ${testName}: ${testResult.status}`);
      if (testResult.message) {
        console.log(`      ${testResult.message}`);
      }
    });
  }
  
  // Recommendations
  console.log(`\\n💡 RECOMMENDATIONS:`);
  
  if (results.diagnostics?.success) {
    const diagnostics = results.diagnostics.data;
    const hasDbErrors = Object.values(diagnostics.tests || {}).some(test => test.status === 'error');
    
    if (hasDbErrors) {
      console.log(`   1. 🔧 Database Issues Detected:`);
      console.log(`      - Run: npx supabase db push`);
      console.log(`      - Or apply migrations manually in Supabase dashboard`);
      console.log(`      - Check supabase/migrations/ directory`);
    }
    
    const isAuthenticated = diagnostics.tests?.authSession?.status === 'authenticated';
    if (!isAuthenticated) {
      console.log(`   2. 🔐 Authentication:`);
      console.log(`      - Log in to the admin dashboard`);
      console.log(`      - Ensure user has admin/editor role`);
      console.log(`      - Check Supabase auth configuration`);
    }
  }
  
  if (failedTests > 0) {
    console.log(`   3. 🚨 API Issues:`);
    console.log(`      - Check server is running on port 3004`);
    console.log(`      - Verify environment variables in .env.local`);
    console.log(`      - Check browser console for detailed errors`);
  }
  
  if (successfulTests === totalTests) {
    console.log(`   🎉 All tests passed! Admin dashboard should be working correctly.`);
  }
  
  // Next steps
  console.log(`\\n🚀 NEXT STEPS:`);
  console.log(`   1. Open browser to http://localhost:3004/admin`);
  console.log(`   2. Log in with admin credentials`);
  console.log(`   3. Test each tab in the admin dashboard`);
  console.log(`   4. If issues persist, check browser console for errors`);
  
  console.log('\\n🏁 COMPREHENSIVE TEST COMPLETED');
  console.log('=' .repeat(60));
}

// Run the comprehensive test
runComprehensiveTest().catch(error => {
  console.error('💥 Test script failed:', error);
});