'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { InventorySearchItem } from '@/types/inventory'
import type { Customer } from './types'

export async function getCustomerForBilling(customerId: string): Promise<Customer | null> {
    const session = await getSession()
    if (!session) return null

    if (!customerId) return null

    const { data, error } = await getDb()
        .from('customers')
        .select('id, name, phone, address, cnic')
        .eq('id', customerId)
        .eq('user_id', session.userId)
        .single()

    if (error) {
        console.error('Fetch customer for billing error:', error)
        return null
    }

    return (data as Customer | null) || null
}

export async function searchInventoryItems(query: string): Promise<InventorySearchItem[]> {
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

    return (data as InventorySearchItem[] | null) || []
}

export async function createBill(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const customerId = formData.get('customerId') as string
    const itemsJson = formData.get('items') as string
    const finalAmount = parseFloat(formData.get('finalAmount') as string)
    const paidAmount = parseFloat(formData.get('paidAmount') as string) || 0
    const paymentMode = formData.get('paymentMode') as string || 'cash' // cash, credit (udhar)
    const billNumber = (formData.get('billNumber') as string) || Date.now().toString().slice(-6)

    let items = []
    try {
        items = JSON.parse(itemsJson)
    } catch {
        throw new Error('Invalid items data')
    }
    if (!Array.isArray(items)) {
        throw new Error('Invalid items data')
    }

    // 1. Create Transaction Record
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
        description: `Bill #${billNumber}`, // Simple bill number
        items: items,
        bill_amount: finalAmount,
        paid_amount: paidAmount
    }).select().single()

    if (txError) {
        console.error('Bill creation error:', txError)
        throw new Error('Failed to create bill')
    }

    // 2. Update Inventory Quantities
    const stockUpdates = items
        .filter((item: { id?: string; qty?: number }) => item?.id && Number.isFinite(Number(item?.qty)) && Number(item?.qty) > 0)
        .map((item: { id: string; qty: number }) => ({ id: item.id, qty: Number(item.qty) }))

    if (stockUpdates.length > 0) {
        const { data: stockRows, error: stockFetchError } = await getDb()
            .from('inventory')
            .select('id, quantity')
            .eq('user_id', session.userId)
            .in('id', stockUpdates.map((item) => item.id))

        if (stockFetchError) {
            console.error('Inventory fetch error:', stockFetchError)
        } else {
            const stockById = new Map(
                (stockRows || []).map((row: { id: string; quantity: number | null }) => [row.id, Number(row.quantity ?? 0)])
            )

            await Promise.all(
                stockUpdates.map(async (item) => {
                    const currentQty = stockById.get(item.id)
                    if (currentQty === undefined) return
                    const nextQty = Math.max(0, currentQty - item.qty)
                    const { error: updateError } = await getDb()
                        .from('inventory')
                        .update({ quantity: nextQty })
                        .eq('id', item.id)
                        .eq('user_id', session.userId)

                    if (updateError) {
                        console.error('Inventory update error:', updateError)
                    }
                })
            )
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
