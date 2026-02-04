'use client';

import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Pencil, Printer, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getTransactionById, updateTransaction } from '../../../actions';
import { useLanguage } from '@/context/LanguageContext';

interface Transaction {
    id: string;
    customer_id: string;
    date: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    items?: { name: string; qty: number; price: number }[];
    bill_amount?: number;
    paid_amount?: number;
}

interface Customer {
    id: string;
    name: string;
    phone?: string;
    address?: string;
    balance: number;
}

interface TransactionPayload {
    transaction: Transaction;
    customer: Customer | null;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toDateInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string; transactionId: string }> }) {
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';
    const { id, transactionId } = use(params);

    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState({
        amount: '',
        description: '',
        date: '',
        billAmount: '',
        paidAmount: ''
    });

    const inputClassName =
        'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

    const loadTransaction = useCallback(async () => {
        setLoading(true);
        const data = (await getTransactionById(transactionId)) as TransactionPayload | null;
        if (!data?.transaction) {
            setTransaction(null);
            setCustomer(null);
            setLoading(false);
            return;
        }

        if (data.transaction.customer_id !== id) {
            setTransaction(null);
            setCustomer(null);
            setLoading(false);
            return;
        }

        setTransaction(data.transaction);
        setCustomer(data.customer);
        setFormState({
            amount: data.transaction.amount?.toString() ?? '',
            description: data.transaction.description ?? '',
            date: toDateInput(data.transaction.date),
            billAmount: data.transaction.bill_amount?.toString() ?? '',
            paidAmount: data.transaction.paid_amount?.toString() ?? ''
        });
        setLoading(false);
    }, [id, transactionId]);

    useEffect(() => {
        loadTransaction();
    }, [loadTransaction]);

    const resetForm = () => {
        if (!transaction) return;
        setFormState({
            amount: transaction.amount?.toString() ?? '',
            description: transaction.description ?? '',
            date: toDateInput(transaction.date),
            billAmount: transaction.bill_amount?.toString() ?? '',
            paidAmount: transaction.paid_amount?.toString() ?? ''
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!transaction) return;

        try {
            const formData = new FormData();
            formData.append('transactionId', transaction.id);
            formData.append('type', transaction.type);
            formData.append('amount', formState.amount);
            formData.append('description', formState.description);
            formData.append('date', formState.date);

            if (transaction.type === 'credit') {
                formData.append('billAmount', formState.billAmount);
                formData.append('paidAmount', formState.paidAmount);
            }

            await updateTransaction(formData);
            toast.success(t('khata.transactionUpdated') || 'Transaction updated');
            setIsEditing(false);
            await loadTransaction();
        } catch (error) {
            console.error('Update transaction error:', error);
            toast.error(t('khata.transactionUpdateFailed') || 'Failed to update transaction');
        }
    };

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                <div className="h-32 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-48 rounded-xl bg-gray-200 animate-pulse" />
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">{t('khata.transactionNotFound') || 'Transaction Not Found'}</h2>
                <p className="text-text-secondary mb-6">{t('khata.transactionNotFoundDesc') || 'This transaction does not exist or has been deleted.'}</p>
                <Link href={`/khata/${id}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                    <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} /> {t('khata.backToCustomer') || 'Back to Customer'}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <Link href={`/khata/${id}`} className={`flex items-center gap-2 text-primary hover:underline ${isRtl ? 'flex-row-reverse' : ''}`}>
                <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} /> {t('khata.backToCustomer') || 'Back to Customer'}
            </Link>

            <div className="bg-surface rounded-xl p-6 shadow-md border border-border print-root">
                <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
                    <div>
                        <h1 className="text-2xl font-bold mb-1">{t('khata.transactionDetails') || 'Transaction Details'}</h1>
                        {customer && (
                            <p className="text-sm text-text-secondary">
                                {t('khata.customer') || 'Customer'}: <span className="font-semibold text-text-primary">{customer.name}</span>
                            </p>
                        )}
                    </div>
                    <div className={`flex items-center gap-2 ${isRtl ? 'sm:flex-row-reverse' : ''} print:hidden`}>
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    resetForm();
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary hover:bg-background"
                            >
                                <X size={16} />
                                {t('common.cancel') || 'Cancel'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary hover:bg-background"
                            >
                                <Pencil size={16} />
                                {t('common.edit') || 'Edit'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                        >
                            <Printer size={16} />
                            {t('common.print') || 'Print'}
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 rounded-xl border border-border bg-background/30 p-4 md:grid-cols-3">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-text-secondary">{t('khata.type') || 'Type'}</p>
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${transaction.type === 'credit' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                            {transaction.type === 'credit' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            {transaction.type === 'credit' ? (t('khata.purchaseUdhar') || 'Purchase (Udhar)') : (t('khata.paymentReceived') || 'Payment Received')}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-text-secondary">{t('khata.amount') || 'Amount'}</p>
                        <p className={`text-xl font-bold ${transaction.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                            {transaction.type === 'credit' ? '+' : '-'} Rs {transaction.amount.toLocaleString()}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-text-secondary">{t('khata.date') || 'Date'}</p>
                        <p className="text-sm font-semibold text-text-primary">{formatDate(transaction.date)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-secondary">{t('khata.amount') || 'Amount'} (Rs)</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formState.amount}
                                    onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
                                    className={inputClassName}
                                    required
                                />
                            ) : (
                                <p className="text-sm font-semibold text-text-primary">Rs {transaction.amount.toLocaleString()}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-secondary">{t('khata.date') || 'Date'}</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    dir="ltr"
                                    value={formState.date}
                                    onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                                    className={inputClassName}
                                    required
                                />
                            ) : (
                                <p className="text-sm font-semibold text-text-primary">{formatDate(transaction.date)}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-text-secondary">{t('khata.description') || 'Description'}</label>
                        {isEditing ? (
                            <textarea
                                rows={3}
                                value={formState.description}
                                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                                className={`${inputClassName} resize-none`}
                                placeholder={t('khata.descriptionPlaceholder') || 'Describe this transaction'}
                            />
                        ) : (
                            <p className="text-sm font-semibold text-text-primary">{transaction.description || (t('khata.noDescription') || 'No description')}</p>
                        )}
                    </div>

                    {transaction.type === 'credit' && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-secondary">{t('khata.billTotal') || 'Bill Total'} (Rs)</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formState.billAmount}
                                        onChange={(event) => setFormState((prev) => ({ ...prev, billAmount: event.target.value }))}
                                        className={inputClassName}
                                    />
                                ) : (
                                    <p className="text-sm font-semibold text-text-primary">Rs {transaction.bill_amount?.toLocaleString() ?? '-'}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-secondary">{t('khata.paid') || 'Paid'} (Rs)</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formState.paidAmount}
                                        onChange={(event) => setFormState((prev) => ({ ...prev, paidAmount: event.target.value }))}
                                        className={inputClassName}
                                    />
                                ) : (
                                    <p className="text-sm font-semibold text-text-primary">Rs {transaction.paid_amount?.toLocaleString() ?? '-'}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {transaction.items && transaction.items.length > 0 && (
                        <div className="rounded-xl border border-border bg-background/40 p-4">
                            <p className="text-xs font-semibold text-text-secondary mb-3">{t('khata.items') || 'Items'}</p>
                            <div className="space-y-2">
                                {transaction.items.map((item, idx) => (
                                    <div key={idx} className={`flex justify-between text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <span>
                                            {item.name} × {item.qty}
                                        </span>
                                        <span className="font-semibold">Rs {(item.price * item.qty).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isEditing && (
                        <div className={`flex items-center gap-2 pt-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                            >
                                <Save size={16} />
                                {t('common.save') || 'Save changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    resetForm();
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary hover:bg-background"
                            >
                                <X size={16} />
                                {t('common.cancel') || 'Cancel'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
