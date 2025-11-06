import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Provide a tolerant supabase export so tests and local dev can run without a full
// Supabase configuration. In production/staging the env vars should be set and a
// real client will be created. When the vars are missing we export null stubs and
// log a warning instead of exiting the process.
// Always export a Supabase client instance to satisfy TypeScript at compile-time.
// In local/test mode we create a client with safe dummy values so repositories
// can import and use the client APIs without the codebase needing to be
// null-checked all over. Network calls will only happen when repository
// methods are invoked; for tests we primarily rely on the local Postgres pool.
let supabase: any;
let supabaseAnon: any;

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'dummy_service_key';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'dummy_anon_key';

supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠️  Supabase config missing - created dummy Supabase client for local/test mode');
} else {
  console.log('✅ Connected to Supabase database');
}

export { supabase, supabaseAnon };
export default supabase;
