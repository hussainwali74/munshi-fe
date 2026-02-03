import type { CartItem, DiscountType, PaymentMode } from './types';

export function calculateBillTotals(items: CartItem[], discountType: DiscountType, discountValue: number) {
    const subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const rawDiscount = discountType === 'percent'
        ? (subTotal * Math.max(0, discountValue)) / 100
        : Math.max(0, discountValue);
    const discountAmount = Math.min(subTotal, rawDiscount);
    const totalAmount = Math.max(0, subTotal - discountAmount);

    return { subTotal, discountAmount, totalAmount };
}

export function calculateBalanceDue(totalAmount: number, paidAmount: number, paymentMode: PaymentMode) {
    if (paymentMode !== 'credit') return 0;
    return Math.max(0, totalAmount - Math.max(0, paidAmount));
}

export function generateBillNumber() {
    const timestamp = Date.now().toString();
    return timestamp.slice(-6);
}

export function formatCurrency(value: number) {
    return `Rs ${Math.round(value).toLocaleString()}`;
}
