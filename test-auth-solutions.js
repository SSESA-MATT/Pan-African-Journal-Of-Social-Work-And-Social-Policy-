// 🧪 TEST DIFFERENT AUTH SOLUTIONS
// Run this to test which solution works best

console.log('🧪 TESTING AUTH SOLUTIONS');
console.log('=========================');

async function testAuthSolutions() {
  const token = localStorage.getItem('africa_journal_access_token');
  const user = JSON.parse(localStorage.getItem('africa_journal_user') || '{}');
  
  console.log('Current user:', user.email, user.role);
  console.log('Has token:', !!token);

  // Test 1: New admin API with bearer token
  console.log('\n🔍 Test 1: Admin API with Bearer Token');
  try {
    const response = await fetch('/api/admin/submissions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Admin API Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin API Success:', data.length, 'submissions');
    } else {
      const error = await response.text();
      console.log('❌ Admin API Error:', error.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Admin API Exception:', error.message);
  }

  // Test 2: Simple API
  console.log('\n🔍 Test 2: Simple API');
  try {
    const response = await fetch('/api/submissions/simple', {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Simple API Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Simple API Success:', data);
    } else {
      const error = await response.text();
      console.log('❌ Simple API Error:', error.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Simple API Exception:', error.message);
  }

  // Test 3: Auth debug
  console.log('\n🔍 Test 3: Auth Debug');
  try {
    const response = await fetch('/api/auth/debug', {
      credentials: 'include'
    });
    
    console.log('Auth Debug Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Auth Debug Success:', data);
    } else {
      const error = await response.text();
      console.log('❌ Auth Debug Error:', error.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Auth Debug Exception:', error.message);
  }

  console.log('\n📋 RECOMMENDATIONS:');
  console.log('1. If Admin API works → Use bearer token approach');
  console.log('2. If Simple API works → Auth is fine, problem is RLS');
  console.log('3. If Auth Debug works → Cookie auth is working');
  console.log('4. If none work → Need to check Supabase config');
}

testAuthSolutions();