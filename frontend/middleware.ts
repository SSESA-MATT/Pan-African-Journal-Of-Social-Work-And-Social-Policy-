import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(_req: NextRequest) {
  // Auth is handled client-side via JWT tokens stored in localStorage.
  // This middleware is a simple pass-through — no server-side session.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}