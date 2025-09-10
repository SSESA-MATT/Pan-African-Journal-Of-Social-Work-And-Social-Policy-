// Test API connectivity
// Run this in your browser console on localhost:3001

async function testAPI() {
  try {
    // Test 1: Health check
    const healthResponse = await fetch('/api/health');
    console.log('Health API:', healthResponse.status, await healthResponse.text());
    
    // Test 2: Submissions API
    const submissionsResponse = await fetch('/api/submissions');
    console.log('Submissions API:', submissionsResponse.status, await submissionsResponse.text());
    
    // Test 3: Reviews Dashboard API
    const dashboardResponse = await fetch('/api/reviews/dashboard');
    console.log('Dashboard API:', dashboardResponse.status, await dashboardResponse.text());
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
}

testAPI();
