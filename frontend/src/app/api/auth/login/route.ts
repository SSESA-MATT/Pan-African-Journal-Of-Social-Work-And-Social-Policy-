import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      );
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Fallback to auth user metadata if profile doesn't exist
      const user = {
        id: authData.user.id,
        email: authData.user.email!,
        first_name: authData.user.user_metadata?.first_name || '',
        last_name: authData.user.user_metadata?.last_name || '',
        affiliation: authData.user.user_metadata?.affiliation || '',
        role: authData.user.user_metadata?.role || 'author',
        created_at: authData.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        user,
        token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
      });
    }

    // Return success response with user data from profile
    const user = {
      id: userProfile.id,
      email: userProfile.email,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      affiliation: userProfile.affiliation || '',
      role: userProfile.role,
      created_at: userProfile.created_at || new Date().toISOString(),
      updated_at: userProfile.updated_at || new Date().toISOString()
    };

    return NextResponse.json({
      user,
      token: authData.session.access_token,
      refresh_token: authData.session.refresh_token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
