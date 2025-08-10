import { Pool } from 'pg';
import { supabase } from './supabase';
import dotenv from 'dotenv';

dotenv.config();

// Check if using Supabase or local PostgreSQL
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY;

let pool: Pool | null = null;

if (!useSupabase) {
  // Fallback to local PostgreSQL
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'africa_journal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test database connection
  pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
  });
}

// Export both for backwards compatibility
export default pool;
export { supabase };
export const db = useSupabase ? supabase : pool;

if (!db) {
  console.error('❌ No database configuration found. Please set up either Supabase or PostgreSQL credentials.');
  process.exit(1);
}