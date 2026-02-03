
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { hash, compare } from 'bcrypt-ts'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'default-secret-key-change-me')

export type SessionPayload = {
    userId: string;
    email: string;
    name: string;
} & Record<string, unknown>;

export async function hashPassword(password: string) {
    return await hash(password, 10)
}

export async function verifyPassword(password: string, hashString: string) {
    return await compare(password, hashString)
}

export async function createSession(payload: SessionPayload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(SECRET_KEY)

    const cookieStore = await cookies()
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    })
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    if (!session) return null

    try {
        const { payload } = await jwtVerify(session.value, SECRET_KEY)
        return payload
    } catch {
        return null
    }
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value
    if (!session) return

    // Refresh logic could go here if needed
    const parsed = await getSession()
    if (!parsed) return

    const res = NextResponse.next()
    res.cookies.set({
        name: 'session',
        value: session,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    })
    return res
}
