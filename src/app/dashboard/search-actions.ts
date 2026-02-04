
'use server'

import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'

interface TransactionRow {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string | null;
    items: Array<{ name: string; qty: number; price: number }> | null;
    bill_amount: number | null;
    paid_amount: number | null;
    created_at: string;
    customer_id: string | null;
    customers: { id: string; name: string; phone?: string | null; address?: string | null; cnic?: string | null } | Array<{ id: string; name: string; phone?: string | null; address?: string | null; cnic?: string | null }> | null;
}

interface BalanceRow {
    balance: number | null;
}

interface LowStockRow {
    quantity: number | null;
    low_stock_threshold: number | null;
}

interface TransactionAmountRow {
    amount: number | null;
}

interface TransactionCustomerRow {
    customer_id: string | null;
}

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
        .select('id, name, phone, address, cnic')
        .eq('user_id', session.userId)
        .or(`name.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%,cnic.ilike.%${sanitizedQuery}%`)
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
                name,
                phone,
                address,
                cnic
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
    return ((data as TransactionRow[] | null) || []).map((txn) => {
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

        const customerName = Array.isArray(txn.customers)
            ? txn.customers[0]?.name
            : txn.customers?.name;

        const customer = Array.isArray(txn.customers)
            ? txn.customers[0]
            : txn.customers;

        return {
            id: txn.id,
            customerName: customerName || 'Unknown Customer',
            customerId: txn.customer_id,
            customerPhone: customer?.phone || null,
            customerAddress: customer?.address || null,
            customerCnic: customer?.cnic || null,
            date: dateStr,
            time: timeStr,
            createdAt: txn.created_at,
            type: txn.type,
            amount: txn.amount,
            description: txn.description || (txn.type === 'credit' ? 'Purchase' : 'Payment'),
            items: txn.items,
            billAmount: txn.bill_amount,
            paidAmount: txn.paid_amount
        }
    })
}

export async function getDashboardStats() {
    const session = await getSession()
    if (!session) return null

    // Date calculations
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0) // Last day of previous month

    // Get total udhar (receivable) - sum of positive customer balances
    const { data: udharData } = await getDb()
        .from('customers')
        .select('balance')
        .eq('user_id', session.userId)
        .gt('balance', 0)

    const totalUdhar = ((udharData as BalanceRow[] | null) || []).reduce((sum, c) => sum + (c.balance || 0), 0)

    // Get total payable - sum of negative customer balances (we owe them)
    const { data: payableData } = await getDb()
        .from('customers')
        .select('balance')
        .eq('user_id', session.userId)
        .lt('balance', 0)

    const totalPayable = Math.abs(((payableData as BalanceRow[] | null) || []).reduce((sum, c) => sum + (c.balance || 0), 0))

    // Get low stock items count
    const { data: lowStockData } = await getDb()
        .from('inventory')
        .select('id, quantity, low_stock_threshold')
        .eq('user_id', session.userId)

    const lowStockCount = ((lowStockData as LowStockRow[] | null) || []).filter(
        (item) => (item.quantity || 0) <= (item.low_stock_threshold || 5)
    ).length

    // Get active customers count (customers with at least one transaction in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activeCustomersData } = await getDb()
        .from('transactions')
        .select('customer_id')
        .eq('user_id', session.userId)
        .gte('created_at', thirtyDaysAgo.toISOString())

    // Get unique customer IDs
    const uniqueCustomerIds = new Set(((activeCustomersData as TransactionCustomerRow[] | null) || []).map((t) => t.customer_id))
    const activeCustomersCount = uniqueCustomerIds.size

    // Get total customers count
    const { count: totalCustomers } = await getDb()
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.userId)

    // Calculate month-over-month trends
    // Get credit transactions this month (udhar given)
    const { data: thisMonthCredits } = await getDb()
        .from('transactions')
        .select('amount')
        .eq('user_id', session.userId)
        .eq('type', 'credit')
        .gte('created_at', startOfThisMonth.toISOString())

    const thisMonthUdhar = ((thisMonthCredits as TransactionAmountRow[] | null) || []).reduce((sum, t) => sum + (t.amount || 0), 0)

    // Get credit transactions last month
    const { data: lastMonthCredits } = await getDb()
        .from('transactions')
        .select('amount')
        .eq('user_id', session.userId)
        .eq('type', 'credit')
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString())

    const lastMonthUdhar = ((lastMonthCredits as TransactionAmountRow[] | null) || []).reduce((sum, t) => sum + (t.amount || 0), 0)

    // Calculate udhar trend percentage
    let udharTrend = 0
    if (lastMonthUdhar > 0) {
        udharTrend = Math.round(((thisMonthUdhar - lastMonthUdhar) / lastMonthUdhar) * 100)
    } else if (thisMonthUdhar > 0) {
        udharTrend = 100 // New activity this month
    }

    // Get new customers this month
    const { count: newCustomersThisMonth } = await getDb()
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.userId)
        .gte('created_at', startOfThisMonth.toISOString())

    return {
        totalUdhar,
        totalPayable,
        lowStockCount,
        activeCustomersCount: activeCustomersCount || totalCustomers || 0,
        udharTrend,
        newCustomersThisMonth: newCustomersThisMonth || 0
    }
}
