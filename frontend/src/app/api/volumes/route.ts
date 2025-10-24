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

    // Get all volumes with issue counts
    const { data: volumes, error: volumesError } = await supabase
      .from('volumes')
      .select(`
        id,
        volume_number,
        year,
        title,
        description,
        created_at,
        updated_at,
        issues (
          id,
          issue_number,
          title,
          publication_date
        )
      `)
      .order('year', { ascending: false })
      .order('volume_number', { ascending: false });

    if (volumesError) {
      console.error('Error fetching volumes:', volumesError);
      const debug = request.headers.get('x-debug') === '1';
      return NextResponse.json(
        { error: 'Failed to fetch volumes', details: debug ? volumesError.message : 'Query failed' }, 
        { status: 500 }
      );
    }

    return NextResponse.json(volumes || []);

  } catch (error) {
    console.error('Volumes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Create new volume
    const { data: volume, error: createError } = await supabase
      .from('volumes')
      .insert([{
        volume_number: body.volume_number,
        year: body.year,
        title: body.title,
        description: body.description || ''
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating volume:', createError);
      return NextResponse.json(
        { error: 'Failed to create volume', details: createError.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json(volume, { status: 201 });

  } catch (error) {
    console.error('Create volume API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}