import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, affiliation, role } = body;

    console.log('Direct registration attempt:', { email, first_name, last_name, role });

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

    const supabase = createRouteHandlerClient({ cookies });

    // Create user with Supabase Auth - try without email confirmation first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        // Try to skip email confirmation by setting emailRedirectTo
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        }
      }
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      
      // Handle specific error cases  
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please try signing in instead.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: authError.message || 'Registration failed' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('Supabase Auth user created:', authData.user.id);

    // Try to create user profile in database (handle potential duplicate)
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email!,
            first_name,
            last_name,
            affiliation: affiliation || '',
            role: role || 'author',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error (might be expected if trigger exists):', profileError);
      } else {
        console.log('Profile created successfully:', profile);
      }
    } catch (profileErr) {
      console.log('Profile creation exception (continuing anyway):', profileErr);
    }

    // Return success response
    return NextResponse.json({
      message: authData.user.email_confirmed_at 
        ? 'Registration successful! You can now sign in.' 
        : 'Registration successful! Please check your email to confirm your account, or try signing in.',
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        first_name,
        last_name,
        affiliation: affiliation || '',
        role: role || 'author',
        email_confirmed: !!authData.user.email_confirmed_at
      },
      success: true,
      needsEmailConfirmation: !authData.user.email_confirmed_at
    });

  } catch (error) {
    console.error('Direct registration error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
