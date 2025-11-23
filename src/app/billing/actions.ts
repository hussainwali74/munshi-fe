'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function searchInventoryItems(query: string) {
    const session = await getSession()
    if (!session) return []

    if (!query || query.trim().length === 0) return []

    const sanitizedQuery = query.replace(/[(),]/g, '')

    if (sanitizedQuery.length === 0) return []

    const { data, error } = await getDb()
        .from('inventory')
        .select('id, name, selling_price, quantity, category')
        .eq('user_id', session.userId)
        .ilike('name', `%${sanitizedQuery}%`)
        .limit(10)

    if (error) {
        console.error('Inventory search error:', error)
        return []
    }

    return data
}

export async function createBill(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const customerId = formData.get('customerId') as string
    const itemsJson = formData.get('items') as string
    const totalAmount = parseFloat(formData.get('totalAmount') as string)
    const discount = parseFloat(formData.get('discount') as string) || 0
    const finalAmount = parseFloat(formData.get('finalAmount') as string)
    const paidAmount = parseFloat(formData.get('paidAmount') as string) || 0
    const paymentMode = formData.get('paymentMode') as string || 'cash' // cash, credit (udhar)

    let items = []
    try {
        items = JSON.parse(itemsJson)
    } catch (e) {
        throw new Error('Invalid items data')
    }

    // 1. Create Transaction Record
    const type = paymentMode === 'credit' ? 'credit' : 'debit' // credit means udhar given (receivable), debit means cash sale (if fully paid, it's balanced, but usually we track sales)
    // Actually, for a bill:
    // If fully paid: It's a cash sale. We might just record it as a 'sale' type or 'debit' (money coming in).
    // If udhar: It's 'credit' (money receivable).
    // Let's stick to the existing types: 'credit' (receivable/udhar), 'debit' (payable/payment received).
    // If it's a cash sale, it's technically a 'debit' (payment received) matching the bill amount?
    // Or maybe we need a new type 'sale'.
    // For now, let's assume:
    // - If Udhar: type = 'credit', amount = finalAmount, paid = paidAmount.
    // - If Cash: type = 'debit', amount = finalAmount, paid = finalAmount. (This might be confusing if 'debit' is only for payments).
    // Let's check how dashboard displays it.
    // Dashboard: credit -> ArrowUpRight (Red) -> Receivable. debit -> ArrowDownLeft (Green) -> Payable/Received.
    // So a Cash Sale is money received -> Debit.
    // An Udhar Sale is money receivable -> Credit.

    // However, a "Bill" usually implies a Sale.
    // If I sell goods worth 1000.
    // Case 1: Cash. I get 1000. My cash increases. Customer balance unchanged.
    // Case 2: Udhar. I get 0. Customer balance +1000.

    // Let's use a specific logic:
    // We will insert into `transactions`.
    // If paymentMode is 'credit' (Udhar):
    //   type: 'credit', amount: finalAmount, paid: paidAmount.
    //   Balance change: +(finalAmount - paidAmount).
    // If paymentMode is 'cash':
    //   type: 'debit', amount: finalAmount, paid: finalAmount.
    //   Balance change: 0.

    const transactionType = paymentMode === 'credit' ? 'credit' : 'debit'

    const { data: transaction, error: txError } = await getDb().from('transactions').insert({
        user_id: session.userId,
        customer_id: customerId,
        amount: finalAmount,
        type: transactionType,
        description: `Bill #${Date.now().toString().slice(-6)}`, // Simple bill number
        items: items,
        bill_amount: finalAmount,
        paid_amount: paidAmount
    }).select().single()

    if (txError) {
        console.error('Bill creation error:', txError)
        throw new Error('Failed to create bill')
    }

    // 2. Update Inventory Quantities
    for (const item of items) {
        if (item.id) {
            // Decrement stock
            await getDb().rpc('decrement_stock', {
                p_item_id: item.id,
                p_quantity: item.qty
            })
        }
    }

    // 3. Update Customer Balance (only if Udhar)
    if (paymentMode === 'credit') {
        const balanceChange = finalAmount - paidAmount
        if (balanceChange > 0) {
            await getDb().rpc('update_customer_balance', {
                p_customer_id: customerId,
                p_amount: balanceChange
            })
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/inventory')
    revalidatePath('/khata')

    return transaction
}
