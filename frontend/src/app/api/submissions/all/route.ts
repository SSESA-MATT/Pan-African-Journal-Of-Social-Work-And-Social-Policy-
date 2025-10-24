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

interface SubmissionData {
  id: string;
  title: string;
  abstract: string;
  status: string;
  author_first_name: string;
  author_last_name: string;
  author_email: string;
  author_affiliation: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data?: SubmissionData[];
  error?: string;
  details?: string;
  count?: number;
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse | SubmissionData[]>> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log('=== SUBMISSIONS ALL API START ===');
    
    // Get authenticated session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({
        error: 'Authentication failed',
        details: sessionError.message
      }, { status: 401 });
    }

    if (!session?.user) {
      console.log('No authenticated user found');
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 });
    }

    console.log('Authenticated user:', session.user.email);

    // Check user role - prefer admin client for checks when available
    const clientToUse = supabaseAdmin || supabase;
    console.log('Admin client available:', !!supabaseAdmin);

    let userProfile: any = null;
    let profileError: any = null;

    try {
      const profileRes = await clientToUse
        .from('users')
        .select('id, role, email')
        .eq('id', session.user.id)
        .single();
      userProfile = profileRes.data;
      profileError = profileRes.error;
    } catch (e) {
      profileError = e;
    }

    // If profile lookup failed using the initial client, and we have an admin client, try with it
    if (profileError && supabaseAdmin) {
      try {
        console.warn('Profile lookup failed with primary client, trying admin client');
        const adminProfile = await supabaseAdmin
          .from('users')
          .select('id, role, email')
          .eq('id', session.user.id)
          .single();
        userProfile = adminProfile.data;
        profileError = adminProfile.error;
      } catch (e) {
        profileError = e;
      }
    }

    if (profileError || !userProfile) {
      console.error('User profile error:', profileError);
      const debug = request.headers.get('x-debug') === '1';
      return NextResponse.json({
        error: 'User profile not found',
        details: debug ? (profileError?.message || String(profileError)) : 'Profile lookup failed'
      }, { status: 403 });
    }

    console.log('User profile found:', { role: userProfile.role, email: userProfile.email });

    // Check if user has admin permissions
    if (userProfile.role !== 'admin' && userProfile.role !== 'editor') {
      console.log('Access denied - insufficient permissions');
      return NextResponse.json({
        error: 'Insufficient permissions',
        details: 'Admin or editor role required'
      }, { status: 403 });
    }

    // Fetch all submissions with proper error handling using appropriate client
    const { data: submissions, error: submissionsError, count } = await clientToUse
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        status,
        author_first_name,
        author_last_name,
        author_email,
        author_affiliation,
        submission_date,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (submissionsError) {
      console.error('Database error fetching submissions:', submissionsError);
      const debug = request.headers.get('x-debug') === '1';
      return NextResponse.json({
        error: 'Database query failed',
        details: debug ? submissionsError.message : 'Query failed'
      }, { status: 500 });
    }

    console.log(`Successfully fetched ${submissions?.length || 0} submissions`);
    console.log('=== SUBMISSIONS ALL API END ===');

    return NextResponse.json(submissions || []);

  } catch (error: unknown) {
    console.error('Unexpected error in submissions API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred'
    }, { status: 500 });
  }
}