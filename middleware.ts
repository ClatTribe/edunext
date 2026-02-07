import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Skip Next internals & files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return
  }

  // Redirect any casing → lowercase jeestarterkit
  if (pathname.toLowerCase().startsWith('/jeestarterkit')) {
    if (pathname !== pathname.toLowerCase()) {
      const url = req.nextUrl.clone()
      url.pathname = pathname.toLowerCase()
      return NextResponse.redirect(url, 308) // permanent
    }
  }
}

export const config = {
  matcher: ['/JEEstarterkit/:path*', '/jeestarterkit/:path*'],
}
