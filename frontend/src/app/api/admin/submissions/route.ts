import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
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
    console.log('=== ADMIN SUBMISSIONS API ===');
    
    // Use cookie-based auth for production compatibility
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
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

    // Get submissions using appropriate client
    const { data: submissions, error: submissionsError } = await clientToUse
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
      `)
      .order('created_at', { ascending: false });

    if (submissionsError) {
      console.error('Submissions error:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch submissions', details: submissionsError.message }, 
        { status: 500 }
      );
    }

    console.log('Found submissions:', submissions?.length || 0);

    return NextResponse.json(submissions || []);

  } catch (error) {
    console.error('Admin submissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}