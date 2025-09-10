import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Skip middleware in v0 preview mode
  if (request.headers.get('x-vercel-preview') || 
      request.headers.get('x-v0-preview') ||
      pathname.includes('/_next/') ||
      pathname.includes('/api/')) {
    return NextResponse.next()
  }

  // Public admin paths that don't require authentication
  const publicAdminPaths = ['/admin/auth', '/admin/quick-access']
  
  // Protect admin routes, allow auth page
  if (pathname.startsWith('/admin') && !publicAdminPaths.includes(pathname)) {
    // Skip middleware check for client-side routes - let AdminGuard handle it
    // This prevents infinite redirects
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
