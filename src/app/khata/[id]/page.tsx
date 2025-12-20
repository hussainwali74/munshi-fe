'use client';

import { ArrowLeft, Phone, MapPin, ArrowUpRight, ArrowDownLeft, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use, useCallback } from 'react';
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
            toast.success(transactionType === 'purchase' ? 'Purchase added' : 'Payment recorded');
            setIsModalOpen(false);
            await fetchCustomer(); // Refresh the data
        } catch (error) {
            console.error('Transaction error:', error);
            toast.error('Failed to add transaction');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

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
            <div className="card mb-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-start justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-primary bg-primary/10">
                            <span className="text-2xl font-bold">{customer.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{customer.name}</h1>
                            <div className="flex flex-col gap-1 text-sm text-muted">
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
                        <p className="text-sm text-muted mb-1">{t('khata.currentBalance') || 'Current Balance'}</p>
                        <p className={`text-3xl font-bold ${customer.balance > 0 ? 'text-danger' : customer.balance < 0 ? 'text-success' : 'text-muted'}`}>
                            Rs {Math.abs(customer.balance).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted mt-1">
                            {customer.balance > 0 ? (t('khata.udharDesc') || 'Udhar (Customer Owes)') : customer.balance < 0 ? (t('khata.advanceDesc') || 'Advance (Shop Owes)') : (t('khata.settled') || 'Settled')}
                        </p>
                    </div>
                </div>

                <div className={`flex gap-3 border-t border-border pt-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <button
                        className="btn btn-primary flex-1 justify-center"
                        onClick={() => {
                            setTransactionType('purchase');
                            setIsModalOpen(true);
                        }}
                    >
                        <ShoppingBag size={20} /> {t('khata.addPurchase') || 'Add Purchase (Udhar)'}
                    </button>
                    <button
                        className="btn btn-secondary flex-1 justify-center"
                        onClick={() => {
                            setTransactionType('payment');
                            setIsModalOpen(true);
                        }}
                    >
                        <ArrowDownLeft size={20} /> {t('khata.recordPayment') || 'Record Payment'}
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
                                        <input name="billAmount" type="number" step="0.01" required className="input w-full" placeholder="0.00" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.amountPaidNow') || 'Amount Paid Now'} (Rs)</label>
                                        <input name="paidAmount" type="number" step="0.01" className="input w-full" placeholder="0.00" defaultValue="0" />
                                        <p className="text-xs text-muted mt-1">{t('khata.remainingAddedToUdhar') || 'The remaining amount will be added to Udhar'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.description') || 'Description'}</label>
                                        <textarea name="description" className="input w-full" rows={2} placeholder={t('khata.descriptionPlaceholder') || 'e.g. Plumbing items, Sanitary goods'}></textarea>
                                    </div>

                                    <input type="hidden" name="amount" value="0" />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.paymentAmount') || 'Payment Amount'} (Rs)</label>
                                        <input name="amount" type="number" step="0.01" required className="input w-full" placeholder="0.00" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('khata.notes') || 'Notes'} ({t('common.optional') || 'Optional'})</label>
                                        <textarea name="description" className="input w-full" rows={2} placeholder={t('khata.paymentNotesPlaceholder') || 'Payment notes'}></textarea>
                                    </div>
                                </>
                            )}

                            <div className="pt-4">
                                <button type="submit" className="btn btn-primary w-full justify-center">
                                    {transactionType === 'purchase' ? (t('khata.addPurchase') || 'Add Purchase') : (t('khata.recordPayment') || 'Record Payment')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="card" dir={isRtl ? 'rtl' : 'ltr'}>
                <h2 className="heading-2 mb-4">{t('khata.transactionHistory') || 'Transaction History'}</h2>

                {customer.transactions.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                        <p>{t('khata.noTransactions') || 'No transactions yet'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {customer.transactions.map((txn) => (
                            <div key={txn.id} className="p-4 rounded-lg border border-border">
                                <div className={`flex items-start justify-between mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                            {txn.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {txn.type === 'credit' ? (t('khata.purchaseUdhar') || 'Purchase (Udhar)') : (t('khata.paymentReceived') || 'Payment Received')}
                                            </p>
                                            <p className="text-sm text-muted">{txn.description}</p>
                                        </div>
                                    </div>
                                    <div className={isRtl ? 'text-left' : 'text-right'}>
                                        <p className={`text-lg font-bold ${txn.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                                            {txn.type === 'credit' ? '+' : '-'} Rs {txn.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted">{formatDate(txn.date)}</p>
                                    </div>
                                </div>

                                {txn.items && txn.items.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-xs font-medium text-muted mb-2">{t('khata.items') || 'Items'}:</p>
                                        <div className="space-y-1">
                                            {txn.items.map((item: any, idx: number) => (
                                                <div key={idx} className={`flex justify-between text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                    <span>{item.name} × {item.qty}</span>
                                                    <span className="font-medium">Rs {(item.price * item.qty).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {txn.bill_amount !== undefined && (
                                            <div className={`mt-2 pt-2 border-t border-border flex justify-between text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <span className="font-medium">{t('khata.billTotal') || 'Bill Total'}:</span>
                                                <span className="font-bold">Rs {txn.bill_amount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {txn.paid_amount !== undefined && txn.paid_amount > 0 && (
                                            <div className={`flex justify-between text-sm text-success ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <span>{t('khata.paid') || 'Paid'}:</span>
                                                <span>Rs {txn.paid_amount.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
