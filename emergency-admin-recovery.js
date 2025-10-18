// 🚨 EMERGENCY ADMIN RECOVERY SCRIPT
// Use this when everything seems broken and you need to get admin access working

console.log('🚨 Emergency Admin Recovery Script Loaded');

// === EMERGENCY FIX 1: DIRECT SUPABASE ADMIN USER CREATION ===
async function emergencyCreateAdminUser() {
  console.log('\n🚨 EMERGENCY: Creating admin user directly...');
  
  const email = prompt('Enter admin email:') || 'ssesangamatthew24@gmail.com';
  const firstName = prompt('Enter first name:') || 'Mathew';
  const lastName = prompt('Enter last name:') || 'Ssesanga';
  
  try {
    const response = await fetch('/api/auth/register-instant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        password: 'AdminPassword123!',
        first_name: firstName,
        last_name: lastName,
        role: 'admin',
        affiliation: 'Makerere University'
      })
    });

    const result = await response.json();
    console.log('Emergency admin creation result:', result);
    
    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password: AdminPassword123!');
      console.log('🎯 Role: admin');
      
      // Redirect to login
      if (confirm('Admin user created! Redirect to login page?')) {
        window.location.href = '/login';
      }
      return true;
    } else {
      console.log('❌ Failed to create admin user:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Emergency admin creation error:', error);
    return false;
  }
}

// === EMERGENCY FIX 2: BYPASS RLS WITH SQL SCRIPT ===
function generateBypassRLSScript() {
  console.log('\n🚨 EMERGENCY: RLS Bypass SQL Script');
  console.log('Copy and run this in Supabase SQL Editor:');
  console.log('-'.repeat(50));
  
  const sqlScript = `
-- EMERGENCY RLS BYPASS FOR ADMIN ACCESS
-- Run this in Supabase SQL Editor

-- 1. Temporarily disable RLS on critical tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 2. Create or update admin user
INSERT INTO users (
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  affiliation,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'ssesangamatthew24@gmail.com' LIMIT 1),
  'ssesangamatthew24@gmail.com',
  'Mathew',
  'Ssesanga', 
  'admin',
  'Makerere University',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- 3. Verify admin user exists
SELECT id, email, role FROM users WHERE role = 'admin';

-- 4. Re-enable RLS (uncomment after testing)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
`;

  console.log(sqlScript);
  
  // Copy to clipboard if possible
  if (navigator.clipboard) {
    navigator.clipboard.writeText(sqlScript).then(() => {
      console.log('✅ SQL script copied to clipboard!');
    }).catch(() => {
      console.log('❌ Could not copy to clipboard - please copy manually');
    });
  }
}

// === EMERGENCY FIX 3: NUCLEAR OPTION - COMPLETE RESET ===
async function nuclearReset() {
  if (!confirm('🚨 NUCLEAR OPTION: This will clear all auth data and force complete reset. Continue?')) {
    return;
  }
  
  console.log('\n☢️ NUCLEAR RESET: Clearing everything...');
  
  try {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Force logout
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    
    console.log('✅ All data cleared');
    console.log('🔄 Redirecting to login...');
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    
  } catch (error) {
    console.log('❌ Nuclear reset error:', error);
  }
}

// === EMERGENCY COMMAND CENTER ===
console.log('\n🚨 EMERGENCY COMMAND CENTER');
console.log('='.repeat(50));
console.log('1. emergencyCreateAdminUser() - Force create admin user');
console.log('2. generateBypassRLSScript() - Get SQL to bypass RLS');
console.log('3. nuclearReset() - Clear everything and start over');
console.log('\n⚠️ Use these only when normal fixes fail!');

// Make functions globally available
window.emergency = {
  emergencyCreateAdminUser,
  generateBypassRLSScript,
  nuclearReset
};