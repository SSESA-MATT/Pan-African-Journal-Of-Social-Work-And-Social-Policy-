import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== DATABASE TEST ENDPOINT ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Test 1: Check if we can connect to Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Test 2: Check if submissions table exists and has proper structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('submissions')
      .select('*')
      .limit(1);
    
    // Test 3: Check if user is authenticated for table access
    let userTestResult = null;
    if (session) {
      const { data: userSubmissions, error: userError } = await supabase
        .from('submissions')
        .select('id, title, status')
        .eq('author_id', session.user.id)
        .limit(5);
      
      userTestResult = {
        error: userError?.message || null,
        count: userSubmissions?.length || 0,
        data: userSubmissions || []
      };
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        error: sessionError?.message || null
      },
      database: {
        tableExists: !tableError,
        tableError: tableError?.message || null,
        sampleData: tableInfo || null
      },
      userAccess: userTestResult,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
      }
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: 'Database test failed', 
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}