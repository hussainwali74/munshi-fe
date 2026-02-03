import React from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';
import type { BillReceipt } from '../types';

interface InvoiceSuccessModalProps {
    bill: BillReceipt;
    onClose: () => void;
    onPrint: () => void;
    children: React.ReactNode;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export default function InvoiceSuccessModal({ bill, onClose, onPrint, children, t }: InvoiceSuccessModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
            <div className="bg-surface rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-success" size={22} />
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">{t('billing.billCreated')}</h2>
                            <p className="text-sm text-text-secondary">{t('billing.invoice.ready', { number: bill.billNumber })}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors" aria-label={t('common.close')}>
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <button
                            onClick={onPrint}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white font-semibold shadow-md hover:bg-primary-dark transition-colors"
                        >
                            <Printer size={18} /> {t('billing.invoice.print')}
                        </button>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-text-primary font-semibold hover:bg-background transition-colors"
                        >
                            {t('billing.invoice.done')}
                        </button>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
