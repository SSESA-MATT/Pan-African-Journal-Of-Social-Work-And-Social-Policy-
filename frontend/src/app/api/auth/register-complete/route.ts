import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, affiliation, role } = body;

    console.log('Complete registration attempt:', { email, first_name, last_name, role });

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Step 1: Create user with Supabase Auth (EMAIL CONFIRMATION REQUIRED)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        }
      }
    });

    if (authError) {
      console.error('Supabase registration error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('User created, confirmation email sent:', authData.user.email);

    // Step 2: Create user profile in our users table (will be activated after email confirmation)
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: authData.user.email,
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway - profile can be created later
    }

    // Return success - user needs to confirm email
    return NextResponse.json({
      message: 'Registration successful! Please check your email to confirm your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        first_name,
        last_name,
        affiliation: affiliation || '',
        role: role || 'author',
        email_confirmed: false
      },
      emailSent: true,
      needsEmailConfirmation: true
    });

  } catch (error) {
    console.error('Complete registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
