import { NextResponse } from 'next/server';

export function middleware() {
  // Just let all requests through - authentication is handled client-side
  // by useAuth hook and protected route components
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};