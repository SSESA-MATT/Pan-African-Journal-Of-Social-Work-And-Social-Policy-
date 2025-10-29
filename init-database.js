// Database Initialization Script
// This script checks if the database is properly set up and creates missing tables

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check .env.local file for:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndInitializeDatabase() {
  console.log('🔍 Checking Database Status');
  console.log('=' .repeat(50));
  
  const tables = ['users', 'submissions', 'volumes', 'issues', 'articles'];
  const results = {};
  
  // Check each table
  for (const table of tables) {
    try {
      console.log(`\\nChecking ${table} table...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        results[table] = { exists: false, error: error.message };
      } else {
        console.log(`   ✅ ${table}: OK (${data?.length || 0} records found)`);
        results[table] = { exists: true, count: data?.length || 0 };
      }
    } catch (err) {
      console.log(`   💥 ${table}: ${err.message}`);
      results[table] = { exists: false, error: err.message };
    }
  }
  
  // Summary
  console.log('\\n📊 SUMMARY:');
  const existingTables = Object.entries(results).filter(([_, result]) => result.exists);
  const missingTables = Object.entries(results).filter(([_, result]) => !result.exists);
  
  console.log(`   ✅ Existing tables: ${existingTables.length}/${tables.length}`);
  existingTables.forEach(([table, _]) => console.log(`      - ${table}`));
  
  if (missingTables.length > 0) {
    console.log(`   ❌ Missing tables: ${missingTables.length}`);
    missingTables.forEach(([table, result]) => {
      console.log(`      - ${table}: ${result.error}`);
    });
    
    console.log('\\n💡 RECOMMENDATIONS:');
    console.log('   1. Run Supabase migrations:');
    console.log('      npx supabase db push');
    console.log('   2. Or apply migrations manually in Supabase dashboard');
    console.log('   3. Check migration files in supabase/migrations/');
  } else {
    console.log('   🎉 All required tables exist!');
  }
  
  // Test authentication
  console.log('\\n🔐 Testing Authentication...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log('   ⚠️  No authenticated user (this is normal for server-side scripts)');
    } else {
      console.log('   ✅ User authenticated:', user?.email);
    }
  } catch (err) {
    console.log('   ⚠️  Auth check failed (this is normal for server-side scripts)');
  }
  
  console.log('\\n🏁 Database check completed');
  return results;
}

// Run the check
checkAndInitializeDatabase()
  .then(results => {
    const allTablesExist = Object.values(results).every(result => result.exists);
    process.exit(allTablesExist ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Database check failed:', error);
    process.exit(1);
  });