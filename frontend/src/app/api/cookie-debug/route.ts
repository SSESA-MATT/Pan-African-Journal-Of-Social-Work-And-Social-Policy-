import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== COOKIE DEBUG ENDPOINT ===');
  
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('All cookies:', allCookies);
    console.log('Cookie header:', request.headers.get('cookie'));
    
    // Look for Supabase specific cookies
    const supabaseCookies = allCookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('session')
    );
    
    console.log('Supabase-related cookies:', supabaseCookies);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      allCookies: allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })),
      supabaseCookies: supabaseCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })),
      cookieHeader: request.headers.get('cookie') ? 'Present' : 'Missing',
      cookieCount: allCookies.length,
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer')
    });
    
  } catch (error: any) {
    console.error('Cookie debug error:', error);
    return NextResponse.json({ 
      error: 'Cookie debug failed', 
      message: error.message 
    }, { status: 500 });
  }
}