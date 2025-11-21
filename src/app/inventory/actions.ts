
'use server'

import { db } from '@/lib/db'
import { uploadImageToR2 } from '@/lib/r2'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

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
