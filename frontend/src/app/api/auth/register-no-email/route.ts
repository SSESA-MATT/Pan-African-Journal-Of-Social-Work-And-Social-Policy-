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

    // Register user using Supabase Auth (with email confirmation)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            first_name,
            last_name,
            affiliation: affiliation || '',
            role: role || 'author'
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_BASE_URL
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
            : undefined
        }
      });
      if (error) {
        return NextResponse.json(
          { error: `Registration failed: ${error.message}` },
          { status: 400 }
        );
      }
      return NextResponse.json({
        message: 'Registration successful! Please check your email to confirm your account before signing in.',
        user: {
          email: email.toLowerCase(),
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        },
        success: true,
        needsEmailConfirmation: true,
        canLoginImmediately: false
      });
    } catch (error) {
      return NextResponse.json(
        { error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('No-email registration error:', error);
    return NextResponse.json(
      { error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}