// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('pharmacyId')?.value;

  // If no token and trying to access protected routes, redirect to login
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in but trying to access login/signup, redirect to home
  if (token && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Define protected routes
export const config = {
  matcher: ['/orders/:path*', '/stocks/:path*','/'], // Corrected matcher syntax
};