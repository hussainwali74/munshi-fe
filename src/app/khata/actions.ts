
'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function addCustomer(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string

    const { error } = await db.from('customers').insert({
        user_id: session.userId,
        name,
        phone,
        address,
        balance: 0
    })

    if (error) {
        console.error('Customer creation error:', error)
        throw new Error('Failed to add customer')
    }

    revalidatePath('/khata')
}

export async function addTransaction(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const customerId = formData.get('customerId') as string
    const type = formData.get('type') as string // 'credit' or 'debit'
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const itemsJson = formData.get('items') as string
    const billAmount = formData.get('billAmount') ? parseFloat(formData.get('billAmount') as string) : amount
    const paidAmount = formData.get('paidAmount') ? parseFloat(formData.get('paidAmount') as string) : 0

    let items = null
    try {
        if (itemsJson) {
            items = JSON.parse(itemsJson)
        }
    } catch (e) {
        console.error('Invalid items JSON:', e)
    }

    // Insert transaction
    const { error } = await db.from('transactions').insert({
        user_id: session.userId,
        customer_id: customerId,
        amount,
        type,
        description,
        items,
        bill_amount: billAmount,
        paid_amount: paidAmount
    })

    if (error) {
        console.error('Transaction error:', error)
        throw new Error('Failed to add transaction')
    }

    // Update customer balance
    const balanceChange = type === 'credit' ? amount : -amount
    await db.rpc('update_customer_balance', {
        p_customer_id: customerId,
        p_amount: balanceChange
    })

    revalidatePath('/khata')
    revalidatePath(`/khata/${customerId}`)
}
