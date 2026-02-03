import React from 'react';
import { render, screen } from '@testing-library/react';
import InvoicePrintSheet from '../components/InvoicePrintSheet';
import type { BillReceipt } from '../types';

const t = (key: string, vars?: Record<string, string | number>) => {
    const map: Record<string, string> = {
        'billing.invoice.invoiceLabel': 'Invoice',
        'billing.invoice.number': 'Invoice No.',
        'billing.invoice.date': 'Date',
        'billing.invoice.billTo': 'Bill To',
        'billing.invoice.payment': 'Payment',
        'billing.invoice.paid': 'Paid',
        'billing.invoice.balance': 'Balance',
        'billing.invoice.thankYou': 'Thank you',
        'billing.paymentMode': 'Payment Mode',
        'billing.cash': 'Cash',
        'billing.udharCredit': 'Udhar',
        'billing.subtotal': 'Subtotal',
        'billing.discount': 'Discount',
        'billing.total': 'Total',
        'billing.sr': 'Sr',
        'billing.item': 'Item',
        'billing.qty': 'Qty',
        'billing.rate': 'Rate',
        'billing.invoice.shopNameFallback': 'Your Shop',
    };

    const value = map[key] || key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
};

const sampleBill: BillReceipt = {
    billNumber: '123456',
    createdAt: '2024-10-10T10:00:00Z',
    customer: {
        id: 'cust-1',
        name: 'Ahmad Ali',
        phone: '0300-1234567',
        address: 'Main Bazaar',
    },
    items: [
        { id: 'item-1', name: 'Soap', price: 120, qty: 2, maxQty: 10 },
    ],
    shopDetails: {
        businessName: 'Bismillah Store',
        fullName: 'Hussain',
        shopPhone: '0300-0000000',
        shopAddress: 'Shop #12',
    },
    subTotal: 240,
    discountAmount: 20,
    totalAmount: 220,
    paidAmount: 220,
    paymentMode: 'cash',
};

describe('InvoicePrintSheet', () => {
    it('renders invoice details', () => {
        render(<InvoicePrintSheet bill={sampleBill} t={t} />);

        expect(screen.getByText('Invoice')).toBeInTheDocument();
        expect(screen.getByText('#123456')).toBeInTheDocument();
        expect(screen.getByText('Ahmad Ali')).toBeInTheDocument();
        expect(screen.getByText('Soap')).toBeInTheDocument();
        expect(screen.getAllByText('Rs 220').length).toBeGreaterThan(0);
    });
});
