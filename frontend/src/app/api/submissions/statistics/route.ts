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

    // Get user role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || !['admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }

    // Get submission statistics
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('status');

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const statistics = {
      total: submissions?.length || 0,
      submitted: submissions?.filter(s => s.status === 'submitted').length || 0,
      under_review: submissions?.filter(s => s.status === 'under_review').length || 0,
      peer_review: submissions?.filter(s => s.status === 'peer_review').length || 0,
      revisions_required: submissions?.filter(s => s.status === 'revisions_required').length || 0,
      accepted: submissions?.filter(s => s.status === 'accepted').length || 0,
      rejected: submissions?.filter(s => s.status === 'rejected').length || 0,
      published: submissions?.filter(s => s.status === 'published').length || 0
    };

    return NextResponse.json({ statistics });

  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}