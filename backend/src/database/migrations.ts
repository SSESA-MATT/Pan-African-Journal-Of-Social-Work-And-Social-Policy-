import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import pool from '../config/database';

export interface Migration {
  id: string;
  name: string;
  sql: string;
  executed_at?: Date;
}

class MigrationManager {
  private pool: Pool;

  constructor(dbPool: Pool) {
    this.pool = dbPool;
  }

  /**
   * Create migrations table if it doesn't exist
   */
  async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.pool.query(createTableSQL);
  }

  /**
   * Get all executed migrations
   */
  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT id FROM migrations ORDER BY executed_at ASC'
    );
    return result.rows.map(row => row.id);
  }

  /**
   * Execute a single migration
   */
  async executeMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute the migration SQL
      await client.query(migration.sql);
      
      // Record the migration as executed
      await client.query(
        'INSERT INTO migrations (id, name) VALUES ($1, $2)',
        [migration.id, migration.name]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Migration ${migration.id} executed successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Migration ${migration.id} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    await this.createMigrationsTable();
    
    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = this.getMigrationFiles();
    
    for (const migrationFile of migrationFiles) {
      if (!executedMigrations.includes(migrationFile.id)) {
        await this.executeMigration(migrationFile);
      } else {
        console.log(`⏭️  Migration ${migrationFile.id} already executed`);
      }
    }
  }

  /**
   * Get all migration files from the migrations directory
   */
  private getMigrationFiles(): Migration[] {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      return [];
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const id = file.replace('.sql', '');
      
      return {
        id,
        name: file,
        sql
      };
    });
  }

  /**
   * Create initial schema migration
   */
  async createInitialMigration(): Promise<void> {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    const migrationPath = path.join(migrationsDir, '001_initial_schema.sql');
    fs.writeFileSync(migrationPath, schemaSQL);
    
    console.log('✅ Initial migration created at:', migrationPath);
  }
}

export const migrationManager = new MigrationManager(pool!);

// CLI interface for running migrations
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'create-initial':
      migrationManager.createInitialMigration()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Migration creation failed:', error);
          process.exit(1);
        });
      break;
      
    case 'run':
      migrationManager.runMigrations()
        .then(() => {
          console.log('🎉 All migrations completed successfully');
          process.exit(0);
        })
        .catch(error => {
          console.error('Migration failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: ts-node migrations.ts [create-initial|run]');
      process.exit(1);
  }
}