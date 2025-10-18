// 🔍 REGISTRATION DEBUG SCRIPT
// Run this in browser console to debug registration issues

async function debugRegistration() {
  console.log('🔍 Debugging Registration Process...');
  
  const testData = {
    email: 'mattdesire958@gmail.com',
    password: 'TestPassword123!',
    first_name: 'Desire', 
    last_name: 'Matayo',
    affiliation: 'Test University',
    role: 'author'
  };

  console.log('📝 Test registration data:', testData);

  try {
    // Test the register-direct API
    console.log('\n🔗 Testing /api/auth/register-direct...');
    const response = await fetch('/api/auth/register-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('📊 Raw response:', responseText);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('📊 Parsed response:', responseData);
    } catch (parseError) {
      console.log('❌ Failed to parse JSON response');
    }

    // Also test environment
    console.log('\n🌍 Testing environment...');
    const envResponse = await fetch('/api/env-debug');
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('Environment check:', {
        supabaseUrl: envData.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: envData.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      });
    }

  } catch (error) {
    console.error('❌ Registration debug error:', error);
  }
}

// Run the debug
debugRegistration();