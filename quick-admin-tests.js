// 📋 SIMPLE QUICK TESTS - Run these one by one to identify issues
// Copy each test individually into browser console

console.log('📋 Quick Admin Tests Available');

// === TEST 1: Basic Auth Check ===
function test1_authCheck() {
  console.log('\n🔍 TEST 1: Basic Auth Check');
  const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
  console.log('- Has user data:', !!authData.user);
  console.log('- User email:', authData.user?.email);
  console.log('- Has access token:', !!authData.access_token);
  return !!authData.user;
}

// === TEST 2: Profile API Test ===
async function test2_profileAPI() {
  console.log('\n🔍 TEST 2: Profile API Test');
  try {
    const response = await fetch('/api/auth/user', { credentials: 'include' });
    console.log('- Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('- Profile data:', data);
      return true;
    } else {
      const error = await response.text();
      console.log('- Error:', error);
      return false;
    }
  } catch (error) {
    console.log('- Exception:', error.message);
    return false;
  }
}

// === TEST 3: Statistics API Test ===
async function test3_statisticsAPI() {
  console.log('\n🔍 TEST 3: Statistics API Test');
  try {
    const response = await fetch('/api/submissions/statistics', { credentials: 'include' });
    console.log('- Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('- Statistics data:', data);
      return true;
    } else {
      const error = await response.text();
      console.log('- Error:', error);
      return false;
    }
  } catch (error) {
    console.log('- Exception:', error.message);
    return false;
  }
}

// === TEST 4: Database Connection Test ===
async function test4_databaseConnection() {
  console.log('\n🔍 TEST 4: Database Connection Test');
  try {
    const response = await fetch('/api/test-db', { credentials: 'include' });
    console.log('- Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('- DB data:', data);
      return true;
    } else {
      const error = await response.text();
      console.log('- Error:', error);
      return false;
    }
  } catch (error) {
    console.log('- Exception:', error.message);
    return false;
  }
}

// === RUN ALL TESTS ===
async function runAllQuickTests() {
  console.log('🚀 Running All Quick Tests...');
  console.log('='.repeat(40));
  
  const test1 = test1_authCheck();
  const test2 = await test2_profileAPI();
  const test3 = await test3_statisticsAPI();
  const test4 = await test4_databaseConnection();
  
  console.log('\n📊 TEST RESULTS:');
  console.log('- Auth Check:', test1 ? '✅' : '❌');
  console.log('- Profile API:', test2 ? '✅' : '❌');
  console.log('- Statistics API:', test3 ? '✅' : '❌');
  console.log('- Database Connection:', test4 ? '✅' : '❌');
  
  if (test1 && test2 && test3 && test4) {
    console.log('\n🎉 All tests passed! Admin dashboard should work.');
  } else {
    console.log('\n❌ Some tests failed. Issues identified:');
    if (!test1) console.log('  - Authentication issue');
    if (!test2) console.log('  - User profile missing/broken');
    if (!test3) console.log('  - Statistics API blocked (RLS issue)');
    if (!test4) console.log('  - Database connection problem');
  }
}

// Make tests available globally
window.quickTests = {
  test1_authCheck,
  test2_profileAPI,
  test3_statisticsAPI,
  test4_databaseConnection,
  runAllQuickTests
};

console.log('\n📋 Usage:');
console.log('- runAllQuickTests() - Run all tests');
console.log('- test1_authCheck() - Check authentication');
console.log('- test2_profileAPI() - Test profile API');
console.log('- test3_statisticsAPI() - Test statistics API');
console.log('- test4_databaseConnection() - Test database');