/**
 * Middleware for Route Protection
 * Protects authenticated routes and redirects unauthenticated users to login
 */

import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get token and user from cookies
  const token = request.cookies.get('token')?.value;
  const userStr = request.cookies.get('user')?.value;
  
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/booking'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Define admin-only routes
  const adminRoutes = ['/dashboard/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Save intended destination
    return NextResponse.redirect(loginUrl);
  }

  // If accessing admin route, check for superadmin role
  if (isAdminRoute && token) {
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Check if user has superadmin role
      if (!user || user.role !== 'superadmin') {
        // Redirect to regular dashboard if not superadmin
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // If user data is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If accessing login page with valid token, redirect to dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
