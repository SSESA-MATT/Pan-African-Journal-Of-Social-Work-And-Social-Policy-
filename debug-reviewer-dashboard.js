// Debug script for reviewer dashboard API
// Run this in the browser console while logged in as a reviewer

async function debugReviewerDashboard() {
  console.log('🔍 DEBUGGING REVIEWER DASHBOARD...');
  console.log('==========================================');
  
  try {
    // Step 1: Test basic authentication
    console.log('\n1️⃣ Testing Authentication...');
    const authResponse = await fetch('/api/reviewer-auth-debug', {
      credentials: 'include'
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Auth successful:', authData);
    } else {
      console.log('❌ Auth failed:', authResponse.status, authResponse.statusText);
      const authError = await authResponse.text();
      console.log('Auth error details:', authError);
    }
    
    // Step 2: Test dashboard API with detailed logging
    console.log('\n2️⃣ Testing Dashboard API...');
    const dashboardResponse = await fetch('/api/reviews/dashboard', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Dashboard response status:', dashboardResponse.status);
    console.log('Dashboard response ok:', dashboardResponse.ok);
    console.log('Dashboard response headers:', Object.fromEntries(dashboardResponse.headers.entries()));
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard API successful');
      console.log('📊 Dashboard data:', dashboardData);
      
      // Analyze the data
      console.log('\n3️⃣ Analyzing Data...');
      console.log('Data source:', dashboardData.dataSource);
      console.log('Pending reviews count:', dashboardData.pendingReviews?.length || 0);
      console.log('Message:', dashboardData.message);
      
      if (dashboardData.pendingReviews && dashboardData.pendingReviews.length > 0) {
        console.log('\n📝 Pending Reviews:');
        dashboardData.pendingReviews.forEach((review, index) => {
          console.log(`Review ${index + 1}:`, {
            id: review.id,
            title: review.title,
            status: review.status,
            author: `${review.author_first_name} ${review.author_last_name}`,
            dataType: review.id.startsWith('mock-') ? 'MOCK' : 'REAL'
          });
        });
      }
      
    } else {
      console.log('❌ Dashboard API failed');
      const errorText = await dashboardResponse.text();
      console.log('Error response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Parsed error:', errorJson);
      } catch (e) {
        console.log('Raw error text:', errorText);
      }
    }
    
    // Step 3: Test direct Supabase connection
    console.log('\n4️⃣ Testing Direct Database Connection...');
    try {
      const directResponse = await fetch('/api/submissions', {
        credentials: 'include'
      });
      
      if (directResponse.ok) {
        const submissions = await directResponse.json();
        console.log('✅ Direct submissions API works');
        console.log('Submissions count:', submissions?.length || 0);
        if (submissions && submissions.length > 0) {
          console.log('First submission:', {
            id: submissions[0].id,
            title: submissions[0].title,
            status: submissions[0].status
          });
        }
      } else {
        console.log('❌ Direct submissions API failed:', directResponse.status);
      }
    } catch (subError) {
      console.log('❌ Direct submissions test failed:', subError);
    }
    
    // Step 4: Environment check
    console.log('\n5️⃣ Environment Information...');
    console.log('Current URL:', window.location.href);
    console.log('Host:', window.location.host);
    console.log('Protocol:', window.location.protocol);
    console.log('User Agent:', navigator.userAgent);
    
    // Step 5: Check if we're on Vercel
    if (window.location.host.includes('vercel.app')) {
      console.log('🚀 Running on Vercel deployment');
      console.log('Make sure:');
      console.log('- Database functions are created in production Supabase');
      console.log('- Environment variables are set in Vercel');
      console.log('- API routes are properly deployed');
    } else {
      console.log('🏠 Running locally');
    }
    
    console.log('\n📋 DEBUG SUMMARY:');
    console.log('==========================================');
    
  } catch (error) {
    console.error('💥 Debug script failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the debug script
console.log('Starting reviewer dashboard debug...');
debugReviewerDashboard();