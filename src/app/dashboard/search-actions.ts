
'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function searchCustomers(query: string) {
    const session = await getSession()
    if (!session) return []

    if (!query || query.trim().length === 0) return []

    // Sanitize query to prevent PostgREST syntax injection
    // Remove common special characters used in PostgREST syntax like , ( )
    const sanitizedQuery = query.replace(/[(),]/g, '')

    if (sanitizedQuery.length === 0) return []

    const { data, error } = await getDb()
        .from('customers')
        .select('id, name, phone, address')
        .eq('user_id', session.userId)
        .or(`name.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%`)
        .limit(5)

    if (error) {
        console.error('Search error:', error)
        return []
    }

    return data
}

export async function getRecentTransactions() {
    const session = await getSession()
    if (!session) return []

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
            created_at,
            customer_id,
            customers (
                id,
                name
            )
        `)
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Fetch recent transactions error:', error)
        return []
    }

    // Format transactions for display
    return (data || []).map((txn: any) => {
        const createdAt = new Date(txn.created_at)
        const now = new Date()
        const isToday = createdAt.toDateString() === now.toDateString()
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const isYesterday = createdAt.toDateString() === yesterday.toDateString()

        let dateStr = ''
        if (isToday) {
            dateStr = 'Today'
        } else if (isYesterday) {
            dateStr = 'Yesterday'
        } else {
            dateStr = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }

        const timeStr = createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

        return {
            id: txn.id,
            customerName: txn.customers?.name || 'Unknown Customer',
            customerId: txn.customer_id,
            date: dateStr,
            time: timeStr,
            type: txn.type,
            amount: txn.amount,
            description: txn.description || (txn.type === 'credit' ? 'Purchase' : 'Payment'),
            items: txn.items,
            billAmount: txn.bill_amount,
            paidAmount: txn.paid_amount
        }
    })
}
