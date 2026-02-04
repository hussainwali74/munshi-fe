'use client';

import { ArrowLeft, Phone, MapPin, ArrowUpRight, ArrowDownLeft, ShoppingBag, User, Calendar, FileText, Printer } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use, useCallback, useMemo } from 'react';
import { addTransaction, getCustomerById } from '../actions';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';

interface Transaction {
    id: string;
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
    phone: string;
    address: string;
    balance: number;
    transactions: Transaction[];
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'purchase' | 'payment'>('purchase');
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const inputClassName =
        'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

    const actionButtonBase =
        'flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2';

    const purchaseButtonClass = `${actionButtonBase} bg-gradient-to-r from-primary to-primary-dark text-white shadow-md hover:brightness-110 focus:ring-primary/40`;
    const paymentButtonClass = `${actionButtonBase} border border-secondary/40 bg-secondary/10 text-secondary shadow-sm hover:bg-secondary/20 focus:ring-secondary/30`;

    // Unwrap params Promise
    const { id } = use(params);

    const fetchCustomer = useCallback(async () => {
        setLoading(true);
        const data = await getCustomerById(id);
        setCustomer(data);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    const handleSubmitTransaction = async (formData: FormData) => {
        try {
            formData.append('customerId', id);
            formData.append('type', transactionType === 'purchase' ? 'credit' : 'debit');
            await addTransaction(formData);
            toast.success(transactionType === 'purchase' ? t('khata.purchaseAdded') : t('khata.paymentRecorded'));
            setIsModalOpen(false);
            await fetchCustomer(); // Refresh the data
        } catch (error) {
            console.error('Transaction error:', error);
            toast.error(t('khata.addTransactionFailed'));
        }
    };

    const appTimeZone = 'Asia/Karachi';

    const toDateKey = (value: Date | string) => {
        const date = typeof value === 'string' ? new Date(value) : value;
        if (Number.isNaN(date.getTime())) return '';
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: appTimeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(date);
        const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
        return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: appTimeZone
        }).format(date);
    };

    const formatDateKey = (dateKey: string) => {
        if (!dateKey) return '';
        const [year, month, day] = dateKey.split('-').map(Number);
        if (!year || !month || !day) return dateKey;
        const date = new Date(Date.UTC(year, month - 1, day, 12));
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: appTimeZone
        }).format(date);
    };

    const applyQuickFilter = (key: 'today' | 'week' | 'last30' | 'month' | 'all') => {
        const now = new Date();
        if (key === 'all') {
            setStartDate('');
            setEndDate('');
            return;
        }

        const end = toDateKey(now);
        let start = end;

        if (key === 'week') {
            const startDateValue = new Date(now);
            startDateValue.setDate(startDateValue.getDate() - 6);
            start = toDateKey(startDateValue);
        }

        if (key === 'last30') {
            const startDateValue = new Date(now);
            startDateValue.setDate(startDateValue.getDate() - 29);
            start = toDateKey(startDateValue);
        }

        if (key === 'month') {
            const todayKey = toDateKey(now);
            const [year, month] = todayKey.split('-');
            start = `${year}-${month}-01`;
        }

        if (key === 'today') {
            start = end;
        }

        setStartDate(start);
        setEndDate(end);
    };

    const hasFilters = Boolean(startDate || endDate);

    const filteredTransactions = useMemo(() => {
        if (!customer?.transactions) return [];
        return customer.transactions.filter((txn) => {
            const txnKey = toDateKey(txn.date);
            if (!txnKey) return !hasFilters;
            if (startDate && txnKey < startDate) return false;
            if (endDate && txnKey > endDate) return false;
            return true;
        });
    }, [customer?.transactions, startDate, endDate, hasFilters]);

    const rangeLabel = useMemo(() => {
        if (!hasFilters) return t('khata.filterAll') || 'All';
        if (startDate && endDate) {
            if (startDate === endDate) {
                return formatDateKey(startDate);
            }
            return `${formatDateKey(startDate)} - ${formatDateKey(endDate)}`;
        }
        if (startDate) return `${t('khata.from') || 'From'} ${formatDateKey(startDate)}`;
        if (endDate) return `${t('khata.to') || 'To'} ${formatDateKey(endDate)}`;
        return t('khata.filterAll') || 'All';
    }, [endDate, hasFilters, startDate, t]);

    const isQuickFilterActive = (start: string, end: string) => startDate === start && endDate === end;

    if (loading) {
        return (
            <>
                {/* Back link skeleton */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Customer Header Skeleton */}
                <div className="bg-surface rounded-xl p-6 shadow-md border border-border mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                            <div className="space-y-2">
                                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse ml-auto" />
                            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse ml-auto" />
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse ml-auto" />
                        </div>
                    </div>
                    <div className="flex gap-3 border-t border-border pt-4">
                        <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                </div>

                {/* Transaction History Skeleton */}
                <div className="bg-surface rounded-xl p-6 shadow-md border border-border">
                    <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-4 rounded-lg border border-border">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                                        <div className="space-y-2">
                                            <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
                                            <div className="w-40 h-3 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <div className="w-20 h-5 bg-gray-200 rounded animate-pulse ml-auto" />
                                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse ml-auto" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    if (!customer) {
        return (
            <>
                <div className="text-center py-12">
                    <User size={48} className="mx-auto text-text-secondary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{t('khata.customerNotFound') || 'Customer Not Found'}</h2>
                    <p className="text-text-secondary mb-6">{t('khata.customerNotFoundDesc') || 'This customer does not exist or has been deleted.'}</p>
                    <Link href="/khata" className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft size={20} /> {t('khata.backToKhata') || 'Back to Khata'}
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Link href="/khata" className={`flex items-center gap-2 text-primary mb-4 hover:underline ${isRtl ? 'flex-row-reverse' : ''}`}>
                <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} /> {t('khata.backToKhata') || 'Back to Khata'}
            </Link>

            {/* Customer Header */}
            <div className="bg-surface rounded-xl p-6 shadow-md border border-border mb-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-start justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-primary bg-primary/10">
                            <span className="text-2xl font-bold">{customer.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{customer.name}</h1>
                            <div className="flex flex-col gap-1 text-sm text-text-secondary">
                                {customer.phone && (
                                    <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <Phone size={14} /> <span dir="ltr">{customer.phone}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <MapPin size={14} /> {customer.address}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={isRtl ? 'text-left' : 'text-right'}>
                        <p className="text-sm text-text-secondary mb-1">{t('khata.currentBalance') || 'Current Balance'}</p>
                        <p className={`text-3xl font-bold ${customer.balance > 0 ? 'text-danger' : customer.balance < 0 ? 'text-success' : 'text-text-secondary'}`}>
                            Rs {Math.abs(customer.balance).toLocaleString()}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                            {customer.balance > 0 ? (t('khata.udharDesc') || 'Udhar (Customer Owes)') : customer.balance < 0 ? (t('khata.advanceDesc') || 'Advance (Shop Owes)') : (t('khata.settled') || 'Settled')}
                        </p>
                    </div>
                </div>

                <div className={`flex gap-3 border-t border-border pt-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Link
                        href={`/billing?customerId=${customer.id}`}
                        className={purchaseButtonClass}
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                            <ShoppingBag size={18} />
                        </span>
                        <span>{t('khata.addPurchase') || 'Add Purchase (Udhar)'}</span>
                    </Link>
                    <button
                        className={paymentButtonClass}
                        onClick={() => {
                            setTransactionType('payment');
                            setIsModalOpen(true);
                        }}
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20">
                            <ArrowDownLeft size={18} />
                        </span>
                        <span>{t('khata.recordPayment') || 'Record Payment'}</span>
                    </button>
                </div>
            </div>

            {/* Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-10">
                            <h2 className="text-xl font-bold">
                                {transactionType === 'purchase' ? (t('khata.addPurchase') || 'Add Purchase (Udhar)') : (t('khata.recordPayment') || 'Record Payment')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                                ✕
                            </button>
                        </div>

                        <form action={handleSubmitTransaction} className="p-4 space-y-4">
                            <input type="hidden" name="customerId" value={customer.id} />

                            {transactionType === 'purchase' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.totalBillAmount') || 'Total Bill Amount'} (Rs)</label>
                                        <input name="billAmount" type="number" step="0.01" required className={inputClassName} placeholder="0.00" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.amountPaidNow') || 'Amount Paid Now'} (Rs)</label>
                                        <input name="paidAmount" type="number" step="0.01" className={inputClassName} placeholder="0.00" defaultValue="0" />
                                        <p className="text-xs text-text-secondary mt-1">{t('khata.remainingAddedToUdhar') || 'The remaining amount will be added to Udhar'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.description') || 'Description'}</label>
                                        <textarea name="description" className={`${inputClassName} resize-none`} rows={2} placeholder={t('khata.descriptionPlaceholder') || 'e.g. Plumbing items, Sanitary goods'}></textarea>
                                    </div>

                                    <input type="hidden" name="amount" value="0" />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.paymentAmount') || 'Payment Amount'} (Rs)</label>
                                        <input name="amount" type="number" step="0.01" required className={inputClassName} placeholder="0.00" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.notes') || 'Notes'} ({t('common.optional') || 'Optional'})</label>
                                        <textarea name="description" className={`${inputClassName} resize-none`} rows={2} placeholder={t('khata.paymentNotesPlaceholder') || 'Payment notes'}></textarea>
                                    </div>
                                </>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    {transactionType === 'purchase' ? (t('khata.addPurchase') || 'Add Purchase') : (t('khata.recordPayment') || 'Record Payment')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="bg-surface rounded-xl p-6 shadow-md border border-border print-root" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
                    <div>
                        <h2 className="text-xl font-bold">{t('khata.transactionHistory') || 'Transaction History'}</h2>
                        <p className="text-sm text-text-secondary">
                            {t('khata.totalTransactions') || 'Total transactions'}: {filteredTransactions.length}
                            {hasFilters ? ` / ${customer.transactions.length}` : ''}
                        </p>
                        <p className="hidden print:block text-xs text-text-secondary mt-1">
                            {t('khata.dateRange') || 'Date range'}: {rangeLabel}
                        </p>
                    </div>
                    <div className={`flex flex-wrap items-end gap-3 ${isRtl ? 'justify-end' : 'justify-start'} print:hidden`}>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-secondary">{t('khata.from') || 'From'}</span>
                            <div className="relative">
                                <Calendar size={14} className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-text-secondary`} />
                                <input
                                    type="date"
                                    dir="ltr"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                    className={`${inputClassName} ${isRtl ? 'pr-9' : 'pl-9'} w-[150px]`}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-secondary">{t('khata.to') || 'To'}</span>
                            <div className="relative">
                                <Calendar size={14} className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-text-secondary`} />
                                <input
                                    type="date"
                                    dir="ltr"
                                    value={endDate}
                                    onChange={(event) => setEndDate(event.target.value)}
                                    className={`${inputClassName} ${isRtl ? 'pr-9' : 'pl-9'} w-[150px]`}
                                />
                            </div>
                        </div>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className="h-9 rounded-lg border border-border px-3 text-xs font-semibold text-text-secondary transition hover:text-text-primary hover:bg-background"
                            >
                                {t('common.clear') || 'Clear'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.print();
                                }
                            }}
                            className="h-9 inline-flex items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                        >
                            <Printer size={14} />
                            {t('khata.printList') || 'Print list'}
                        </button>
                    </div>
                </div>

                <div className={`flex flex-wrap gap-2 mb-4 print:hidden ${isRtl ? 'justify-end' : 'justify-start'}`}>
                    {[
                        {
                            key: 'today',
                            label: t('khata.filterToday') || 'Today',
                            getRange: () => {
                                const today = toDateKey(new Date());
                                return { start: today, end: today };
                            }
                        },
                        {
                            key: 'week',
                            label: t('khata.filterThisWeek') || 'This week',
                            getRange: () => {
                                const now = new Date();
                                const start = new Date(now);
                                start.setDate(start.getDate() - 6);
                                return { start: toDateKey(start), end: toDateKey(now) };
                            }
                        },
                        {
                            key: 'last30',
                            label: t('khata.filterLast30Days') || 'Last 30 days',
                            getRange: () => {
                                const now = new Date();
                                const start = new Date(now);
                                start.setDate(start.getDate() - 29);
                                return { start: toDateKey(start), end: toDateKey(now) };
                            }
                        },
                        {
                            key: 'month',
                            label: t('khata.filterThisMonth') || 'This month',
                            getRange: () => {
                                const now = new Date();
                                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                                return { start: toDateKey(start), end: toDateKey(now) };
                            }
                        },
                        {
                            key: 'all',
                            label: t('khata.filterAll') || 'All',
                            getRange: () => ({ start: '', end: '' })
                        }
                    ].map((option) => {
                        const range = option.getRange();
                        const isActive = isQuickFilterActive(range.start, range.end);
                        return (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => applyQuickFilter(option.key as 'today' | 'week' | 'last30' | 'month' | 'all')}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'border border-border text-text-secondary hover:text-text-primary hover:bg-background'
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>

                {customer.transactions.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                        <p>{t('khata.noTransactions') || 'No transactions yet'}</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                        <p>{t('khata.noTransactionsInRange') || 'No transactions match this date range.'}</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-border">
                        <div className="max-h-[65vh] md:max-h-[calc(100vh-360px)] overflow-auto print:max-h-none print:overflow-visible">
                            <table className="min-w-full text-sm">
                                <thead className="bg-surface">
                                    <tr>
                                        <th className={`sticky top-0 z-10 bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${isRtl ? 'text-right' : 'text-left'}`}>
                                            {t('khata.type') || 'Type'}
                                        </th>
                                        <th className={`sticky top-0 z-10 bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${isRtl ? 'text-right' : 'text-left'}`}>
                                            {t('khata.details') || 'Details'}
                                        </th>
                                        <th className={`sticky top-0 z-10 bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${isRtl ? 'text-right' : 'text-left'}`}>
                                            {t('khata.date') || 'Date'}
                                        </th>
                                        <th className={`sticky top-0 z-10 bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${isRtl ? 'text-left' : 'text-right'}`}>
                                            {t('khata.amount') || 'Amount'}
                                        </th>
                                        <th className={`sticky top-0 z-10 bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${isRtl ? 'text-left' : 'text-right'} print:hidden`}>
                                            {t('khata.actions') || 'Actions'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((txn) => (
                                        <tr key={txn.id} className="border-b border-border last:border-b-0 hover:bg-background/60 transition">
                                            <td className="px-4 py-3">
                                                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${txn.type === 'credit' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                                        {txn.type === 'credit' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                                    </div>
                                                    <span className="font-semibold text-text-primary">
                                                        {txn.type === 'credit' ? (t('khata.purchaseUdhar') || 'Purchase (Udhar)') : (t('khata.paymentReceived') || 'Payment Received')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-text-primary">{txn.description || (t('khata.noDescription') || 'No description')}</div>
                                                {txn.bill_amount !== undefined && (
                                                    <div className="text-xs text-text-secondary">
                                                        {t('khata.billTotal') || 'Bill Total'}: Rs {txn.bill_amount.toLocaleString()}
                                                        {txn.paid_amount !== undefined && txn.paid_amount > 0
                                                            ? ` • ${t('khata.paid') || 'Paid'}: Rs ${txn.paid_amount.toLocaleString()}`
                                                            : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary">{formatDate(txn.date)}</td>
                                            <td className={`px-4 py-3 font-semibold ${isRtl ? 'text-left' : 'text-right'} ${txn.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                                                {txn.type === 'credit' ? '+' : '-'} Rs {txn.amount.toLocaleString()}
                                            </td>
                                            <td className={`px-4 py-3 ${isRtl ? 'text-left' : 'text-right'} print:hidden`}>
                                                <Link
                                                    href={`/khata/${customer.id}/transactions/${txn.id}`}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:text-text-primary hover:bg-background"
                                                >
                                                    <FileText size={14} />
                                                    {t('khata.details') || 'Details'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
