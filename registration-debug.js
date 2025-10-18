// 🔍 REGISTRATION DEBUG SCRIPT
// Copy and paste this into your browser console on the registration page

console.log('🔍 Registration Debug Script Loaded');

async function debugRegistration() {
  console.log('\n='.repeat(60));
  console.log('🚀 REGISTRATION DEBUG ANALYSIS');
  console.log('='.repeat(60));

  // === STEP 1: Test API Endpoints ===
  console.log('\n📋 STEP 1: Testing Registration API Endpoints');
  console.log('-'.repeat(50));

  const testData = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    affiliation: 'Test University',
    role: 'author'
  };

  // Test register-simple endpoint
  console.log('🔗 Testing /api/auth/register-simple...');
  try {
    const response = await fetch('/api/auth/register-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('- Status:', response.status);
    console.log('- OK:', response.ok);
    
    const data = await response.text();
    console.log('- Response:', data.substring(0, 500));
    
    if (response.ok) {
      console.log('✅ register-simple endpoint is working');
    } else {
      console.log('❌ register-simple endpoint failed');
    }
  } catch (error) {
    console.log('❌ register-simple endpoint error:', error.message);
  }

  // === STEP 2: Test Environment Variables ===
  console.log('\n📋 STEP 2: Environment Configuration Check');
  console.log('-'.repeat(50));
  
  try {
    const envResponse = await fetch('/api/env-debug');
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('🌍 Environment Status:');
      console.log('- Supabase URL:', envData.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
      console.log('- Anon Key:', envData.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
      console.log('- Service Key:', envData.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
      console.log('- Node Env:', envData.NODE_ENV);
    } else {
      console.log('❌ Could not fetch environment info');
    }
  } catch (error) {
    console.log('❌ Environment check error:', error.message);
  }

  // === STEP 3: Database Connection Test ===
  console.log('\n📋 STEP 3: Database Connection Test');
  console.log('-'.repeat(50));
  
  try {
    const dbResponse = await fetch('/api/test-db');
    console.log('- DB Test Status:', dbResponse.status);
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('✅ Database connection working');
      console.log('- Users in system:', dbData.userCount || 'Unknown');
    } else {
      const error = await dbResponse.text();
      console.log('❌ Database connection failed:', error.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Database test error:', error.message);
  }

  // === STEP 4: Test Real Registration ===
  console.log('\n📋 STEP 4: Real Registration Test');
  console.log('-'.repeat(50));
  
  const realEmail = prompt('Enter email to test registration:') || 'testuser' + Date.now() + '@example.com';
  
  console.log('🧪 Testing registration with email:', realEmail);
  
  try {
    const realRegistration = await fetch('/api/auth/register-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: realEmail,
        password: 'TestPassword123!',
        first_name: 'Debug',
        last_name: 'User',
        affiliation: 'Test',
        role: 'author'
      })
    });
    
    console.log('📊 Real Registration Results:');
    console.log('- Status:', realRegistration.status);
    console.log('- Status Text:', realRegistration.statusText);
    
    const responseText = await realRegistration.text();
    console.log('- Raw Response:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('- Parsed Response:', responseJson);
      
      if (realRegistration.ok) {
        console.log('🎉 Registration SUCCESS!');
      } else {
        console.log('❌ Registration FAILED:', responseJson.error);
      }
    } catch (parseError) {
      console.log('❌ Could not parse response as JSON');
    }
    
  } catch (error) {
    console.log('❌ Real registration test error:', error.message);
  }

  // === SUMMARY ===
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEBUG SUMMARY');
  console.log('='.repeat(60));
  console.log('1. Check API endpoint status above');
  console.log('2. Verify environment variables are set');
  console.log('3. Confirm database connection works');
  console.log('4. Review actual registration test results');
  console.log('\n💡 Next: Try registration with the form after reviewing results');
}

// === QUICK FIX FUNCTIONS ===
async function quickFixRegistration() {
  console.log('\n🛠️ QUICK REGISTRATION FIX');
  
  // Try to register the user from the form data
  const email = document.querySelector('input[type="email"]')?.value;
  const firstName = document.querySelector('input[name*="first"]')?.value || 
                   document.querySelector('input[placeholder*="First"]')?.value;
  const lastName = document.querySelector('input[name*="last"]')?.value ||
                  document.querySelector('input[placeholder*="Last"]')?.value;
  const password = document.querySelector('input[type="password"]')?.value;
  
  if (!email || !firstName || !lastName || !password) {
    console.log('❌ Please fill out the form first');
    return;
  }
  
  console.log('🔧 Attempting registration with form data...');
  console.log('- Email:', email);
  console.log('- Name:', firstName, lastName);
  
  try {
    const response = await fetch('/api/auth/register-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        affiliation: 'University',
        role: 'author'
      })
    });
    
    const result = await response.text();
    console.log('📊 Registration Result:');
    console.log('- Status:', response.status);
    console.log('- Response:', result);
    
    if (response.ok) {
      console.log('🎉 SUCCESS! User registered.');
      alert('Registration successful! You can now sign in.');
    } else {
      console.log('❌ FAILED:', result);
      alert('Registration failed: ' + result);
    }
    
  } catch (error) {
    console.log('❌ Quick fix error:', error.message);
  }
}

// === USAGE INSTRUCTIONS ===
console.log('\n📋 Available Commands:');
console.log('- debugRegistration() - Run comprehensive debug');
console.log('- quickFixRegistration() - Try to register using form data');

// Make functions globally available
window.regDebug = { debugRegistration, quickFixRegistration };