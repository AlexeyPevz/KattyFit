import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Protect admin routes, allow auth page
  if (pathname.startsWith('/admin') && pathname !== '/admin/auth') {
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

