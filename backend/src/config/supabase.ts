import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Provide a tolerant supabase export so tests and local dev can run without a full
// Supabase configuration. In production/staging the env vars should be set and a
// real client will be created. When the vars are missing we export null stubs and
// log a warning instead of exiting the process.
let supabase: any = null;
let supabaseAnon: any = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );

  if (process.env.SUPABASE_ANON_KEY) {
    supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  }

  console.log('✅ Connected to Supabase database');
} else {
  console.warn('⚠️  Supabase config missing - continuing without Supabase client (test/local mode)');
}

export { supabase, supabaseAnon };
export default supabase;
