
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth'

export async function proxy(request: NextRequest) {
    // Check for session cookie
    const session = request.cookies.get('session')
    const { pathname } = request.nextUrl

    // If trying to access login page while authenticated, redirect to dashboard
    if (session && pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If trying to access root page while authenticated, redirect to dashboard
    // This is optional: maybe you want logged-in users to see the landing page too?
    // Usually for apps, logged in users go straight to dashboard.
    if (session && pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If no session and trying to access protected route, redirect to login
    // Protected routes: everything EXCEPT /, /login, /_next, static files
    const isPublicRoute = pathname === '/' || pathname.startsWith('/login');

    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If session exists, update it (refresh expiry)
    if (session) {
        return await updateSession(request)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
