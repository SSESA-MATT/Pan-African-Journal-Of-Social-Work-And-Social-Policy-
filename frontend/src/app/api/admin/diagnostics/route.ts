import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== Diagnostics API called ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      tests: {}
    };

    // Test 1: Check Supabase connection
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      diagnostics.tests.supabaseConnection = error ? 
        { status: 'error', message: error.message } : 
        { status: 'success', message: 'Connected' };
    } catch (error: any) {
      diagnostics.tests.supabaseConnection = { 
        status: 'error', 
        message: error.message 
      };
    }

    // Test 2: Check auth session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      diagnostics.tests.authSession = {
        status: session ? 'authenticated' : 'not_authenticated',
        userId: session?.user?.id || null,
        error: error?.message || null
      };
    } catch (error: any) {
      diagnostics.tests.authSession = { 
        status: 'error', 
        message: error.message 
      };
    }

    // Test 3: Check if submissions table exists
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('id')
        .limit(1);
      
      diagnostics.tests.submissionsTable = error ? 
        { status: 'error', message: error.message } : 
        { status: 'success', message: 'Table accessible' };
    } catch (error: any) {
      diagnostics.tests.submissionsTable = { 
        status: 'error', 
        message: error.message 
      };
    }

    // Test 4: Check if users table exists
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      diagnostics.tests.usersTable = error ? 
        { status: 'error', message: error.message } : 
        { status: 'success', message: 'Table accessible' };
    } catch (error: any) {
      diagnostics.tests.usersTable = { 
        status: 'error', 
        message: error.message 
      };
    }

    return NextResponse.json(diagnostics);

  } catch (error: any) {
    console.error('Diagnostics error:', error);
    return NextResponse.json({
      error: 'Diagnostics failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}