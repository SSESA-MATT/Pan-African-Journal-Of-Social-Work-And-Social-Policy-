import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== AUTH DEBUG ENDPOINT ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session error:', sessionError);
    console.log('Session exists:', !!session);
    console.log('Session user ID:', session?.user?.id);
    console.log('Session user email:', session?.user?.email);
    
    // Also check user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('User error:', userError);
    console.log('User exists:', !!user);
    console.log('User ID:', user?.id);
    console.log('User email:', user?.email);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        error: sessionError?.message || null
      },
      user: {
        exists: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        error: userError?.message || null
      },
      cookies: request.headers.get('cookie') ? 'Present' : 'Missing',
      userAgent: request.headers.get('user-agent')
    });
    
  } catch (error: any) {
    console.error('Auth debug error:', error);
    return NextResponse.json({ 
      error: 'Auth debug failed', 
      details: error.message 
    }, { status: 500 });
  }
}