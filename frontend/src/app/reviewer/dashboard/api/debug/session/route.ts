import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;

    // Count pending reviews for this reviewer
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id,status')
      .eq('reviewer_id', userId)
      .limit(100);

    return NextResponse.json(
      {
        sessionUserId: userId,
        pendingReviewsCount: Array.isArray(reviews) ? reviews.length : 0,
        reviews: reviews || [],
        session: { user: { id: userId, email: session.user.email } }
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500, headers: corsHeaders() });
  }
}
