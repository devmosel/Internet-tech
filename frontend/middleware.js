// Route protection middleware
// Keeps unauthenticated users out of protected pages

import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const userStr = request.cookies.get('user')?.value;
  
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/booking'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const adminRoutes = ['/dashboard/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // No token? Send them to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin pages are superadmin-only
  if (isAdminRoute && token) {
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || user.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Already logged in? Skip the login page
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Run middleware on all routes except API calls, static files, and public assets
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
