
'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
    const session = await getSession()
    if (!session) return []

    const { data, error } = await getDb()
        .from('customers')
        .select('*')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Fetch customers error:', error)
        return []
    }

    return data
}

export async function getCustomerById(customerId: string) {
    const session = await getSession()
    if (!session) return null

    // Fetch customer
    const { data: customer, error: customerError } = await getDb()
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('user_id', session.userId)
        .single()

    if (customerError) {
        console.error('Fetch customer error:', customerError)
        return null
    }

    // Fetch transactions for this customer
    const { data: transactions, error: transactionsError } = await getDb()
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', session.userId)
        .order('date', { ascending: false })

    if (transactionsError) {
        console.error('Fetch transactions error:', transactionsError)
    }

    return {
        ...customer,
        transactions: transactions || []
    }
}

export async function updateCustomer(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const cnic = formData.get('cnic') as string
    const address = formData.get('address') as string

    const { error } = await getDb()
        .from('customers')
        .update({
            name,
            phone,
            cnic,
            address
        })
        .eq('id', id)
        .eq('user_id', session.userId)

    if (error) {
        console.error('Customer update error:', error)
        throw new Error('Failed to update customer')
    }

    revalidatePath('/khata')
    revalidatePath(`/khata/${id}`)
}

export async function deleteCustomer(id: string) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const { error } = await getDb()
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', session.userId)

    if (error) {
        console.error('Delete customer error:', error)
        throw new Error('Failed to delete customer')
    }

    revalidatePath('/khata')
}

export async function addCustomer(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const cnic = formData.get('cnic') as string
    const address = formData.get('address') as string

    const { error } = await getDb().from('customers').insert({
        user_id: session.userId,
        name,
        phone,
        cnic,
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
    const { error } = await getDb().from('transactions').insert({
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
    await getDb().rpc('update_customer_balance', {
        p_customer_id: customerId,
        p_amount: balanceChange
    })

    revalidatePath('/khata')
    revalidatePath(`/khata/${customerId}`)
}

export async function getTransactionById(transactionId: string) {
    const session = await getSession()
    if (!session) return null

    const { data: transaction, error: transactionError } = await getDb()
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', session.userId)
        .single()

    if (transactionError) {
        console.error('Fetch transaction error:', transactionError)
        return null
    }

    const { data: customer, error: customerError } = await getDb()
        .from('customers')
        .select('id, name, phone, address, balance')
        .eq('id', transaction.customer_id)
        .eq('user_id', session.userId)
        .single()

    if (customerError) {
        console.error('Fetch transaction customer error:', customerError)
        return { transaction, customer: null }
    }

    return { transaction, customer }
}

export async function updateTransaction(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Not authenticated')

    const transactionId = formData.get('transactionId') as string
    const type = formData.get('type') as string
    const amountValue = formData.get('amount') as string
    const description = (formData.get('description') as string) || null
    const dateValue = formData.get('date') as string | null
    const billAmountValue = formData.get('billAmount')
    const paidAmountValue = formData.get('paidAmount')

    const amount = parseFloat(amountValue)
    if (Number.isNaN(amount)) {
        throw new Error('Invalid amount')
    }

    const { data: existing, error: existingError } = await getDb()
        .from('transactions')
        .select('id, amount, type, customer_id')
        .eq('id', transactionId)
        .eq('user_id', session.userId)
        .single()

    if (existingError || !existing) {
        console.error('Fetch transaction for update error:', existingError)
        throw new Error('Transaction not found')
    }

    const updates: Record<string, unknown> = {
        amount,
        type,
        description
    }

    if (dateValue) {
        updates.date = new Date(`${dateValue}T00:00:00`).toISOString()
    }

    if (billAmountValue !== null) {
        const billAmountString = billAmountValue as string
        updates.bill_amount = billAmountString === '' ? null : parseFloat(billAmountString)
    }

    if (paidAmountValue !== null) {
        const paidAmountString = paidAmountValue as string
        updates.paid_amount = paidAmountString === '' ? null : parseFloat(paidAmountString)
    }

    const { error: updateError } = await getDb()
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .eq('user_id', session.userId)

    if (updateError) {
        console.error('Transaction update error:', updateError)
        throw new Error('Failed to update transaction')
    }

    const previousAmount = Number(existing.amount)
    const previousEffect = existing.type === 'credit' ? previousAmount : -previousAmount
    const nextEffect = type === 'credit' ? amount : -amount
    const balanceDelta = nextEffect - previousEffect

    if (balanceDelta !== 0) {
        await getDb().rpc('update_customer_balance', {
            p_customer_id: existing.customer_id,
            p_amount: balanceDelta
        })
    }

    revalidatePath('/khata')
    revalidatePath(`/khata/${existing.customer_id}`)
    revalidatePath(`/khata/${existing.customer_id}/transactions/${transactionId}`)
}
