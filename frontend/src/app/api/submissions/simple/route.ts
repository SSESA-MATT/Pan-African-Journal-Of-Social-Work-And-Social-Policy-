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
    // Select safe fields and author_id (author profile lives in `users` table)
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        status,
        author_id,
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

    // Enrich submissions with author profiles fetched from users table
    let enriched = submissions || [];
    try {
      const authorIds = Array.from(new Set((enriched || []).map((s: any) => s.author_id).filter(Boolean)));
      if (authorIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, affiliation')
          .in('id', authorIds);

        if (usersError) {
          console.warn('Failed to fetch author profiles for simple submissions API:', usersError);
        } else {
          const usersById = (usersData || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {} as Record<string, any>);
          enriched = (enriched || []).map((sub: any) => ({
            ...sub,
            author_first_name: usersById[sub.author_id]?.first_name || null,
            author_last_name: usersById[sub.author_id]?.last_name || null,
            author_email: usersById[sub.author_id]?.email || null,
          }));
        }
      }
    } catch (e) {
      console.warn('Error enriching simple submissions with author profiles:', e);
    }

    return NextResponse.json({
      submissions: enriched,
      count: enriched?.length || 0,
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