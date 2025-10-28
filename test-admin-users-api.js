const { createClient } = require('@supabase/supabase-js');

// Test the admin users API endpoint
async function testAdminUsersAPI() {
  console.log('=== Testing Admin Users API ===');
  
  try {
    // Test the API endpoint directly
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response data:', {
        totalUsers: data.users?.length || 0,
        syncedUsers: data.synced || 0,
        userRoles: data.users?.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}) || {}
      });
      
      // Show first few users
      if (data.users && data.users.length > 0) {
        console.log('\nFirst few users:');
        data.users.slice(0, 3).forEach(user => {
          console.log(`- ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
        });
      }
    } else {
      const errorData = await response.json();
      console.error('API Error:', errorData);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test Supabase auth users directly
async function testSupabaseAuthUsers() {
  console.log('\n=== Testing Supabase Auth Users ===');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';
    
    if (!supabaseServiceKey || supabaseServiceKey === 'your-service-key') {
      console.log('Skipping Supabase test - no service key configured');
      return;
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    console.log(`Found ${authUsers.users.length} users in auth.users table`);
    
    // Show user details
    authUsers.users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id.substring(0, 8)}...) - Confirmed: ${!!user.email_confirmed_at}`);
    });
    
  } catch (error) {
    console.error('Supabase test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testSupabaseAuthUsers();
  await testAdminUsersAPI();
}

runTests();