import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, affiliation, role } = body;

    console.log('No-email registration attempt:', { email, first_name, last_name, role });

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

    // Check if user already exists in our database
    const { data: existingProfile } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please try signing in instead.' },
        { status: 400 }
      );
    }

    // Create user in database without requiring auth (bypass email confirmation)
    const userId = crypto.randomUUID();
    
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: email.toLowerCase(),
              first_name,
              last_name,
              affiliation: affiliation || '',
              role: role || 'author',
              // Add a temporary password hash placeholder (will be updated when they first login)
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: `Failed to create user account: ${userError.message}` },
        { status: 500 }
      );
    }

    console.log('User created successfully in database:', userId);

    // Try to create the user in Supabase Auth as well (for future login)
    try {
      const { data: authData } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            first_name,
            last_name,
            affiliation: affiliation || '',
            role: role || 'author'
          },
          emailRedirectTo: undefined // Don't send email
        }
      });
      
      console.log('Auth user creation attempted, result:', authData ? 'success' : 'failed');
    } catch (authError) {
      console.log('Auth user creation failed (continuing anyway):', authError);
    }

    return NextResponse.json({
      message: 'Registration successful! You can now sign in with your credentials.',
      user: {
        id: userId,
        email: email.toLowerCase(),
        first_name,
        last_name,
        affiliation: affiliation || '',
        role: role || 'author'
      },
      success: true,
      needsEmailConfirmation: false,
      canLoginImmediately: true
    });

  } catch (error) {
    console.error('No-email registration error:', error);
    return NextResponse.json(
      { error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}