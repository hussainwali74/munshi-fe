'use server'

import { db } from '@/lib/db'
import { uploadImageToR2 } from '@/lib/r2'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function getInventoryItems() {
    const session = await getSession()
    if (!session) return []

    const { data, error } = await db
        .from('inventory')
        .select('*')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Fetch inventory error:', error)
        return []
    }

    return data
}

export async function addInventoryItem(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const quantity = parseFloat(formData.get('quantity') as string)
    const size = formData.get('size') as string
    const color = formData.get('color') as string
    const imageFile = formData.get('image') as File

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
        try {
            imageUrl = await uploadImageToR2(imageFile)
        } catch (error) {
            console.error('Upload failed:', error)
        }
    }

    const { error } = await db.from('inventory').insert({
        user_id: session.userId, // Use ID from custom session
        name,
        category,
        selling_price: price,
        quantity,
        size,
        color,
        image_url: imageUrl
    })

    if (error) {
        console.error('Database error:', error)
        throw new Error('Failed to add item')
    }

    revalidatePath('/inventory')
}

export async function updateInventoryItem(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const quantity = parseFloat(formData.get('quantity') as string)
    const size = formData.get('size') as string
    const color = formData.get('color') as string
    const imageFile = formData.get('image') as File
    const deleteImage = formData.get('deleteImage') === 'true'

    // First get existing item to handle image logic
    const { data: existingItem, error: fetchError } = await db
        .from('inventory')
        .select('image_url')
        .eq('id', id)
        .eq('user_id', session.userId)
        .single()

    if (fetchError || !existingItem) {
        throw new Error('Item not found or unauthorized')
    }

    let imageUrl = existingItem.image_url

    if (deleteImage) {
        // We should probably delete from R2 here, but for now just nullify in DB
        // In a real app, you'd want to clean up R2 storage too
        imageUrl = null
    }

    if (imageFile && imageFile.size > 0) {
        try {
            imageUrl = await uploadImageToR2(imageFile)
        } catch (error) {
            console.error('Upload failed:', error)
        }
    }

    const { error } = await db.from('inventory').update({
        name,
        category,
        selling_price: price,
        quantity,
        size,
        color,
        image_url: imageUrl
    }).eq('id', id).eq('user_id', session.userId)

    if (error) {
        console.error('Database error:', error)
        throw new Error('Failed to update item')
    }

    revalidatePath('/inventory')
}
