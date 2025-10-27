import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Migration {
  id: string;
  filename: string;
  executed_at: string;
}

class MigrationRunner {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
  }

  async ensureMigrationsTable(): Promise<void> {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS migrations (
          id VARCHAR(255) PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (error) {
      console.error('Error creating migrations table:', error);
      throw error;
    }
  }

  async getExecutedMigrations(): Promise<Migration[]> {
    const { data, error } = await supabase
      .from('migrations')
      .select('*')
      .order('executed_at', { ascending: true });

    if (error) {
      console.error('Error fetching executed migrations:', error);
      throw error;
    }

    return data || [];
  }

  async executeMigration(filename: string): Promise<void> {
    const migrationPath = path.join(this.migrationsPath, filename);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${filename}`);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    const migrationId = filename.replace('.sql', '');

    console.log(`Executing migration: ${filename}`);

    try {
      // Execute the migration SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
      
      if (sqlError) {
        console.error(`Error executing migration ${filename}:`, sqlError);
        throw sqlError;
      }

      // Record the migration as executed
      const { error: insertError } = await supabase
        .from('migrations')
        .insert({
          id: migrationId,
          filename: filename,
          executed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`Error recording migration ${filename}:`, insertError);
        throw insertError;
      }

      console.log(`✅ Migration ${filename} executed successfully`);
    } catch (error) {
      console.error(`❌ Migration ${filename} failed:`, error);
      throw error;
    }
  }

  async rollbackMigration(filename: string): Promise<void> {
    const rollbackFilename = filename.replace('.sql', '_rollback.sql');
    const rollbackPath = path.join(this.migrationsPath, rollbackFilename);
    
    if (!fs.existsSync(rollbackPath)) {
      throw new Error(`Rollback file not found: ${rollbackFilename}`);
    }

    const sql = fs.readFileSync(rollbackPath, 'utf8');
    const migrationId = filename.replace('.sql', '');

    console.log(`Rolling back migration: ${filename}`);

    try {
      // Execute the rollback SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
      
      if (sqlError) {
        console.error(`Error rolling back migration ${filename}:`, sqlError);
        throw sqlError;
      }

      // Remove the migration record
      const { error: deleteError } = await supabase
        .from('migrations')
        .delete()
        .eq('id', migrationId);

      if (deleteError) {
        console.error(`Error removing migration record ${filename}:`, deleteError);
        throw deleteError;
      }

      console.log(`✅ Migration ${filename} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Rollback ${filename} failed:`, error);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      await this.ensureMigrationsTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const executedIds = new Set(executedMigrations.map(m => m.id));

      // Get all migration files
      const migrationFiles = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql') && !file.includes('_rollback'))
        .sort();

      console.log(`Found ${migrationFiles.length} migration files`);
      console.log(`${executedMigrations.length} migrations already executed`);

      let executedCount = 0;

      for (const filename of migrationFiles) {
        const migrationId = filename.replace('.sql', '');
        
        if (!executedIds.has(migrationId)) {
          await this.executeMigration(filename);
          executedCount++;
        } else {
          console.log(`⏭️  Skipping already executed migration: ${filename}`);
        }
      }

      if (executedCount === 0) {
        console.log('✅ All migrations are up to date');
      } else {
        console.log(`✅ Executed ${executedCount} new migrations`);
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  async rollbackLastMigration(): Promise<void> {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      
      if (executedMigrations.length === 0) {
        console.log('No migrations to rollback');
        return;
      }

      const lastMigration = executedMigrations[executedMigrations.length - 1];
      await this.rollbackMigration(lastMigration.filename);
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    }
  }

  async showStatus(): Promise<void> {
    try {
      await this.ensureMigrationsTable();
      const executedMigrations = await this.getExecutedMigrations();
      
      console.log('\n📊 Migration Status:');
      console.log('==================');
      
      if (executedMigrations.length === 0) {
        console.log('No migrations executed yet');
        return;
      }

      executedMigrations.forEach((migration, index) => {
        console.log(`${index + 1}. ${migration.filename} (executed: ${migration.executed_at})`);
      });
    } catch (error) {
      console.error('❌ Error showing status:', error);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const migrationRunner = new MigrationRunner();

  switch (command) {
    case 'up':
      await migrationRunner.runMigrations();
      break;
    case 'down':
      await migrationRunner.rollbackLastMigration();
      break;
    case 'status':
      await migrationRunner.showStatus();
      break;
    default:
      console.log('Usage: npm run migrate [up|down|status]');
      console.log('  up     - Run pending migrations');
      console.log('  down   - Rollback last migration');
      console.log('  status - Show migration status');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { MigrationRunner };