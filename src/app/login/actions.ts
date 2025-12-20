
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { hashPassword, verifyPassword, createSession, deleteSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
export type AuthState = {
    error?: string
    message?: string
}


export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const identifier = formData.get('identifier') as string
    const password = formData.get('password') as string

    // Fetch user from custom 'users' table by email or phone
    const { data: user, error } = await getDb()
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},phone_number.eq.${identifier}`)
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
    redirect('/dashboard')
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const businessName = formData.get('businessName') as string
    const phoneNumber = formData.get('phoneNumber') as string

    // Check if user exists
    const { data: existingUser } = await getDb().from('users').select('id').or(`email.eq.${email},phone_number.eq.${phoneNumber}`).single()
    if (existingUser) {
        return { error: 'User with this email or phone already exists' }
    }

    const hashedPassword = await hashPassword(password)

    const { data: newUser, error } = await getDb().from('users').insert({
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        business_name: businessName,
        phone_number: phoneNumber
    }).select().single()

    if (error) {
        console.error('Signup error:', error)
        return { error: 'Could not create user' }
    }

    await createSession({ userId: newUser.id, email: newUser.email, name: newUser.full_name })

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signOut(_formData?: FormData) {
    console.log('Sign out action called')
    try {
        await deleteSession()
        console.log('Session deleted successfully')
    } catch (error) {
        console.error('Error deleting session:', error)
    }
    console.log('Redirecting to login')
    redirect('/login')
}
