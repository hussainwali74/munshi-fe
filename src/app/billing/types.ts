export interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    maxQty: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    cnic?: string;
}

export interface ShopDetails {
    businessName: string;
    fullName: string;
    shopPhone: string;
    shopAddress: string;
}

export type DiscountType = 'fixed' | 'percent';
export type PaymentMode = 'cash' | 'credit';

export interface BillReceipt {
    billNumber: string;
    createdAt: string;
    customer: Customer;
    items: CartItem[];
    shopDetails?: ShopDetails | null;
    subTotal: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    paymentMode: PaymentMode;
    transactionId?: string;
}
