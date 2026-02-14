import { createBillReceiptFromTransaction } from './invoice-receipt';

describe('createBillReceiptFromTransaction', () => {
    it('maps a transaction with items into a bill receipt', () => {
        const receipt = createBillReceiptFromTransaction({
            id: 'tx-123456',
            type: 'credit',
            amount: 2500,
            bill_amount: 2000,
            paid_amount: 500,
            description: 'Bill #778899',
            customer_id: 'cust-1',
            customerName: 'Ali',
            customerPhone: '0300-0000000',
            customerAddress: 'Karachi',
            items: [
                { id: 'item-1', name: 'Pipe', qty: 2, price: 800, maxQty: 5 },
                { id: 'item-2', name: 'Tap', qty: 1, price: 900, maxQty: 2 }
            ]
        });

        expect(receipt.billNumber).toBe('778899');
        expect(receipt.totalAmount).toBe(2000);
        expect(receipt.paidAmount).toBe(500);
        expect(receipt.discountAmount).toBe(500);
        expect(receipt.customer.name).toBe('Ali');
        expect(receipt.items).toHaveLength(2);
    });

    it('creates a fallback item when transaction has no line items', () => {
        const receipt = createBillReceiptFromTransaction({
            id: 'tx-abcdef',
            type: 'debit',
            amount: 750,
            description: 'Payment received',
            customer_id: 'cust-2',
            customerName: 'Ahmed'
        });

        expect(receipt.items).toHaveLength(1);
        expect(receipt.items[0].name).toBe('Payment received');
        expect(receipt.items[0].price).toBe(750);
        expect(receipt.paymentMode).toBe('cash');
        expect(receipt.paidAmount).toBe(750);
    });
});
