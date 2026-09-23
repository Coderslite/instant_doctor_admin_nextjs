// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLE_COOKIE, canAccess, normalizeRole } from '@/utils/roles';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('adminId')?.value;
  const { pathname } = request.nextUrl;

  // If no token and trying to access protected routes, redirect to login
  if (!token && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in but trying to access login/signup, redirect to home
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Restricted roles (e.g. marketer) only get their allowed pages
  const role = normalizeRole(request.cookies.get(ROLE_COOKIE)?.value);
  if (token && !canAccess(role, pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Run on every page except Next internals, API routes and static files
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
