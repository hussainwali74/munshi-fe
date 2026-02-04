'use client';

import type { ReactNode } from 'react';
import { getInvoiceRemaining, type InvoiceLike } from '@/lib/invoice-utils';

type InvoiceOption = InvoiceLike & {
    id: string;
    description?: string | null;
    date?: string | null;
};

interface ReceivePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
    isRtl?: boolean;
    invoices: InvoiceOption[];
    selectedInvoiceId: string;
    onSelectedInvoiceChange: (value: string) => void;
    fixedInvoiceId?: string | null;
    fixedInvoice?: InvoiceOption | null;
    paymentAmount: string;
    onPaymentAmountChange: (value: string) => void;
    paymentNotes: string;
    onPaymentNotesChange: (value: string) => void;
    onSubmit: (formData: FormData) => void;
    isSubmitting?: boolean;
    isInvoiceLoading?: boolean;
    formatInvoiceDate?: (dateValue: string) => string;
    topContent?: ReactNode;
    isSubmitDisabled?: boolean;
}

export default function ReceivePaymentModal({
    isOpen,
    onClose,
    t,
    isRtl = false,
    invoices,
    selectedInvoiceId,
    onSelectedInvoiceChange,
    fixedInvoiceId = null,
    fixedInvoice = null,
    paymentAmount,
    onPaymentAmountChange,
    paymentNotes,
    onPaymentNotesChange,
    onSubmit,
    isSubmitting = false,
    isInvoiceLoading = false,
    formatInvoiceDate,
    topContent,
    isSubmitDisabled = false,
}: ReceivePaymentModalProps) {
    if (!isOpen) return null;

    const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId)
        || (fixedInvoice && fixedInvoice.id === selectedInvoiceId ? fixedInvoice : null)
        || null;
    const isInvoiceLocked = Boolean(fixedInvoiceId);
    const lockedOptions = fixedInvoice ? [fixedInvoice] : invoices.filter((invoice) => invoice.id === fixedInvoiceId);
    const selectOptions = isInvoiceLocked ? lockedOptions : invoices;

    const buildInvoiceLabel = (invoice: InvoiceOption) => {
        const description = invoice.description || t('khata.purchaseUdhar') || 'Purchase (Udhar)';
        const dateValue = invoice.date ? (formatInvoiceDate ? formatInvoiceDate(invoice.date) : invoice.date) : '';
        const remaining = getInvoiceRemaining(invoice);
        const remainingLabel = t('khata.remainingDue') || 'Remaining due';
        return `${description}${dateValue ? ` • ${dateValue}` : ''} • ${remainingLabel}: Rs ${remaining.toLocaleString()}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-10">
                    <h2 className="text-xl font-bold">{t('khata.recordPayment') || 'Record Payment'}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        ✕
                    </button>
                </div>

                <form action={onSubmit} className="p-4 space-y-4">
                    {topContent}

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('khata.applyPaymentTo') || 'Apply payment to'}
                        </label>
                        <select
                            name="applyToTransactionId"
                            value={selectedInvoiceId}
                            onChange={(event) => onSelectedInvoiceChange(event.target.value)}
                            disabled={isInvoiceLocked}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {!isInvoiceLocked && (
                                <option value="">{t('khata.generalPayment') || 'General payment'}</option>
                            )}
                            {selectOptions.map((invoice) => (
                                <option key={invoice.id} value={invoice.id}>
                                    {buildInvoiceLabel(invoice)}
                                </option>
                            ))}
                        </select>
                        {isInvoiceLoading && (
                            <p className="text-xs text-text-secondary mt-1">
                                {t('common.loading') || 'Loading...'}
                            </p>
                        )}
                        {!isInvoiceLoading && selectOptions.length === 0 && (
                            <p className="text-xs text-text-secondary mt-1">
                                {t('khata.noOpenInvoices') || 'No open invoices/bills to apply.'}
                            </p>
                        )}
                        {selectedInvoice && (
                            <p className="text-xs text-text-secondary mt-1">
                                {t('khata.remainingDue') || 'Remaining due'}: Rs {getInvoiceRemaining(selectedInvoice).toLocaleString()}
                            </p>
                        )}
                        {isInvoiceLocked && (
                            <input type="hidden" name="applyToTransactionId" value={selectedInvoiceId} />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('khata.paymentAmount') || 'Payment Amount'} (Rs)</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="0.00"
                            value={paymentAmount}
                            onChange={(event) => onPaymentAmountChange(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t('khata.notes') || 'Notes'} ({t('common.optional') || 'Optional'})
                        </label>
                        <textarea
                            name="description"
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            rows={2}
                            placeholder={t('khata.paymentNotesPlaceholder') || 'Payment notes'}
                            value={paymentNotes}
                            onChange={(event) => onPaymentNotesChange(event.target.value)}
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || isSubmitDisabled}
                            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (t('common.loading') || 'Loading...') : (t('khata.recordPayment') || 'Record Payment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
