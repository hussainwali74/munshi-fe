'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { createBill } from '@/app/billing/actions'
import type { InventorySearchItem } from '@/types/inventory'

interface InventoryRow {
    id: string
    name: string
    category: string | null
    selling_price: number | null
    quantity: number | null
}

interface SaleCartItem {
    id: string
    name: string
    price: number
    qty: number
    maxQty: number
}

interface CustomerRow {
    id: string
}

const DEFAULT_GST_RATE = 18

export async function getSaleInventoryItems(): Promise<InventorySearchItem[]> {
    const session = await getSession()
    if (!session) return []

    const { data, error } = await getDb()
        .from('inventory')
        .select('id, name, category, selling_price, quantity')
        .eq('user_id', session.userId)
        .order('name', { ascending: true })

    if (error) {
        console.error('Fetch sale inventory error:', error)
        return []
    }

    return ((data as InventoryRow[] | null) || []).map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category || 'other',
        selling_price: Number(item.selling_price ?? 0),
        quantity: Number(item.quantity ?? 0),
    }))
}

function parseSaleItems(itemsJson: string): SaleCartItem[] {
    let parsedItems: unknown[] = []
    try {
        parsedItems = JSON.parse(itemsJson || '[]')
    } catch {
        throw new Error('Invalid items data')
    }

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        throw new Error('Add at least one item to generate receipt')
    }

    const saleItems = parsedItems
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
            id: String(item.id || '').trim(),
            name: String(item.name || '').trim(),
            price: Number(item.price),
            qty: Number(item.qty),
            maxQty: Number(item.maxQty),
        }))
        .filter((item) => item.id && item.name && Number.isFinite(item.price) && item.price >= 0 && Number.isFinite(item.qty) && item.qty > 0)

    if (saleItems.length === 0) {
        throw new Error('Add at least one item to generate receipt')
    }

    return saleItems
}

async function resolveCustomerId(userId: string, customerName: string, customerPhone: string): Promise<string> {
    const { data: existingCustomers, error: fetchError } = await getDb()
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .eq('phone', customerPhone)
        .limit(1)

    if (fetchError) {
        console.error('Fetch customer by phone error:', fetchError)
        throw new Error('Failed to create receipt')
    }

    const existingCustomer = ((existingCustomers as CustomerRow[] | null) || [])[0]
    if (existingCustomer?.id) {
        return existingCustomer.id
    }

    const { data: insertedCustomer, error: insertError } = await getDb()
        .from('customers')
        .insert({
            user_id: userId,
            name: customerName,
            phone: customerPhone,
            balance: 0,
        })
        .select('id')
        .single()

    if (insertError || !insertedCustomer) {
        console.error('Create customer for sale error:', insertError)
        throw new Error('Failed to create receipt')
    }

    return (insertedCustomer as CustomerRow).id
}

async function validateCustomerId(userId: string, customerId: string): Promise<string> {
    const { data: customers, error } = await getDb()
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .eq('id', customerId)
        .limit(1)

    if (error) {
        console.error('Validate customer for sale error:', error)
        throw new Error('Failed to create receipt')
    }

    const customer = ((customers as CustomerRow[] | null) || [])[0]
    if (!customer?.id) {
        throw new Error('Customer not found')
    }

    return customer.id
}

export async function createSaleReceipt(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const selectedCustomerId = String(formData.get('customerId') || '').trim()
    const customerName = String(formData.get('customerName') || '').trim()
    const customerPhone = String(formData.get('customerPhone') || '').trim()
    const rawItems = String(formData.get('items') || '[]')
    const requestedGstRate = Number(formData.get('gstRate') || DEFAULT_GST_RATE)

    if (!selectedCustomerId && (!customerName || !customerPhone)) {
        throw new Error('Please enter customer name and phone number')
    }

    const items = parseSaleItems(rawItems)
    const gstRate = Number.isFinite(requestedGstRate) && requestedGstRate >= 0
        ? requestedGstRate
        : DEFAULT_GST_RATE

    const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    if (!Number.isFinite(rawSubtotal) || rawSubtotal <= 0) {
        throw new Error('Invalid sale amount')
    }

    const subtotal = Math.round(rawSubtotal)
    const gstAmount = Math.round((subtotal * gstRate) / 100)
    const totalAmount = subtotal + gstAmount
    const userId = String(session.userId)
    const customerId = selectedCustomerId
        ? await validateCustomerId(userId, selectedCustomerId)
        : await resolveCustomerId(userId, customerName, customerPhone)

    const billFormData = new FormData()
    billFormData.append('customerId', customerId)
    billFormData.append('items', JSON.stringify(items))
    billFormData.append('finalAmount', totalAmount.toString())
    billFormData.append('paidAmount', totalAmount.toString())
    billFormData.append('paymentMode', 'cash')
    billFormData.append('billNumber', Date.now().toString().slice(-6))

    const transaction = await createBill(billFormData)

    return {
        transactionId: transaction?.id || null,
        customerId,
        subtotal,
        gstAmount,
        totalAmount,
    }
}
