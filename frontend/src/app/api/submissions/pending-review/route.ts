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

    // Get pending reviews with submission details (select safe submission fields)
    const { data: pendingReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        status,
        assigned_date,
        reviewer_id,
        reviewer_email,
        reviewer_first_name,
        reviewer_last_name,
        submissions (
          id,
          title,
          abstract,
          author_id,
          status
        )
      `)
      .eq('status', 'pending')
      .order('assigned_date', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching pending reviews:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch pending reviews', details: reviewsError.message }, 
        { status: 500 }
      );
    }

    // Enrich nested submissions with author profile information
    try {
      const subs = (pendingReviews || []).flatMap((r: any) => (r.submissions || []).map((s: any) => s));
      const authorIds = Array.from(new Set(subs.map((s: any) => s.author_id).filter(Boolean)));
      if (authorIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, affiliation')
          .in('id', authorIds);
        if (!usersError && usersData) {
          const usersById = (usersData || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {} as Record<string, any>);
          (pendingReviews || []).forEach((r: any) => {
            if (Array.isArray(r.submissions)) {
              r.submissions = r.submissions.map((s: any) => ({
                ...s,
                author_first_name: usersById[s.author_id]?.first_name || null,
                author_last_name: usersById[s.author_id]?.last_name || null,
                author_email: usersById[s.author_id]?.email || null,
              }));
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to enrich pending review submissions with author profiles:', e);
    }

    return NextResponse.json(pendingReviews || []);

  } catch (error) {
    console.error('Pending reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}