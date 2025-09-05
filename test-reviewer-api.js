// Test script to verify the reviewer dashboard API endpoint
async function testReviewerDashboard() {
  // You would need to replace this with an actual JWT token from a logged-in reviewer
  const testToken = 'your-jwt-token-here';
  
  try {
    const response = await fetch('http://localhost:3000/api/reviews/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ API endpoint is working correctly');
      console.log('Pending reviews:', data.pendingReviews?.length || 0);
      console.log('Completed reviews:', data.completedReviews?.length || 0);
    } else {
      console.log('❌ API returned an error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

// Note: This test requires a valid JWT token
console.log('To test the API endpoint:');
console.log('1. Login as a reviewer to get a JWT token');
console.log('2. Replace "your-jwt-token-here" with the actual token');
console.log('3. Run testReviewerDashboard()');
