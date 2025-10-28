// Simple test to check if users are being synced properly
async function testUsersSync() {
  console.log('=== Testing Users Sync ===');
  
  try {
    // Test the users/all endpoint which should sync users
    const response = await fetch('http://localhost:3004/api/users/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const users = await response.json();
      console.log(`Success! Found ${users.length} users`);
      
      // Show user roles breakdown
      const roleBreakdown = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Role breakdown:', roleBreakdown);
      
      // Show first few users
      if (users.length > 0) {
        console.log('\nFirst few users:');
        users.slice(0, 3).forEach(user => {
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

testUsersSync();