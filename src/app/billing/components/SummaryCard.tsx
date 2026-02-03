import React from 'react';
import { Calculator, Save } from 'lucide-react';
import type { DiscountType, PaymentMode } from '../types';
import { formatCurrency } from '../utils';

interface SummaryCardProps {
    subTotal: number;
    discountAmount: number;
    totalAmount: number;
    discountType: DiscountType;
    discountValue: number;
    paidAmount: number;
    paymentMode: PaymentMode;
    balanceDue: number;
    isSubmitting: boolean;
    canSubmit: boolean;
    onDiscountTypeChange: (value: DiscountType) => void;
    onDiscountValueChange: (value: number) => void;
    onPaymentModeChange: (value: PaymentMode) => void;
    onPaidAmountChange: (value: number) => void;
    onSubmit: () => void;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export default function SummaryCard({
    subTotal,
    discountAmount,
    totalAmount,
    discountType,
    discountValue,
    paidAmount,
    paymentMode,
    balanceDue,
    isSubmitting,
    canSubmit,
    onDiscountTypeChange,
    onDiscountValueChange,
    onPaymentModeChange,
    onPaidAmountChange,
    onSubmit,
    t,
}: SummaryCardProps) {
    return (
        <div className="bg-surface rounded-xl p-6 shadow-md border border-border sticky top-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calculator size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                {t('billing.summary')}
            </h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-text-secondary">
                    <span>{t('billing.subtotal')}</span>
                    <span className="font-medium text-text-primary">{formatCurrency(subTotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-text-secondary">{t('billing.discount')}</span>
                    <div className="flex items-center gap-2">
                        <select
                            className="p-1.5 rounded-lg border border-border text-sm bg-background text-text-primary focus:border-primary outline-none"
                            value={discountType}
                            onChange={(e) => onDiscountTypeChange(e.target.value as DiscountType)}
                        >
                            <option value="fixed">Rs</option>
                            <option value="percent">%</option>
                        </select>
                        <input
                            type="number"
                            className="w-20 p-1.5 rounded-lg border border-border text-right text-sm bg-background text-text-primary focus:border-primary outline-none"
                            value={discountValue}
                            onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
                            min="0"
                        />
                    </div>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-success text-sm bg-success/10 p-2 rounded-lg">
                        <span>{t('billing.discountApplied')}</span>
                        <span className="font-medium">- {formatCurrency(discountAmount)}</span>
                    </div>
                )}

                <div className="border-t border-border pt-4 flex justify-between font-bold text-xl">
                    <span>{t('billing.total')}</span>
                    <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-text-primary">{t('billing.paymentMode')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            className={`p-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 ${paymentMode === 'cash'
                                ? 'bg-success text-white border-success shadow-lg shadow-success/25'
                                : 'bg-background border-border text-text-secondary hover:border-success hover:text-success'
                                }`}
                            onClick={() => onPaymentModeChange('cash')}
                        >
                            💵 {t('billing.cash')}
                        </button>
                        <button
                            className={`p-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 ${paymentMode === 'credit'
                                ? 'bg-warning text-white border-warning shadow-lg shadow-warning/25'
                                : 'bg-background border-border text-text-secondary hover:border-warning hover:text-warning'
                                }`}
                            onClick={() => onPaymentModeChange('credit')}
                        >
                            📝 {t('billing.udharCredit')}
                        </button>
                    </div>
                </div>

                {paymentMode === 'credit' && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                        <label className="block text-sm font-semibold mb-2 text-text-primary">{t('billing.paidAmount')}</label>
                        <input
                            type="number"
                            className="w-full p-3.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text-primary"
                            value={paidAmount}
                            onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                            min="0"
                            max={totalAmount}
                        />
                        {balanceDue > 0 && (
                            <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                <p className="text-sm text-warning font-medium flex items-center justify-between">
                                    <span>{t('billing.remainingUdhar')}</span>
                                    <span className="text-lg font-bold">{formatCurrency(balanceDue)}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <button
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                    onClick={onSubmit}
                    disabled={!canSubmit || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {t('billing.processing')}
                        </>
                    ) : (
                        <>
                            <Save size={20} /> {t('billing.createBill')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
