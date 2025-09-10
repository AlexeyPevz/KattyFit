import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Public admin paths that don't require authentication
  const publicAdminPaths = ['/admin/auth', '/admin/quick-access']
  
  // Protect admin routes, allow auth page
  if (pathname.startsWith('/admin') && !publicAdminPaths.includes(pathname)) {
    const adminAuth = request.cookies.get('admin_auth')?.value
    if (!adminAuth) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/auth'
      url.search = `next=${encodeURIComponent(pathname + (search || ''))}`
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
