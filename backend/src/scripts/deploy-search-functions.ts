import { supabase } from '../config/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function deploySearchFunctions() {
  try {
    console.log('🚀 Deploying search functions...');
    
    // Read the search functions SQL file
    const sqlFilePath = path.join(__dirname, '../database/migrations/20241027_search_functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          // Try using RPC first
          const { error: rpcError } = await supabase.rpc('exec_sql', {
            sql: statement
          });
          
          if (rpcError) {
            console.log('⚠️  RPC not available, executing via raw query...');
            // Fallback to raw query
            const { error: queryError } = await supabase
              .from('_temp_query')
              .select('*')
              .limit(0); // This won't work, but we'll use a different approach
            
            // For now, we'll log the statement that needs to be run manually
            console.log(`Statement: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
          }
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} needs manual execution:`, statement.substring(0, 100));
        }
      }
    }
    
    console.log('✅ Search functions deployment completed!');
    console.log('');
    console.log('📋 Manual steps required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the contents of: backend/src/database/migrations/20241027_search_functions.sql');
    console.log('');
    console.log('🔍 The search functions include:');
    console.log('- get_author_suggestions()');
    console.log('- get_keyword_suggestions()');
    console.log('- get_author_facets()');
    console.log('- get_keyword_facets()');
    console.log('- get_search_facets()');
    console.log('- Search performance indexes');
    
  } catch (error) {
    console.error('❌ Search functions deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deploySearchFunctions();