import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface AuthDebugResponse {
  session?: any;
  user?: any;
  profile?: any;
  authentication?: string;
  error?: string;
  details?: string;
  method?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<AuthDebugResponse>> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log('=== AUTH DEBUG START ===');
    
    // Method 1: Try getSession first (more reliable with cookies)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session data:', sessionData);
    console.log('Session error:', sessionError);
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({
        error: 'Session error',
        details: sessionError.message,
        method: 'getSession'
      }, { status: 401 });
    }

    if (!sessionData.session) {
      console.log('No session found');
      return NextResponse.json({
        error: 'No session found',
        method: 'getSession'
      }, { status: 401 });
    }

    // Method 2: Also try getUser
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('User data:', userData);
    console.log('User error:', userError);

    // Get user profile from database
    let userProfile = null;
    if (sessionData.session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();
      
      console.log('Profile data:', profile);
      console.log('Profile error:', profileError);
      userProfile = profile;
    }

    console.log('=== AUTH DEBUG END ===');

    return NextResponse.json({
      session: sessionData.session,
      user: userData.user,
      profile: userProfile,
      authentication: 'success'
    });

  } catch (error: unknown) {
    console.error('Auth debug error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: errorMessage,
      debugInfo: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    }, { status: 500 });
  }
}