
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, createSession, deleteSession } from '@/lib/auth'

export type AuthState = {
    error?: string
    message?: string
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Fetch user from custom 'users' table
    const { data: user, error } = await db
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

    if (error || !user) {
        return { error: 'Invalid credentials' }
    }

    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
        return { error: 'Invalid credentials' }
    }

    // Create Session
    await createSession({ userId: user.id, email: user.email, name: user.full_name })

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const businessName = formData.get('businessName') as string

    // Check if user exists
    const { data: existingUser } = await db.from('users').select('id').eq('email', email).single()
    if (existingUser) {
        return { error: 'User already exists' }
    }

    const hashedPassword = await hashPassword(password)

    const { data: newUser, error } = await db.from('users').insert({
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        business_name: businessName
    }).select().single()

    if (error) {
        console.error('Signup error:', error)
        return { error: 'Could not create user' }
    }

    await createSession({ userId: newUser.id, email: newUser.email, name: newUser.full_name })

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signOut() {
    await deleteSession()
    redirect('/login')
}
