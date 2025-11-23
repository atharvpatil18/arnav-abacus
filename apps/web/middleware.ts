import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('Authentication');
  const { pathname } = request.nextUrl;

  // Allow access to auth pages without authentication
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Check if authentication cookie exists
  if (!authCookie || !authCookie.value) {
    // Redirect to login if cookie is missing
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie exists, allow the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};