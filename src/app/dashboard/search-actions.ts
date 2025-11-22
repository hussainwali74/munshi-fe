
'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function searchCustomers(query: string) {
    const session = await getSession()
    if (!session) return []

    if (!query || query.trim().length === 0) return []

    // Sanitize query to prevent PostgREST syntax injection
    // Remove common special characters used in PostgREST syntax like , ( )
    const sanitizedQuery = query.replace(/[(),]/g, '')

    if (sanitizedQuery.length === 0) return []

    const { data, error } = await db
        .from('customers')
        .select('id, name, phone, address')
        .eq('user_id', session.userId)
        .or(`name.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%`)
        .limit(5)

    if (error) {
        console.error('Search error:', error)
        return []
    }

    return data
}
