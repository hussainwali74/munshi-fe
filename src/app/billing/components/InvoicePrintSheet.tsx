import React from 'react';
import type { BillReceipt } from '../types';
import { formatCurrency } from '../utils';
import { formatCNIC } from '@/lib/utils';

interface InvoicePrintSheetProps {
    bill: BillReceipt;
    className?: string;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export default function InvoicePrintSheet({ bill, className, t }: InvoicePrintSheetProps) {
    const shopName = bill.shopDetails?.businessName || t('billing.invoice.shopNameFallback');
    const shopOwner = bill.shopDetails?.fullName;
    const shopPhone = bill.shopDetails?.shopPhone;
    const shopAddress = bill.shopDetails?.shopAddress;

    const createdDate = new Date(bill.createdAt);

    return (
        <div className={`bg-white text-black border border-slate-200 rounded-xl p-8 shadow-lg print:shadow-none print:border-none ${className || ''}`}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-slate-500">{t('billing.invoice.invoiceLabel')}</p>
                        <h1 className="text-2xl font-bold text-slate-900">{shopName}</h1>
                        {shopOwner && <p className="text-sm text-slate-600">{shopOwner}</p>}
                        {shopPhone && <p className="text-sm text-slate-600">{shopPhone}</p>}
                        {shopAddress && <p className="text-sm text-slate-600">{shopAddress}</p>}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">{t('billing.invoice.number')}</p>
                        <p className="text-xl font-bold text-slate-900">#{bill.billNumber}</p>
                        <p className="text-sm text-slate-500">{t('billing.invoice.date')}</p>
                        <p className="text-sm text-slate-700">{createdDate.toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.invoice.billTo')}</p>
                        <p className="text-lg font-semibold text-slate-900">{bill.customer.name}</p>
                        {bill.customer.phone && <p className="text-sm text-slate-700">{bill.customer.phone}</p>}
                        {bill.customer.address && <p className="text-sm text-slate-700">{bill.customer.address}</p>}
                        {bill.customer.cnic && <p className="text-sm text-slate-700">{formatCNIC(bill.customer.cnic)}</p>}
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.invoice.payment')}</p>
                        <p className="text-sm text-slate-700">{t('billing.paymentMode')}: {bill.paymentMode === 'cash' ? t('billing.cash') : t('billing.udharCredit')}</p>
                        <p className="text-sm text-slate-700">{t('billing.invoice.paid')}: {formatCurrency(bill.paidAmount)}</p>
                        {bill.paymentMode === 'credit' && (
                            <p className="text-sm text-slate-700">{t('billing.invoice.balance')}: {formatCurrency(Math.max(0, bill.totalAmount - bill.paidAmount))}</p>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">{t('billing.sr')}</th>
                                <th className="px-3 py-2 text-left">{t('billing.item')}</th>
                                <th className="px-3 py-2 text-right">{t('billing.qty')}</th>
                                <th className="px-3 py-2 text-right">{t('billing.rate')}</th>
                                <th className="px-3 py-2 text-right">{t('billing.total')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {bill.items.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                                    <td className="px-3 py-2 text-slate-900">{item.name}</td>
                                    <td className="px-3 py-2 text-right text-slate-700">{item.qty}</td>
                                    <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(item.price)}</td>
                                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatCurrency(item.price * item.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>{t('billing.subtotal')}</span>
                            <span>{formatCurrency(bill.subTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>{t('billing.discount')}</span>
                            <span>- {formatCurrency(bill.discountAmount)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                            <span>{t('billing.total')}</span>
                            <span>{formatCurrency(bill.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-slate-500 border-t border-dashed border-slate-200 pt-4">
                    {t('billing.invoice.thankYou')}
                </div>
            </div>
        </div>
    );
}
