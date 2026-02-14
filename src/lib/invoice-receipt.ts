import type { BillReceipt, CartItem, ShopDetails } from '@/app/billing/types';
import { getInvoicePaid, getInvoiceTotal } from '@/lib/invoice-utils';

type NullableString = string | null | undefined;

export interface InvoiceTransactionLike {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description?: NullableString;
    items?: unknown;
    billAmount?: number | null;
    bill_amount?: number | null;
    paidAmount?: number | null;
    paid_amount?: number | null;
    date?: string;
    createdAt?: string;
    created_at?: string;
    customerId?: NullableString;
    customer_id?: NullableString;
    customerName?: NullableString;
    customer_name?: NullableString;
    customerPhone?: NullableString;
    customer_phone?: NullableString;
    customerAddress?: NullableString;
    customer_address?: NullableString;
    customerCnic?: NullableString;
    customer_cnic?: NullableString;
}

interface InvoiceReceiptOptions {
    shopDetails?: ShopDetails | null;
    fallbackCustomer?: Partial<BillReceipt['customer']>;
    fallbackItemName?: string;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const asNumber = (value: unknown, fallback = 0) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
};

const asText = (value: unknown, fallback = '') => {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    return fallback;
};

const getTransactionBillNumber = (transactionId: string, description?: NullableString) => {
    const fromDescription = description?.match(/#([A-Za-z0-9-]+)/)?.[1];
    if (fromDescription) return fromDescription;
    return transactionId.slice(-6);
};

const getTransactionItems = (transactionId: string, value: unknown): CartItem[] => {
    if (!Array.isArray(value)) return [];

    return value
        .map((item, index) => {
            const record = asRecord(item);
            if (!record) return null;

            const qty = Math.max(1, asNumber(record.qty, 1));
            const price = Math.max(0, asNumber(record.price, 0));
            const name = asText(record.name, `Item ${index + 1}`);
            const rawMaxQty = asNumber(record.maxQty ?? record.max_qty, qty);
            const maxQty = Math.max(qty, rawMaxQty);
            const id = asText(record.id, `${transactionId}-item-${index + 1}`);

            return { id, name, price, qty, maxQty };
        })
        .filter((item): item is CartItem => item !== null);
};

export const createBillReceiptFromTransaction = (
    transaction: InvoiceTransactionLike,
    options: InvoiceReceiptOptions = {}
): BillReceipt => {
    const totalAmount = Math.max(0, getInvoiceTotal({
        amount: transaction.amount,
        bill_amount: transaction.bill_amount,
        billAmount: transaction.billAmount
    }));

    const paidFromTransaction = getInvoicePaid({
        paid_amount: transaction.paid_amount,
        paidAmount: transaction.paidAmount
    });
    const defaultPaid = transaction.type === 'debit' ? totalAmount : 0;
    const paidAmount = Math.min(totalAmount, Math.max(0, paidFromTransaction > 0 ? paidFromTransaction : defaultPaid));

    const itemsFromTransaction = getTransactionItems(transaction.id, transaction.items);
    const items = itemsFromTransaction.length > 0
        ? itemsFromTransaction
        : [{
            id: `${transaction.id}-line`,
            name: asText(transaction.description, options.fallbackItemName || 'Invoice item'),
            price: totalAmount,
            qty: 1,
            maxQty: 1
        }];

    let subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (subTotal < totalAmount) {
        subTotal = totalAmount;
    }
    const discountAmount = Math.max(0, subTotal - totalAmount);

    const fallbackCustomer = options.fallbackCustomer || {};

    return {
        billNumber: getTransactionBillNumber(transaction.id, transaction.description),
        createdAt: transaction.created_at || transaction.createdAt || transaction.date || new Date().toISOString(),
        customer: {
            id: transaction.customer_id || transaction.customerId || fallbackCustomer.id || 'unknown',
            name: transaction.customerName || transaction.customer_name || fallbackCustomer.name || 'Customer',
            phone: transaction.customerPhone || transaction.customer_phone || fallbackCustomer.phone || '',
            address: transaction.customerAddress || transaction.customer_address || fallbackCustomer.address || '',
            cnic: transaction.customerCnic || transaction.customer_cnic || fallbackCustomer.cnic
        },
        items,
        shopDetails: options.shopDetails || null,
        subTotal,
        discountAmount,
        totalAmount,
        paidAmount,
        paymentMode: transaction.type === 'credit' ? 'credit' : 'cash',
        transactionId: transaction.id
    };
};
