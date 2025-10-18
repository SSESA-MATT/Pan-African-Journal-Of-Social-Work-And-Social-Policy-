// 🔍 COMPREHENSIVE ADMIN DEBUG SCRIPT
// Copy and paste this entire script into your browser console while logged into admin dashboard

console.log('🚀 Starting Comprehensive Admin Debug Analysis...');

async function debugAdminSystem() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 ADMIN SYSTEM DIAGNOSTIC REPORT');
  console.log('='.repeat(60));

  // === STEP 1: AUTHENTICATION STATUS ===
  console.log('\n📋 STEP 1: AUTHENTICATION STATUS');
  console.log('-'.repeat(40));
  
  try {
    // Check localStorage auth data
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
    console.log('💾 LocalStorage Auth Data:');
    console.log('- Has access_token:', !!authData.access_token);
    console.log('- Has refresh_token:', !!authData.refresh_token);
    console.log('- Token type:', authData.token_type);
    console.log('- Expires at:', authData.expires_at ? new Date(authData.expires_at * 1000) : 'Not set');
    
    // Check if user data exists
    if (authData.user) {
      console.log('👤 User Data from localStorage:');
      console.log('- ID:', authData.user.id);
      console.log('- Email:', authData.user.email);
      console.log('- Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
      console.log('- Created:', authData.user.created_at);
    } else {
      console.log('❌ No user data in localStorage');
    }
  } catch (error) {
    console.log('❌ Error reading localStorage auth:', error.message);
  }

  // === STEP 2: API AUTHENTICATION TEST ===
  console.log('\n📋 STEP 2: API AUTHENTICATION TEST');
  console.log('-'.repeat(40));
  
  try {
    const authDebugResponse = await fetch('/api/auth/debug', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('🔐 Auth Debug API Response:');
    console.log('- Status:', authDebugResponse.status);
    console.log('- OK:', authDebugResponse.ok);
    
    if (authDebugResponse.ok) {
      const authDebugData = await authDebugResponse.json();
      console.log('✅ Auth Debug Success:');
      console.log('- Session exists:', !!authDebugData.session);
      console.log('- User exists:', !!authDebugData.user);
      console.log('- Profile exists:', !!authDebugData.profile);
      
      if (authDebugData.profile) {
        console.log('👤 Profile from API:');
        console.log('- ID:', authDebugData.profile.id);
        console.log('- Email:', authDebugData.profile.email);
        console.log('- Role:', authDebugData.profile.role);
        console.log('- First name:', authDebugData.profile.first_name);
        console.log('- Last name:', authDebugData.profile.last_name);
      }
    } else {
      const errorText = await authDebugResponse.text();
      console.log('❌ Auth Debug Failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Auth Debug API Error:', error.message);
  }

  // === STEP 3: DATABASE USER PROFILE CHECK ===
  console.log('\n📋 STEP 3: DATABASE PROFILE VERIFICATION');
  console.log('-'.repeat(40));
  
  try {
    // Test direct auth endpoint
    const userResponse = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('👤 User Profile API Response:');
    console.log('- Status:', userResponse.status);
    console.log('- OK:', userResponse.ok);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User Profile Success:', userData);
    } else {
      const errorText = await userResponse.text();
      console.log('❌ User Profile Failed:', errorText);
    }
  } catch (error) {
    console.log('❌ User Profile API Error:', error.message);
  }

  // === STEP 4: ADMIN API ENDPOINTS TEST ===
  console.log('\n📋 STEP 4: ADMIN API ENDPOINTS TEST');
  console.log('-'.repeat(40));
  
  const endpoints = [
    { name: 'Statistics', url: '/api/submissions/statistics' },
    { name: 'User Stats', url: '/api/users/stats' },
    { name: 'All Submissions', url: '/api/submissions/all' },
    { name: 'Admin Submissions', url: '/api/admin/submissions' },
    { name: 'Volumes', url: '/api/volumes' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔗 Testing ${endpoint.name} API...`);
      const response = await fetch(endpoint.url, {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log(`- Status: ${response.status} (${response.ok ? 'OK' : 'FAILED'})`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`- Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
        console.log(`- Data length/keys: ${Array.isArray(data) ? data.length : Object.keys(data || {}).length}`);
      } else {
        const errorText = await response.text();
        console.log(`- Error: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} API Error:`, error.message);
    }
  }

  // === STEP 5: ENVIRONMENT CHECK ===
  console.log('\n📋 STEP 5: ENVIRONMENT & CONFIGURATION');
  console.log('-'.repeat(40));
  
  try {
    const envResponse = await fetch('/api/env-debug', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('🌍 Environment Configuration:');
      console.log('- Supabase URL:', envData.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
      console.log('- Supabase Anon Key:', envData.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
      console.log('- Service Role Key:', envData.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
      console.log('- Node Environment:', envData.NODE_ENV);
    } else {
      console.log('❌ Environment check failed');
    }
  } catch (error) {
    console.log('❌ Environment check error:', error.message);
  }

  // === STEP 6: COOKIE INSPECTION ===
  console.log('\n📋 STEP 6: COOKIE INSPECTION');
  console.log('-'.repeat(40));
  
  const cookies = document.cookie.split(';').map(c => c.trim());
  const supabaseCookies = cookies.filter(c => c.includes('supabase'));
  
  console.log('🍪 Supabase Cookies Found:', supabaseCookies.length);
  supabaseCookies.forEach((cookie, index) => {
    const [name] = cookie.split('=');
    console.log(`- Cookie ${index + 1}: ${name}`);
  });

  // === SUMMARY ===
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log('1. Check authentication status above');
  console.log('2. Look for any API endpoints returning 404/403/500');
  console.log('3. Verify user profile exists in database');
  console.log('4. Check if service role key is available');
  console.log('5. Review cookie and localStorage data');
  console.log('\n🎯 Next steps based on findings above...');
}

// Run the comprehensive debug
debugAdminSystem();