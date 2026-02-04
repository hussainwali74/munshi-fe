import React from 'react';
import type { BillReceipt } from '../types';
import { formatCurrency } from '../utils';
import { formatCNIC } from '@/lib/utils';

interface InvoicePrintSheetProps {
    bill: BillReceipt;
    className?: string;
    printFormat?: 'a4' | 'thermal';
    t: (key: string, options?: Record<string, string | number>) => string;
}

export default function InvoicePrintSheet({ bill, className, printFormat = 'a4', t }: InvoicePrintSheetProps) {
    const shopName = bill.shopDetails?.businessName || t('billing.invoice.shopNameFallback');
    const shopPhone = bill.shopDetails?.shopPhone;
    const shopAddress = bill.shopDetails?.shopAddress;

    const createdDate = new Date(bill.createdAt);
    const balance = Math.max(0, bill.totalAmount - bill.paidAmount);
    const isUdhar = bill.paymentMode === 'credit' && balance > 0;
    const statusLabel = isUdhar
        ? t('billing.invoice.udharStatus', { amount: formatCurrency(balance) })
        : t('billing.invoice.paidStatus');
    const isThermal = printFormat === 'thermal';

    const logoText = shopName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase())
        .join('');

    const containerClass = isThermal
        ? 'invoice-sheet invoice-sheet-thermal max-w-[360px] text-[12px]'
        : 'invoice-sheet invoice-sheet-a4 max-w-[860px]';

    if (isThermal) {
        return (
            <div className={`bg-white text-black border border-slate-200 ${isThermal ? 'p-5' : 'p-8'} mx-auto ${containerClass} ${className || ''}`}>
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{shopName}</p>
                        {shopAddress && <p className="text-xs text-slate-500">{shopAddress}</p>}
                        {shopPhone && <p className="text-xs text-slate-500">{shopPhone}</p>}
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-600">
                        <span>{t('billing.invoice.number')}: #{bill.billNumber}</span>
                        <span>{t('billing.invoice.date')}: {createdDate.toLocaleDateString()}</span>
                    </div>

                    <div className="border-t border-slate-300" />

                    <div className="text-[11px]">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">{t('billing.invoice.billTo')}</p>
                        <p className="text-sm font-semibold text-slate-900">{bill.customer.name}</p>
                        {bill.customer.phone && <p className="text-slate-600">{bill.customer.phone}</p>}
                    </div>

                    <div className="text-[11px] text-slate-700">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">{t('billing.invoice.paymentStatus')}</p>
                        <p className="font-semibold text-slate-900">{statusLabel}</p>
                    </div>

                    <table className="w-full text-[11px]">
                        <thead className="border-y border-slate-200 text-slate-500">
                            <tr>
                                <th className="py-2 text-left">{t('billing.item')}</th>
                                <th className="py-2 text-center">{t('billing.qty')}</th>
                                <th className="py-2 text-right">{t('billing.total')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bill.items.map(item => (
                                <tr key={item.id}>
                                    <td className="py-2 text-slate-900">{item.name}</td>
                                    <td className="py-2 text-center text-slate-700">{item.qty}</td>
                                    <td className="py-2 text-right text-slate-900">{formatCurrency(item.price * item.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-t border-slate-300 pt-3 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-600">
                            <span>{t('billing.subtotal')}</span>
                            <span>{formatCurrency(bill.subTotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>{t('billing.discount')}</span>
                            <span>- {formatCurrency(bill.discountAmount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-slate-900">
                            <span>{t('billing.total')}</span>
                            <span>{formatCurrency(bill.totalAmount)}</span>
                        </div>
                    </div>

                    <p className="text-center text-[10px] text-slate-500 border-t border-dashed border-slate-200 pt-3">
                        {t('billing.invoice.thankYou')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white text-black border border-transparent ${isThermal ? 'p-5' : 'p-10'} mx-auto ${containerClass} ${className || ''}`}>
            <div className="space-y-8">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-slate-700 text-white flex items-center justify-center text-lg font-semibold">
                            {logoText || 'S'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{shopName}</p>
                            {shopAddress && <p className="text-xs text-slate-500">{shopAddress}</p>}
                            {shopPhone && <p className="text-xs text-slate-500">{shopPhone}</p>}
                        </div>
                    </div>
                    <div className="text-right text-sm text-slate-700">
                        <p className="font-semibold">{t('billing.invoice.number')} #{bill.billNumber}</p>
                        <p className="text-xs text-slate-500">{t('billing.invoice.date')}</p>
                        <p className="text-xs text-slate-700">{createdDate.toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="border-t-2 border-slate-300" />

                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">{shopName}</h1>
                    <p className="text-sm text-slate-500">{t('billing.invoice.message')}</p>
                </div>

                <div className="grid gap-8 sm:grid-cols-3 text-sm">
                    <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.invoice.billTo')}</p>
                        <p className="font-semibold text-slate-900 mt-2">{bill.customer.name}</p>
                        {bill.customer.phone && <p className="text-slate-600">{bill.customer.phone}</p>}
                        {bill.customer.address && <p className="text-slate-600">{bill.customer.address}</p>}
                        {bill.customer.cnic && <p className="text-slate-600">{formatCNIC(bill.customer.cnic)}</p>}
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.invoice.details')}</p>
                        <p className="mt-2 text-slate-600">{t('billing.items')}: {bill.items.length}</p>
                        <p className="text-slate-600">{t('billing.discount')}: {formatCurrency(bill.discountAmount)}</p>
                        <p className="text-slate-600">{t('billing.total')}: {formatCurrency(bill.totalAmount)}</p>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.invoice.payment')}</p>
                        <p className="mt-2 text-slate-600">{t('billing.paymentMode')}: {bill.paymentMode === 'cash' ? t('billing.cash') : t('billing.udharCredit')}</p>
                        <p className="text-slate-600">{t('billing.invoice.paid')}: {formatCurrency(bill.paidAmount)}</p>
                        {bill.paymentMode === 'credit' && (
                            <p className="text-slate-600">{t('billing.invoice.balance')}: {formatCurrency(balance)}</p>
                        )}
                        <p className="mt-1 text-slate-700 font-semibold">{t('billing.invoice.paymentStatus')}: {statusLabel}</p>
                    </div>
                </div>

                <div className="border-t border-slate-200" />

                <table className="w-full text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="py-3 text-left">{t('billing.item')}</th>
                            <th className="py-3 text-center">{t('billing.qty')}</th>
                            <th className="py-3 text-right">{t('billing.price')}</th>
                            <th className="py-3 text-right">{t('billing.total')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bill.items.map(item => (
                            <tr key={item.id}>
                                <td className="py-4 text-slate-900">{item.name}</td>
                                <td className="py-4 text-center text-slate-600">{item.qty}</td>
                                <td className="py-4 text-right text-slate-600">{formatCurrency(item.price)}</td>
                                <td className="py-4 text-right text-slate-900">{formatCurrency(item.price * item.qty)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

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
                        <div className="flex justify-between text-base font-semibold text-slate-900 border-t border-slate-200 pt-3">
                            <span>{t('billing.invoice.totalDue')}</span>
                            <span>{formatCurrency(bill.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-slate-500 border-t border-slate-200 pt-6 flex justify-between">
                    <span>{t('billing.invoice.thankYou')}</span>
                    <span>{t('billing.invoice.page')} 1</span>
                </div>
            </div>
        </div>
    );
}
