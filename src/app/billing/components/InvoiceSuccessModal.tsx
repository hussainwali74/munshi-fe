import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import type { BillReceipt } from '../types';

interface InvoiceSuccessModalProps {
    bill: BillReceipt;
    onClose: () => void;
    children: React.ReactNode;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export default function InvoiceSuccessModal({ bill, onClose, children, t }: InvoiceSuccessModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:static print:inset-auto print:bg-transparent print:backdrop-blur-none">
            <div className="bg-surface rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 print:max-h-none print:overflow-visible">
                <div className="flex items-center justify-between p-4 border-b border-border print:hidden">
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
                    {children}
                </div>
            </div>
        </div>
    );
}
