
'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Default categories
const DEFAULT_CATEGORIES = ['sanitary', 'electrical', 'plumbing', 'other']

export async function updateShopDetails(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const businessName = formData.get('businessName') as string
    const fullName = formData.get('fullName') as string
    const shopPhone = formData.get('shopPhone') as string
    const shopAddress = formData.get('shopAddress') as string

    const { error } = await getDb().from('users').update({
        business_name: businessName,
        full_name: fullName,
        shop_phone: shopPhone,
        shop_address: shopAddress
    }).eq('id', session.userId)

    if (error) {
        console.error('Update error:', error)
        throw new Error('Failed to update settings')
    }

    revalidatePath('/settings')
}

export async function getCategories(): Promise<string[]> {
    const session = await getSession()
    if (!session) return DEFAULT_CATEGORIES

    const { data, error } = await getDb()
        .from('users')
        .select('categories')
        .eq('id', session.userId)
        .single()

    if (error || !data?.categories) {
        return DEFAULT_CATEGORIES
    }

    return data.categories as string[]
}

export async function addCategory(category: string): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session) return { success: false, error: 'Not authenticated' }

    if (!category || category.trim().length === 0) {
        return { success: false, error: 'Category name is required' }
    }

    const trimmedCategory = category.trim().toLowerCase()

    // Get current categories
    const { data: userData, error: fetchError } = await getDb()
        .from('users')
        .select('categories')
        .eq('id', session.userId)
        .single()

    if (fetchError) {
        console.error('Fetch categories error:', fetchError)
        return { success: false, error: 'Failed to fetch categories' }
    }

    const currentCategories = (userData?.categories as string[]) || DEFAULT_CATEGORIES

    // Check if category already exists
    if (currentCategories.includes(trimmedCategory)) {
        return { success: false, error: 'Category already exists' }
    }

    // Add new category
    const updatedCategories = [...currentCategories, trimmedCategory]

    const { error: updateError } = await getDb()
        .from('users')
        .update({ categories: updatedCategories })
        .eq('id', session.userId)

    if (updateError) {
        console.error('Update categories error:', updateError)
        return { success: false, error: 'Failed to add category' }
    }

    revalidatePath('/settings')
    revalidatePath('/inventory')
    return { success: true }
}

export async function removeCategory(category: string): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session) return { success: false, error: 'Not authenticated' }

    // Get current categories
    const { data: userData, error: fetchError } = await getDb()
        .from('users')
        .select('categories')
        .eq('id', session.userId)
        .single()

    if (fetchError) {
        console.error('Fetch categories error:', fetchError)
        return { success: false, error: 'Failed to fetch categories' }
    }

    const currentCategories = (userData?.categories as string[]) || DEFAULT_CATEGORIES

    // Remove the category
    const updatedCategories = currentCategories.filter(c => c !== category)

    // Ensure at least one category remains
    if (updatedCategories.length === 0) {
        return { success: false, error: 'Cannot remove the last category' }
    }

    const { error: updateError } = await getDb()
        .from('users')
        .update({ categories: updatedCategories })
        .eq('id', session.userId)

    if (updateError) {
        console.error('Update categories error:', updateError)
        return { success: false, error: 'Failed to remove category' }
    }

    revalidatePath('/settings')
    revalidatePath('/inventory')
    return { success: true }
}
