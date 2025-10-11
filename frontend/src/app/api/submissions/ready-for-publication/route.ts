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

    // Get submissions ready for publication (accepted status)
    const { data: readySubmissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        author_first_name,
        author_last_name,
        author_email,
        author_affiliation,
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

    return NextResponse.json(readySubmissions || []);

  } catch (error) {
    console.error('Ready for publication API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}