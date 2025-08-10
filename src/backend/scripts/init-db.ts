#!/usr/bin/env ts-node

/**
 * Database initialization script
 * This script initializes the database with schema and seed data
 */

import { initializeDatabase } from '../database';

async function main() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // Initialize database with migrations and seed data
    await initializeDatabase(true);
    
    console.log('✅ Database initialization completed successfully!');
    console.log('');
    console.log('📊 Database is ready with:');
    console.log('  - Complete schema (Users, Submissions, Reviews, Articles, Issues, Volumes)');
    console.log('  - Sample users (admin, editor, authors, reviewers)');
    console.log('  - Sample volumes and issues');
    console.log('  - Sample submissions for testing');
    console.log('');
    console.log('🔑 Default login credentials:');
    console.log('  Admin: admin@africajournal.org / admin123');
    console.log('  Editor: editor@africajournal.org / editor123');
    console.log('  Author: author1@university.ac.ke / author123');
    console.log('  Reviewer: reviewer1@university.ac.ug / reviewer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}