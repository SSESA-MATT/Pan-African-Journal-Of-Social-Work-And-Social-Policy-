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

// This file proxies the same logic as /api/reviews/dashboard so the nested
// path /reviewer/dashboard/api/reviews/dashboard works on deployed sites
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;

    // Try assigned-only RPC first
    const debug = request.nextUrl?.searchParams?.get('debug') === 'true';
    const debugInfo: Record<string, any> = {};
    let pendingReviews: any[] = [];
    let hasRealData = false;

    try {
      const { data: assignedSubmissions, error: assignedError } = await supabase
        .rpc('get_submissions_for_reviewer', { reviewer_user_id: userId });
      debugInfo.assignedError = assignedError ? ((assignedError as any).message || assignedError) : null;

      if (!assignedError && assignedSubmissions && assignedSubmissions.length > 0) {
        hasRealData = true;
        pendingReviews = assignedSubmissions.map((s: any) => ({
          id: `real-${s.id}`,
          submission_id: s.id,
          title: s.title,
          abstract: s.abstract,
          status: s.review_status || 'pending',
          submitted_at: s.submission_date || s.created_at,
        }));
      }
    } catch (err: any) {
      debugInfo.realDataError = err?.message || String(err);
    }

    const dashboardData = {
      pendingReviews,
      completedReviews: [],
      reviewStats: { pendingCount: pendingReviews.length },
      dataSource: hasRealData ? 'database' : 'mock',
      message: hasRealData ? `Showing ${pendingReviews.length} real submissions available for review` : 'Showing demo data - real submissions will appear when authors submit manuscripts',
      debugInfo: debug ? debugInfo : undefined
    };

    return NextResponse.json(dashboardData, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500, headers: corsHeaders() });
  }
}
