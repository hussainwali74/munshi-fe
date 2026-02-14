import { Printer } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BillReceipt } from '../types';
import InvoicePrintSheet from './InvoicePrintSheet';
import { createTranslator, type Translator } from '@/lib/translator';
import type { Language } from '@/lib/translations';

interface InvoiceDetailPanelProps {
    bill: BillReceipt;
    t: Translator;
    printFormat?: 'a4' | 'thermal';
    className?: string;
    actionSlot?: ReactNode;
}

export default function InvoiceDetailPanel({
    bill,
    t,
    printFormat = 'a4',
    className,
    actionSlot
}: InvoiceDetailPanelProps) {
    const tEn = createTranslator('en');
    const tUr = createTranslator('ur');

    const handlePrint = (lang: Language) => {
        if (typeof window === 'undefined') return;
        document.body.dataset.printLang = lang;
        window.print();
    };

    return (
        <div className={`space-y-6 ${className || ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => handlePrint('ur')}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white font-semibold shadow-md hover:bg-primary-dark transition-colors"
                    >
                        <Printer size={18} /> {t('billing.invoice.printUrdu')}
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePrint('en')}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-text-primary font-semibold hover:bg-background transition-colors"
                    >
                        <Printer size={18} /> {t('billing.invoice.printEnglish')}
                    </button>
                </div>
                {actionSlot}
            </div>

            <InvoicePrintSheet bill={bill} t={t} printFormat={printFormat} />

            <div className="invoice-print-root lang-en hidden print:block">
                <InvoicePrintSheet bill={bill} t={tEn} printFormat={printFormat} />
            </div>
            <div className="invoice-print-root lang-ur hidden print:block urdu-text" dir="rtl">
                <InvoicePrintSheet bill={bill} t={tUr} printFormat={printFormat} />
            </div>
        </div>
    );
}
