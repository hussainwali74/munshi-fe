export type InvoiceLike = {
    amount?: number | null;
    bill_amount?: number | null;
    paid_amount?: number | null;
    billAmount?: number | null;
    paidAmount?: number | null;
};

const toNumber = (value: number | null | undefined) => (typeof value === 'number' ? value : 0);

export const getInvoiceTotal = (invoice: InvoiceLike) =>
    toNumber(invoice.bill_amount ?? invoice.billAmount ?? invoice.amount);

export const getInvoicePaid = (invoice: InvoiceLike) =>
    toNumber(invoice.paid_amount ?? invoice.paidAmount ?? 0);

export const getInvoiceRemaining = (invoice: InvoiceLike) =>
    Math.max(0, getInvoiceTotal(invoice) - getInvoicePaid(invoice));
