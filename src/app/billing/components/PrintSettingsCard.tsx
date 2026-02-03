import React from 'react';
import { FileText, Receipt } from 'lucide-react';

interface PrintSettingsCardProps {
    printFormat: 'a4' | 'thermal';
    autoPrint: boolean;
    onPrintFormatChange: (format: 'a4' | 'thermal') => void;
    onAutoPrintChange: (value: boolean) => void;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export default function PrintSettingsCard({
    printFormat,
    autoPrint,
    onPrintFormatChange,
    onAutoPrintChange,
    t,
}: PrintSettingsCardProps) {
    return (
        <div className="bg-surface rounded-xl p-6 shadow-md border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-3">{t('billing.printSettings')}</h3>
            <p className="text-sm text-text-secondary mb-4">{t('billing.printSettingsHelp')}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                    className={`rounded-xl border p-4 text-left transition-all ${printFormat === 'a4'
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border bg-background hover:border-primary/50'
                        }`}
                    onClick={() => onPrintFormatChange('a4')}
                    aria-pressed={printFormat === 'a4'}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-text-primary">{t('billing.printA4')}</p>
                            <p className="text-xs text-text-secondary">{t('billing.printA4Hint')}</p>
                        </div>
                    </div>
                </button>
                <button
                    className={`rounded-xl border p-4 text-left transition-all ${printFormat === 'thermal'
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border bg-background hover:border-primary/50'
                        }`}
                    onClick={() => onPrintFormatChange('thermal')}
                    aria-pressed={printFormat === 'thermal'}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Receipt size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-text-primary">{t('billing.printThermal')}</p>
                            <p className="text-xs text-text-secondary">{t('billing.printThermalHint')}</p>
                        </div>
                    </div>
                </button>
            </div>

            <button
                className={`w-full flex items-center justify-between rounded-xl border p-4 transition-all ${autoPrint
                    ? 'border-success bg-success/10'
                    : 'border-border bg-background'
                    }`}
                onClick={() => onAutoPrintChange(!autoPrint)}
                aria-pressed={autoPrint}
            >
                <div>
                    <p className="font-semibold text-text-primary">{t('billing.printAuto')}</p>
                    <p className="text-xs text-text-secondary">{t('billing.printAutoHelp')}</p>
                </div>
                <span className={`text-sm font-bold ${autoPrint ? 'text-success' : 'text-text-secondary'}`}>
                    {autoPrint ? t('billing.on') : t('billing.off')}
                </span>
            </button>
        </div>
    );
}
