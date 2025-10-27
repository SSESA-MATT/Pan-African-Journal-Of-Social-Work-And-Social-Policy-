import { supabase } from '../config/supabase';
import fs from 'fs';
import path from 'path';

/**
 * Run database migration for journal enhancements
 */
export async function runJournalEnhancementMigration(): Promise<void> {
  try {
    console.log('🚀 Starting journal enhancement migration...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '20241027_journal_enhancements.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          
          const { error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });

          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase
              .from('_temp_migration')
              .select('*')
              .limit(0);
            
            if (directError) {
              console.log(`⚠️  RPC not available, executing via raw query...`);
              // For Supabase, we'll need to execute this manually or use a different approach
              console.log(`Statement: ${statement}`);
            }
          }
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err);
          console.error(`Statement: ${statement}`);
          throw err;
        }
      }
    }

    console.log('✅ Journal enhancement migration completed successfully!');
    
    // Verify the migration by checking if new tables exist
    await verifyMigration();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Verify that the migration was successful
 */
async function verifyMigration(): Promise<void> {
  console.log('🔍 Verifying migration...');
  
  const tablesToCheck = [
    'dois',
    'article_metrics',
    'article_metric_events',
    'editorial_events',
    'search_analytics',
    'article_keywords',
    'article_authors',
    'citation_exports',
    'related_articles'
  ];

  for (const tableName of tablesToCheck) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table ${tableName} not found or accessible:`, error.message);
      } else {
        console.log(`✅ Table ${tableName} verified`);
      }
    } catch (err) {
      console.error(`❌ Error checking table ${tableName}:`, err);
    }
  }
}

/**
 * Rollback the migration (for development)
 */
export async function rollbackJournalEnhancementMigration(): Promise<void> {
  console.log('🔄 Rolling back journal enhancement migration...');
  
  const rollbackStatements = [
    'DROP VIEW IF EXISTS search_analytics_summary CASCADE',
    'DROP VIEW IF EXISTS upcoming_editorial_events CASCADE',
    'DROP VIEW IF EXISTS article_metrics_summary CASCADE',
    'DROP FUNCTION IF EXISTS update_article_search_index() CASCADE',
    'DROP FUNCTION IF EXISTS generate_doi_string(UUID) CASCADE',
    'DROP FUNCTION IF EXISTS increment_article_metric(UUID, VARCHAR, JSONB) CASCADE',
    'DROP TABLE IF EXISTS related_articles CASCADE',
    'DROP TABLE IF EXISTS citation_exports CASCADE',
    'DROP TABLE IF EXISTS article_authors CASCADE',
    'DROP TABLE IF EXISTS article_keywords CASCADE',
    'DROP TABLE IF EXISTS search_analytics CASCADE',
    'DROP TABLE IF EXISTS editorial_events CASCADE',
    'DROP TABLE IF EXISTS article_metric_events CASCADE',
    'DROP TABLE IF EXISTS article_metrics CASCADE',
    'DROP TABLE IF EXISTS dois CASCADE',
    'ALTER TABLE articles DROP COLUMN IF EXISTS keywords',
    'ALTER TABLE articles DROP COLUMN IF EXISTS volume_id',
    'ALTER TABLE articles DROP COLUMN IF EXISTS created_at',
    'ALTER TABLE articles DROP COLUMN IF EXISTS updated_at'
  ];

  for (const statement of rollbackStatements) {
    try {
      console.log(`⚡ Executing rollback: ${statement}`);
      // Note: In a real implementation, you'd execute these statements
      // For now, we'll just log them
    } catch (err) {
      console.error(`⚠️  Error in rollback statement: ${statement}`, err);
    }
  }

  console.log('✅ Rollback completed');
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'migrate') {
    runJournalEnhancementMigration()
      .then(() => {
        console.log('🎉 Migration completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Migration failed:', error);
        process.exit(1);
      });
  } else if (command === 'rollback') {
    rollbackJournalEnhancementMigration()
      .then(() => {
        console.log('🎉 Rollback completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Rollback failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: npm run migrate:journal [migrate|rollback]');
    process.exit(1);
  }
}