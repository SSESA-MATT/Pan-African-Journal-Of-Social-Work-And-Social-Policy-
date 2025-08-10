// Database utilities and exports
export { default as pool, db, supabase } from '../config/database';
export { migrationManager } from './migrations';
export { databaseSeeder } from './seeds';
export * from '../models/types';

import { migrationManager } from './migrations';
import { databaseSeeder } from './seeds';

/**
 * Initialize the database with schema and seed data
 */
export async function initializeDatabase(seedData: boolean = false): Promise<void> {
  console.log('🚀 Initializing database...');
  
  try {
    // Run migrations
    await migrationManager.runMigrations();
    
    // Optionally seed data
    if (seedData) {
      await databaseSeeder.seedDatabase();
    }
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Reset the database (clear and reseed)
 */
export async function resetDatabase(): Promise<void> {
  console.log('🔄 Resetting database...');
  
  try {
    await databaseSeeder.clearDatabase();
    await databaseSeeder.seedDatabase();
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}