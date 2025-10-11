// 🚀 QUICK ADMIN FIX SCRIPT
// Run this in browser console to immediately fix your admin access

console.log('🚀 QUICK ADMIN ACCESS FIX');
console.log('=========================');

async function quickAdminFix() {
  console.log('🔍 Step 1: Check your current email...');
  
  // Your email from the console output
  const yourEmail = 'ssesangamatthew24@gmail.com';
  console.log(`📧 Working with email: ${yourEmail}`);
  
  console.log('\n🔧 Step 2: Updating your localStorage role...');
  
  // Get current stored user
  const storedUser = localStorage.getItem('africa_journal_user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      console.log('Current stored role:', userData.role);
      
      // Update role to admin
      userData.role = 'admin';
      localStorage.setItem('africa_journal_user', JSON.stringify(userData));
      
      console.log('✅ Updated localStorage role to admin');
      console.log('Updated user data:', userData);
      
      // Verify the change
      const verifyUser = JSON.parse(localStorage.getItem('africa_journal_user'));
      console.log('✅ Verified new role:', verifyUser.role);
      
      console.log('\n🎉 SUCCESS! Your browser now knows you are an admin.');
      console.log('🔄 Refreshing page to apply changes...');
      
      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error updating user data:', error);
    }
  } else {
    console.log('❌ No stored user data found');
  }
}

// Also provide database update query
console.log('\n💾 ALSO RUN THIS IN SUPABASE SQL EDITOR:');
console.log('=====================================');
console.log(`UPDATE users SET role = 'admin' WHERE email = 'ssesangamatthew24@gmail.com';`);
console.log(`SELECT email, role FROM users WHERE email = 'ssesangamatthew24@gmail.com';`);

// Run the fix
quickAdminFix();