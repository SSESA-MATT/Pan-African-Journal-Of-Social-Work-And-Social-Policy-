import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Use service role key for admin operations (bypasses RLS) - fallback to regular client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : null;

export async function GET(request: NextRequest) {
  try {
    console.log('Statistics API error:');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.email);

    // Check user role - use admin client if available, otherwise regular client
    const clientToUse = supabaseAdmin || supabase;
    const { data: userProfile, error: profileError } = await clientToUse
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    if (!['admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }

    console.log('User role verified:', userProfile.role);

    // Get submission statistics using appropriate client
    const { data: submissions, error: submissionsError } = await clientToUse
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