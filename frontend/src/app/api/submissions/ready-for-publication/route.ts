import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get submissions ready for publication (accepted status) - select safe fields
    const { data: readySubmissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        author_id,
        status,
        submission_date,
        created_at,
        updated_at
      `)
      .eq('status', 'accepted')
      .order('updated_at', { ascending: false });

    if (submissionsError) {
      console.error('Error fetching ready submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch ready submissions', details: submissionsError.message }, 
        { status: 500 }
      );
    }

    // Enrich with author profiles
    try {
      const authorIds = Array.from(new Set((readySubmissions || []).map((s: any) => s.author_id).filter(Boolean)));
      if (authorIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, affiliation')
          .in('id', authorIds);
        if (!usersError && usersData) {
          const usersById = (usersData || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {} as Record<string, any>);
          const enriched = (readySubmissions || []).map((s: any) => ({
            ...s,
            author_first_name: usersById[s.author_id]?.first_name || null,
            author_last_name: usersById[s.author_id]?.last_name || null,
            author_email: usersById[s.author_id]?.email || null,
            author_affiliation: usersById[s.author_id]?.affiliation || null,
          }));
          return NextResponse.json(enriched || []);
        }
      }
    } catch (e) {
      console.warn('Failed to enrich ready submissions with authors:', e);
    }

    return NextResponse.json(readySubmissions || []);

  } catch (error) {
    console.error('Ready for publication API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}