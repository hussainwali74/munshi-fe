
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    // Check for session cookie
    const session = request.cookies.get('session')

    // If no session and trying to access protected route, redirect to login
    if (!session && !request.nextUrl.pathname.startsWith('/login')) {
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
