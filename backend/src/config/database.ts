import { Pool } from 'pg';
import { supabase } from './supabase';
import dotenv from 'dotenv';

dotenv.config();

// If a full DATABASE_URL isn't provided, but individual DB_* env vars are present,
// construct DATABASE_URL for compatibility with code that expects it.
if (!process.env.DATABASE_URL && (process.env.DB_HOST || process.env.DB_NAME || process.env.DB_USER)) {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'africa_journal';
  // encode credentials to be safe
  const encUser = encodeURIComponent(user);
  const encPassword = encodeURIComponent(password);
  process.env.DATABASE_URL = `postgresql://${encUser}:${encPassword}@${host}:${port}/${dbName}`;
  console.log('ℹ️ Constructed DATABASE_URL from DB_HOST/DB_USER/DB_NAME for local compatibility');
}

// Check if using Supabase or local PostgreSQL
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY;

let pool: Pool | null = null;

// Create a local Postgres pool when DB env vars are provided, or when Supabase is not used.
// This allows tests and the programmatic seeder to run against a local Postgres instance
// even if SUPABASE_* env vars are present (for example when dummy values are set).
if (!useSupabase || process.env.DB_HOST) {
  // Fallback to local PostgreSQL
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'africa_journal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    // Allow overriding the connection timeout via DB_CONN_TIMEOUT_MS for slow/containerized hosts
    connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT_MS || '10000'),
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