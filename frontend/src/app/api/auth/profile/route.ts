import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Get user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // Fallback to auth user metadata if profile doesn't exist
      const userData = {
        id: user.id,
        email: user.email!,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        affiliation: user.user_metadata?.affiliation || '',
        role: user.user_metadata?.role || 'author',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({ user: userData }, { headers: corsHeaders() });
    }

    // Return user profile data
    const userData = {
      id: userProfile.id,
      email: userProfile.email,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      affiliation: userProfile.affiliation || '',
      role: userProfile.role,
      created_at: userProfile.created_at || new Date().toISOString(),
      updated_at: userProfile.updated_at || new Date().toISOString()
    };

    return NextResponse.json({ user: userData }, { headers: corsHeaders() });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
