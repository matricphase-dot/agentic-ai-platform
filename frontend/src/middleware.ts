import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')
  
  // Public routes that don't require authentication
  const publicPaths = ['/login', '/register', '/']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)
  
  // If trying to access protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If authenticated and trying to access login/register, redirect to dashboard
  if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
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