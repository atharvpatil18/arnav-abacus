import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('Authentication');
  const { pathname } = request.nextUrl;

  // Allow access to auth pages without authentication
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Check if authentication cookie exists and has basic JWT format (3 parts separated by dots)
  if (!authCookie || !authCookie.value) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validate basic JWT structure (header.payload.signature)
  const jwtParts = authCookie.value.split('.');
  if (jwtParts.length !== 3) {
    // Invalid JWT format, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie exists with valid format, allow the request
  // Full JWT validation is done by the API backend
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};