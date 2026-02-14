'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { InventorySearchItem } from '@/types/inventory'
import type { Customer } from './types'
import { createBillReceiptFromTransaction } from '@/lib/invoice-receipt'

interface BillingTransactionRow {
    id: string
    amount: number
    type: 'credit' | 'debit'
    description: string | null
    items: unknown
    bill_amount: number | null
    paid_amount: number | null
    customer_id: string | null
    customers: {
        id: string
        name: string
        phone?: string | null
        address?: string | null
        cnic?: string | null
    } | Array<{
        id: string
        name: string
        phone?: string | null
        address?: string | null
        cnic?: string | null
    }> | null
}

export interface BillingPrefillDraft {
    billNumber: string
    customer: Customer
    items: Array<{
        id: string
        name: string
        price: number
        qty: number
        maxQty: number
    }>
    totalAmount: number
    discountAmount: number
    paidAmount: number
    paymentMode: 'cash' | 'credit'
}

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

export async function getBillingDraftFromTransaction(transactionId: string): Promise<BillingPrefillDraft | null> {
    const session = await getSession()
    if (!session) return null
    if (!transactionId) return null

    const { data, error } = await getDb()
        .from('transactions')
        .select(`
            id,
            amount,
            type,
            description,
            items,
            bill_amount,
            paid_amount,
            customer_id,
            customers (
                id,
                name,
                phone,
                address,
                cnic
            )
        `)
        .eq('id', transactionId)
        .eq('user_id', session.userId)
        .single()

    if (error || !data) {
        console.error('Fetch transaction for billing prefill error:', error)
        return null
    }

    const transaction = data as BillingTransactionRow
    const customer = Array.isArray(transaction.customers)
        ? transaction.customers[0]
        : transaction.customers

    if (!customer) {
        return null
    }

    const receipt = createBillReceiptFromTransaction({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        items: transaction.items,
        bill_amount: transaction.bill_amount,
        paid_amount: transaction.paid_amount,
        customer_id: transaction.customer_id,
        customerName: customer.name,
        customerPhone: customer.phone || '',
        customerAddress: customer.address || '',
        customerCnic: customer.cnic || undefined
    })

    return {
        billNumber: receipt.billNumber,
        customer: receipt.customer,
        items: receipt.items,
        totalAmount: receipt.totalAmount,
        discountAmount: receipt.discountAmount,
        paidAmount: receipt.paidAmount,
        paymentMode: receipt.paymentMode
    }
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
    const finalAmount = Number(formData.get('finalAmount') as string)
    const paidAmount = Number(formData.get('paidAmount') as string) || 0
    const paymentMode = (formData.get('paymentMode') as string) || 'cash'
    const billNumber = (formData.get('billNumber') as string) || Date.now().toString().slice(-6)

    if (!customerId) throw new Error('Customer is required')
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) throw new Error('Invalid bill amount')
    if (!Number.isFinite(paidAmount) || paidAmount < 0) throw new Error('Invalid paid amount')
    if (paidAmount > finalAmount) throw new Error('Paid amount cannot exceed bill amount')
    if (paymentMode !== 'cash' && paymentMode !== 'credit') throw new Error('Invalid payment mode')

    let items: unknown[] = []
    try {
        items = JSON.parse(itemsJson || '[]')
    } catch {
        throw new Error('Invalid items data')
    }
    if (!Array.isArray(items)) {
        throw new Error('Invalid items data')
    }
    if (items.length === 0) {
        throw new Error('Bill must contain at least one item')
    }

    const quantityByItemId = new Map<string, { qty: number; name: string }>()
    for (const item of items) {
        if (!item || typeof item !== 'object') continue
        const raw = item as { id?: unknown; qty?: unknown; name?: unknown }
        const id = typeof raw.id === 'string' ? raw.id.trim() : ''
        const qty = Number(raw.qty)
        if (!id || !Number.isFinite(qty) || qty <= 0) continue

        const existing = quantityByItemId.get(id)
        if (existing) {
            existing.qty += qty
        } else {
            quantityByItemId.set(id, {
                qty,
                name: typeof raw.name === 'string' ? raw.name : ''
            })
        }
    }
    if (quantityByItemId.size === 0) {
        throw new Error('Bill must contain valid item quantities')
    }

    const stockItemIds = Array.from(quantityByItemId.keys())
    const { data: stockRows, error: stockFetchError } = await getDb()
        .from('inventory')
        .select('id, name, quantity')
        .eq('user_id', session.userId)
        .in('id', stockItemIds)

    if (stockFetchError) {
        console.error('Inventory fetch error:', stockFetchError)
        throw new Error('Failed to verify inventory stock')
    }

    const stockById = new Map(
        ((stockRows as Array<{ id: string; name: string; quantity: number | null }> | null) || [])
            .map((row) => [row.id, row])
    )

    const nextStockLevels: Array<{ id: string; name: string; currentQty: number; nextQty: number }> = []
    for (const [itemId, itemMeta] of quantityByItemId.entries()) {
        const row = stockById.get(itemId)
        if (!row) {
            throw new Error(`${itemMeta.name || 'Item'} is no longer in inventory`)
        }

        const currentQty = Number(row.quantity ?? 0)
        if (currentQty < itemMeta.qty) {
            throw new Error(`${row.name || itemMeta.name || 'Item'} has only ${currentQty} in stock`)
        }

        nextStockLevels.push({
            id: row.id,
            name: row.name || itemMeta.name || 'Item',
            currentQty,
            nextQty: currentQty - itemMeta.qty
        })
    }

    const updatedItems: Array<{ id: string; previousQty: number }> = []
    for (const stockItem of nextStockLevels) {
        const { data: updatedRows, error: stockUpdateError } = await getDb()
            .from('inventory')
            .update({ quantity: stockItem.nextQty })
            .eq('id', stockItem.id)
            .eq('user_id', session.userId)
            .eq('quantity', stockItem.currentQty)
            .select('id')

        const hasUpdatedRow = Array.isArray(updatedRows) && updatedRows.length > 0
        if (stockUpdateError || !hasUpdatedRow) {
            if (stockUpdateError) {
                console.error('Inventory update error:', stockUpdateError)
            }

            await Promise.all(
                updatedItems.map((updatedItem) =>
                    getDb()
                        .from('inventory')
                        .update({ quantity: updatedItem.previousQty })
                        .eq('id', updatedItem.id)
                        .eq('user_id', session.userId)
                )
            )
            throw new Error(`${stockItem.name} stock changed. Please refresh and try again`)
        }

        updatedItems.push({ id: stockItem.id, previousQty: stockItem.currentQty })
    }

    const transactionType = paymentMode === 'credit' ? 'credit' : 'debit'
    const { data: transaction, error: txError } = await getDb().from('transactions').insert({
        user_id: session.userId,
        customer_id: customerId,
        amount: finalAmount,
        type: transactionType,
        description: `Bill #${billNumber}`,
        items,
        bill_amount: finalAmount,
        paid_amount: paidAmount
    }).select().single()

    if (txError) {
        console.error('Bill creation error:', txError)

        await Promise.all(
            nextStockLevels.map((stockItem) =>
                getDb()
                    .from('inventory')
                    .update({ quantity: stockItem.currentQty })
                    .eq('id', stockItem.id)
                    .eq('user_id', session.userId)
            )
        )

        throw new Error('Failed to create bill')
    }

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
