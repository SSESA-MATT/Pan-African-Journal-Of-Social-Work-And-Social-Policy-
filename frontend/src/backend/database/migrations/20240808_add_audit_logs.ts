import pool from '../../config/database';
import { auditLogsMigration } from '../../middleware/auditLogger';

/**
 * Run the audit logs migration
 */
const createAuditLogsTable = async () => {
  try {
    if (!pool) {
      throw new Error('Database pool not available');
    }
    console.log('Creating audit logs table...');
    await pool.query(auditLogsMigration);
    console.log('Audit logs table created successfully.');
  } catch (error) {
    console.error('Error creating audit logs table:', error);
  }
};

/**
 * Run database migrations
 */
const runMigration = async () => {
  try {
    await createAuditLogsTable();
    console.log('All security migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (pool) {
      pool.end();
    }
  }
};

// Execute migration if this file is run directly
if (require.main === module) {
  runMigration();
}

export { runMigration };
