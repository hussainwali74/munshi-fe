
'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

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
