import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  
  if (!token_hash || type !== 'signup') {
    return NextResponse.redirect(new URL('/register?error=invalid_confirmation_link', request.url));
  }

  try {
    // Verify the email confirmation token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'signup'
    });

    if (error) {
      console.error('Email confirmation error:', error);
      return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(error.message)}`, request.url));
    }

    if (!data.user) {
      return NextResponse.redirect(new URL('/register?error=confirmation_failed', request.url));
    }

    console.log('Email confirmed for user:', data.user.email);

    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?confirmed=true&message=Email confirmed successfully! Please log in to continue.', request.url));

  } catch (error) {
    console.error('Confirmation processing error:', error);
    return NextResponse.redirect(new URL('/register?error=confirmation_processing_failed', request.url));
  }
}
