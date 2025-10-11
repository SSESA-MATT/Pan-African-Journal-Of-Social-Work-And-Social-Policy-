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

    // Get pending reviews with submission details
    const { data: pendingReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        status,
        review_deadline,
        assigned_date,
        reviewer_id,
        reviewer_email,
        reviewer_first_name,
        reviewer_last_name,
        submissions (
          id,
          title,
          abstract,
          author_first_name,
          author_last_name,
          author_email,
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

    return NextResponse.json(pendingReviews || []);

  } catch (error) {
    console.error('Pending reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}