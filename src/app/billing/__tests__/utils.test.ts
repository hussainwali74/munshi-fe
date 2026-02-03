import { calculateBillTotals, calculateBalanceDue } from '../utils';

const sampleItems = [
    { id: '1', name: 'Item A', price: 100, qty: 2, maxQty: 10 },
    { id: '2', name: 'Item B', price: 50, qty: 1, maxQty: 5 },
];

describe('billing utils', () => {
    it('calculates subtotal and fixed discount correctly', () => {
        const totals = calculateBillTotals(sampleItems, 'fixed', 30);
        expect(totals.subTotal).toBe(250);
        expect(totals.discountAmount).toBe(30);
        expect(totals.totalAmount).toBe(220);
    });

    it('calculates percent discount correctly', () => {
        const totals = calculateBillTotals(sampleItems, 'percent', 10);
        expect(totals.subTotal).toBe(250);
        expect(totals.discountAmount).toBe(25);
        expect(totals.totalAmount).toBe(225);
    });

    it('caps discount so total does not go negative', () => {
        const totals = calculateBillTotals(sampleItems, 'fixed', 1000);
        expect(totals.discountAmount).toBe(250);
        expect(totals.totalAmount).toBe(0);
    });

    it('calculates balance due for credit payments', () => {
        const balance = calculateBalanceDue(500, 200, 'credit');
        expect(balance).toBe(300);
    });

    it('returns zero balance for cash payments', () => {
        const balance = calculateBalanceDue(500, 0, 'cash');
        expect(balance).toBe(0);
    });
});
