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

    // Get submissions using appropriate client (select safe fields)
    const { data: submissions, error: submissionsError } = await clientToUse
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        status,
        author_id,
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

    // Enrich with author profiles when possible
    try {
      const authorIds = Array.from(new Set((submissions || []).map((s: any) => s.author_id).filter(Boolean)));
      if (authorIds.length > 0) {
        const { data: usersData, error: usersError } = await clientToUse
          .from('users')
          .select('id, first_name, last_name, email, affiliation')
          .in('id', authorIds);
        if (!usersError && usersData) {
          const usersById = (usersData || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {} as Record<string, any>);
          const enriched = (submissions || []).map((s: any) => ({
            ...s,
            author_first_name: usersById[s.author_id]?.first_name || null,
            author_last_name: usersById[s.author_id]?.last_name || null,
            author_email: usersById[s.author_id]?.email || null,
            author_affiliation: usersById[s.author_id]?.affiliation || null,
          }));
          console.log('Found submissions:', enriched.length || 0);
          return NextResponse.json({ submissions: enriched || [] });
        }
      }
    } catch (e) {
      console.warn('Failed to enrich admin submissions with authors:', e);
    }

  console.log('Found submissions:', submissions?.length || 0);
  return NextResponse.json({ submissions: submissions || [] });

  } catch (error) {
    console.error('Admin submissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}