import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== COOKIE TEST ENDPOINT ===');
  
  // Set a test cookie and check if it's received
  const response = NextResponse.json({
    timestamp: new Date().toISOString(),
    cookieHeader: request.headers.get('cookie'),
    allHeaders: Object.fromEntries(request.headers.entries()),
    url: request.url,
    method: request.method
  });
  
  // Set a test cookie
  response.cookies.set('test-cookie', 'test-value', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/'
  });
  
  return response;
}