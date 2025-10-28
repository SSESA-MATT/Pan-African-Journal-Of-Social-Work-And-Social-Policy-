#!/usr/bin/env node

/**
 * Quick Database Test
 * Tests basic database connectivity and table existence
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://llegefrltmrwehuzrbyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZWdlZnJsdG1yd2VodXpyYnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY2MTMwMCwiZXhwIjoyMDcwMjM3MzAwfQ.Y-ElwQGg_x09x72YVXACZ45i6gRiRjdcVPS8F7UWDyU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseTables() {
  console.log('🔍 Testing Database Tables...');
  
  const tables = [
    'users',
    'submissions', 
    'articles',
    'reviews',
    'reviewer_assignments',
    'issues',
    'volumes'
  ];
  
  for (const table of tables) {
    try {
      console.log(`\\n📋 Testing table: ${table}`);
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Table exists with ${count || 0} records`);
      }
      
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
  }
}

async function testBasicOperations() {
  console.log('\\n🔧 Testing Basic Operations...');
  
  try {
    // Test 1: Check if we can query users table
    console.log('\\n👤 Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);
    
    if (usersError) {
      console.log(`   ❌ Users query error: ${usersError.message}`);
    } else {
      console.log(`   ✅ Found ${users.length} users`);
      users.forEach(user => {
        console.log(`      - ${user.email} (${user.role})`);
      });
    }
    
    // Test 2: Check submissions table
    console.log('\\n📝 Testing submissions table...');
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('id, title, status, created_at')
      .limit(5);
    
    if (submissionsError) {
      console.log(`   ❌ Submissions query error: ${submissionsError.message}`);
    } else {
      console.log(`   ✅ Found ${submissions.length} submissions`);
      submissions.forEach(sub => {
        console.log(`      - "${sub.title}" (${sub.status})`);
      });
    }
    
    // Test 3: Check articles table
    console.log('\\n📚 Testing articles table...');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, published_at')
      .limit(5);
    
    if (articlesError) {
      console.log(`   ❌ Articles query error: ${articlesError.message}`);
    } else {
      console.log(`   ✅ Found ${articles.length} articles`);
      articles.forEach(article => {
        console.log(`      - "${article.title}" (${article.published_at || 'Not published'})`);
      });
    }
    
  } catch (error) {
    console.log(`   ❌ General error: ${error.message}`);
  }
}

async function runQuickTest() {
  console.log('🚀 Quick Database Test');
  console.log('=====================');
  
  await testDatabaseTables();
  await testBasicOperations();
  
  console.log('\\n✅ Database test completed!');
}

runQuickTest().catch(console.error);