'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface CustomTranslation {
    key: string
    lang: string
    value: string
}

export async function getMergedTranslations(): Promise<{ system: CustomTranslation[], custom: CustomTranslation[] }> {
    const session = await getSession()
    const db = getDb()

    const [systemRes, customRes] = await Promise.all([
        db.from('system_translations').select('key, lang, value'),
        session?.userId
            ? db.from('custom_translations').select('key, lang, value').eq('user_id', session.userId)
            : Promise.resolve({ data: [] as CustomTranslation[], error: null })
    ])

    if (systemRes.error && systemRes.error.code !== 'PGRST205') {
        console.error('Error fetching system translations:', systemRes.error)
    }
    if (customRes.error) {
        console.error('Error fetching custom translations:', customRes.error)
    }

    return {
        system: (systemRes.data || []) as CustomTranslation[],
        custom: (customRes.data || []) as CustomTranslation[]
    }
}

// Kept for backward compatibility if needed, but we'll update usage
export async function getCustomTranslations(): Promise<CustomTranslation[]> {
    const { custom } = await getMergedTranslations()
    return custom
}

export async function updateCustomTranslation(key: string, lang: string, value: string) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const db = getDb()

    // Check if exists/Upsert logic
    // We strive for unique(user_id, key, lang) constraint

    // Manual UPSERT-like logic if needed, or simple upsert if constraint exists
    const { error } = await db
        .from('custom_translations')
        .upsert({ user_id: session.userId, key, lang, value }, { onConflict: 'user_id, key, lang' })

    if (error) {
        console.error('Error updating custom translation:', error)
        throw new Error('Failed to update translation')
    }

    revalidatePath('/') // Revalidate everything as translations might be used globally
}

export async function deleteCustomTranslation(key: string, lang: string) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const { error } = await getDb()
        .from('custom_translations')
        .delete()
        .eq('user_id', session.userId)
        .eq('key', key)
        .eq('lang', lang)

    if (error) {
        console.error('Error deleting custom translation:', error)
        throw new Error('Failed to delete translation')
    }

    revalidatePath('/')
}
