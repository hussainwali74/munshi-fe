import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'default-secret-key-change-me')

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Processing request:', request.nextUrl.pathname)
  
  const session = request.cookies.get('session')?.value
  console.log('[Middleware] Session cookie present:', !!session)

  // Define public paths
  const isPublicPath = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/auth')
  console.log('[Middleware] Is public path:', isPublicPath)

  // If checking for session validity
  let isValidSession = false
  if (session) {
    try {
      await jwtVerify(session, SECRET_KEY)
      isValidSession = true
      console.log('[Middleware] Session verified successfully')
    } catch (error) {
      console.log('[Middleware] Session verification failed:', error)
      // Invalid token
    }
  }

  // Redirect to login if accessing protected route without valid session
  if (!isPublicPath && !isValidSession) {
    // Exclude static files, images, etc.
    if (request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)) {
      console.log('[Middleware] Allowing static file:', request.nextUrl.pathname)
      return NextResponse.next()
    }
    console.log('[Middleware] Redirecting to login - protected route without valid session')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing login page OR landing page while logged in
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') && isValidSession) {
    console.log('[Middleware] Redirecting to dashboard - already logged in')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  console.log('[Middleware] Allowing request to proceed')
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

