import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log('=== SIMPLE SUBMISSIONS API ===');
    
    // Try multiple authentication methods
    let user = null;
    let authMethod = '';
    
    // Method 1: Try getSession (cookies)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        user = session.user;
        authMethod = 'session';
        console.log('✅ Authenticated via session/cookies');
      }
    } catch (e) {
      console.log('Session auth failed:', e);
    }
    
    // Method 2: Try getUser if session failed
    if (!user) {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          user = authUser;
          authMethod = 'getUser';
          console.log('✅ Authenticated via getUser');
        }
      } catch (e) {
        console.log('getUser auth failed:', e);
      }
    }
    
    // Method 3: Check Authorization header
    if (!user) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        console.log('Found Bearer token, proceeding without full auth check');
        authMethod = 'bearer';
        // For testing, we'll skip user validation and just return data
      }
    }
    
    if (!user && authMethod !== 'bearer') {
      return NextResponse.json(
        { error: 'Not authenticated', method: 'none' }, 
        { status: 401 }
      );
    }
    
    console.log('Auth method:', authMethod);
    if (user) console.log('User email:', user.email);
    
    // Get submissions directly (skip role check for testing)
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        status,
        author_first_name,
        author_last_name,
        author_email,
        submission_date,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10); // Limit for testing
    
    if (submissionsError) {
      console.error('Database error:', submissionsError);
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: submissionsError.message,
          code: submissionsError.code 
        }, 
        { status: 500 }
      );
    }
    
    console.log('Found submissions:', submissions?.length || 0);
    
    return NextResponse.json({
      submissions: submissions || [],
      count: submissions?.length || 0,
      authMethod,
      user: user ? { email: user.email, id: user.id } : null
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}