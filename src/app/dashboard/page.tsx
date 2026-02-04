
'use client';

import { ArrowUpRight, ArrowDownLeft, AlertTriangle, Users, Search, X, Calendar, Clock, Printer } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { searchCustomers, getRecentTransactions, getDashboardStats } from './search-actions';
import Link from 'next/link';
import AddCustomerModal from '@/components/AddCustomerModal';
import { SkeletonCustomerRow } from '@/components/Skeleton';
import InvoicePrintSheet from '@/app/billing/components/InvoicePrintSheet';
import type { BillReceipt, ShopDetails } from '@/app/billing/types';
import { getShopDetails } from '@/app/settings/actions';
import { translations, type Language } from '@/lib/translations';
import { addTransaction, getCustomerById } from '@/app/khata/actions';
import ReceivePaymentModal from '@/components/ReceivePaymentModal';
import { getInvoiceRemaining } from '@/lib/invoice-utils';
import { toast } from 'react-hot-toast';


interface Transaction {
  id: string;
  customerName: string;
  customerId: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  customerCnic: string | null;
  date: string;
  time: string;
  createdAt: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  items: { name: string; qty: number; price: number }[] | null;
  billAmount: number | null;
  paidAmount: number | null;
}

interface CustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  address: string;
  cnic?: string | null;
}

interface CustomerInvoice {
  id: string;
  date: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string | null;
  bill_amount: number | null;
  paid_amount: number | null;
}

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

export default function Home() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [stats, setStats] = useState<{
    totalUdhar: number;
    totalPayable: number;
    lowStockCount: number;
    activeCustomersCount: number;
    udharTrend: number;
    newCustomersThisMonth: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCustomerQuery, setPaymentCustomerQuery] = useState('');
  const [paymentCustomerResults, setPaymentCustomerResults] = useState<CustomerSearchResult[]>([]);
  const [isPaymentCustomerLoading, setIsPaymentCustomerLoading] = useState(false);
  const [selectedPaymentCustomer, setSelectedPaymentCustomer] = useState<CustomerSearchResult | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const createTranslator = (lang: Language) => (path: string, vars?: Record<string, string | number>) => {
    const applyVars = (value: string) => {
      if (!vars) return value;
      return value.replace(/\{(\w+)\}/g, (_, key: string) => {
        const replacement = vars[key];
        return replacement === undefined ? `{${key}}` : String(replacement);
      });
    };

    const keys = path.split('.');
    let current: any = translations[lang];

    for (const key of keys) {
      if (current[key] === undefined) {
        return applyVars(path);
      }
      current = current[key];
    }

    return applyVars(current);
  };

  const tEn = createTranslator('en');
  const tUr = createTranslator('ur');

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const data = await getRecentTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  // Fetch dashboard stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch recent transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const loadShopDetails = async () => {
      const details = await getShopDetails();
      setShopDetails(details);
    };
    loadShopDetails();
  }, []);

  const buildReceiptFromTransaction = (txn: Transaction): BillReceipt => {
    const totalAmount = txn.billAmount ?? txn.amount ?? 0;
    const paidAmount = txn.paidAmount ?? (txn.type === 'debit' ? totalAmount : 0);
    const items = (txn.items && txn.items.length > 0)
      ? txn.items.map((item, index) => ({
        id: `${txn.id}-${index}`,
        name: item.name,
        price: item.price,
        qty: item.qty,
        maxQty: item.qty,
      }))
      : [{
        id: `${txn.id}-line`,
        name: txn.description || t('dashboard.paymentReceived'),
        price: totalAmount,
        qty: 1,
        maxQty: 1,
      }];

    return {
      billNumber: txn.id.slice(-6),
      createdAt: txn.createdAt,
      customer: {
        id: txn.customerId || 'unknown',
        name: txn.customerName,
        phone: txn.customerPhone || '',
        address: txn.customerAddress || '',
        cnic: txn.customerCnic || undefined,
      },
      items,
      shopDetails,
      subTotal: totalAmount,
      discountAmount: 0,
      totalAmount,
      paidAmount,
      paymentMode: txn.type === 'credit' ? 'credit' : 'cash',
      transactionId: txn.id,
    };
  };

  const handlePrint = (lang: Language) => {
    if (typeof window === 'undefined') return;
    document.body.dataset.printLang = lang;
    window.print();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const data = await searchCustomers(query);
          setResults(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    if (selectedPaymentCustomer) return;
    const delayDebounceFn = setTimeout(async () => {
      if (paymentCustomerQuery.trim().length > 0) {
        setIsPaymentCustomerLoading(true);
        try {
          const data = await searchCustomers(paymentCustomerQuery);
          setPaymentCustomerResults(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsPaymentCustomerLoading(false);
        }
      } else {
        setPaymentCustomerResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [paymentCustomerQuery, selectedPaymentCustomer]);

  const formatInvoiceDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const resetPaymentModal = () => {
    setPaymentCustomerQuery('');
    setPaymentCustomerResults([]);
    setSelectedPaymentCustomer(null);
    setCustomerInvoices([]);
    setSelectedInvoiceId('');
    setPaymentAmount('');
    setPaymentNotes('');
  };

  const clearSelectedPaymentCustomer = () => {
    setSelectedPaymentCustomer(null);
    setPaymentCustomerQuery('');
    setPaymentCustomerResults([]);
    setCustomerInvoices([]);
    setSelectedInvoiceId('');
    setPaymentAmount('');
    setPaymentNotes('');
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    resetPaymentModal();
  };

  const fetchPaymentCustomerInvoices = async (customerId: string) => {
    setIsLoadingInvoices(true);
    try {
      const data = await getCustomerById(customerId);
      setCustomerInvoices(((data?.transactions as CustomerInvoice[] | undefined) || []));
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleSelectPaymentCustomer = async (customer: CustomerSearchResult) => {
    setSelectedPaymentCustomer(customer);
    setPaymentCustomerQuery(customer.name);
    setPaymentCustomerResults([]);
    setSelectedInvoiceId('');
    setPaymentAmount('');
    setPaymentNotes('');
    await fetchPaymentCustomerInvoices(customer.id);
  };

  const outstandingInvoices = useMemo(
    () => customerInvoices.filter((txn) => txn.type === 'credit' && getInvoiceRemaining(txn) > 0),
    [customerInvoices]
  );

  const handleSubmitPayment = async (formData: FormData) => {
    if (!selectedPaymentCustomer) {
      toast.error(t('billing.selectCustomerAlert') || 'Please select a customer');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      formData.append('customerId', selectedPaymentCustomer.id);
      formData.append('type', 'debit');
      await addTransaction(formData);
      toast.success(t('khata.paymentRecorded') || 'Payment recorded');
      closePaymentModal();
      await Promise.all([fetchTransactions(), fetchStats()]);
    } catch (error) {
      console.error('Record payment error:', error);
      toast.error(t('khata.addTransactionFailed') || 'Failed to add transaction');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const paymentCustomerContent = (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {t('billing.customer') || 'Customer'}
      </label>
      <div className="relative">
        <Search size={16} className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-text-secondary`} />
        <input
          type="text"
          value={paymentCustomerQuery}
          onChange={(event) => setPaymentCustomerQuery(event.target.value)}
          disabled={Boolean(selectedPaymentCustomer)}
          className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${isRtl ? 'pr-9' : 'pl-9'} ${selectedPaymentCustomer ? 'opacity-70' : ''}`}
          placeholder={t('billing.searchCustomer') || 'Search customer...'}
        />
      </div>

      {isPaymentCustomerLoading && (
        <p className="text-xs text-text-secondary">{t('common.loading') || 'Loading...'}</p>
      )}

      {!selectedPaymentCustomer && paymentCustomerResults.length > 0 && (
        <div className="rounded-lg border border-border bg-background/40 divide-y divide-border max-h-48 overflow-auto">
          {paymentCustomerResults.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => handleSelectPaymentCustomer(customer)}
              className="w-full text-left px-3 py-2 hover:bg-primary/5"
            >
              <p className="text-sm font-semibold text-text-primary">{customer.name}</p>
              <p className="text-xs text-text-secondary">{customer.phone || customer.address || ''}</p>
            </button>
          ))}
        </div>
      )}

      {selectedPaymentCustomer && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-text-primary">{selectedPaymentCustomer.name}</p>
            <p className="text-xs text-text-secondary">{selectedPaymentCustomer.phone || selectedPaymentCustomer.address || ''}</p>
          </div>
          <button
            type="button"
            onClick={clearSelectedPaymentCustomer}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t('common.clear') || 'Clear'}
          </button>
        </div>
      )}

    </div>
  );

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setResults([]);
        setQuery(''); // Optional: Clear query on close or just hide results
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  return (

    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-4 tracking-tight">{t('common.dashboard')}</h1>
        <p className="text-text-secondary">{t('common.welcomeBack')} EZ Khata</p>
      </div>

      {/* Main Search Bar */}
      <div className="mb-8 relative z-20" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            className={`w-full p-3 ${isRtl ? 'pr-12 pl-3' : 'pl-12 pr-3'} h-14 text-lg rounded-xl border border-border bg-surface text-text-primary shadow-sm focus:shadow-md transition-shadow focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
            placeholder={t('khata.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-text-secondary`} size={24} />
          {loading && (
            <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`}>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border border-border overflow-hidden max-h-80 overflow-y-auto">
            {results.map((customer) => (
              <Link
                href={`/khata/${customer.id}`}
                key={customer.id}
                className="flex items-center gap-4 p-4 hover:bg-background transition-colors border-b border-border last:border-0"
                onClick={() => {
                  setResults([]);
                  setQuery('');
                }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{customer.name}</p>
                  <p className="text-sm text-text-secondary">{customer.phone} • {customer.address}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t('dashboard.totalUdhar')}
          value={isLoadingStats ? '...' : `Rs ${stats?.totalUdhar?.toLocaleString() || 0}`}
          icon={<ArrowUpRight className="text-danger" />}
          trend={stats?.udharTrend !== undefined && stats.udharTrend !== 0 ? `${stats.udharTrend > 0 ? '+' : ''}${stats.udharTrend}% ${t('dashboard.thisMonth')}` : undefined}
          trendType={stats?.udharTrend && stats.udharTrend > 0 ? 'up' : stats?.udharTrend && stats.udharTrend < 0 ? 'down' : undefined}
          isLoading={isLoadingStats}
          variant="danger"
        />
        <StatCard
          title={t('dashboard.totalPayable')}
          value={isLoadingStats ? '...' : `Rs ${stats?.totalPayable?.toLocaleString() || 0}`}
          icon={<ArrowDownLeft className="text-success" />}
          isLoading={isLoadingStats}
          variant="success"
        />
        <StatCard
          title={t('dashboard.lowStock')}
          value={isLoadingStats ? '...' : `${stats?.lowStockCount || 0} ${t('dashboard.items')}`}
          icon={<AlertTriangle className="text-warning" />}
          trend={stats?.lowStockCount && stats.lowStockCount > 0 ? t('dashboard.needsAttention') : undefined}
          isLoading={isLoadingStats}
          variant="warning"
        />
        <StatCard
          title={t('dashboard.activeCustomers')}
          value={isLoadingStats ? '...' : `${stats?.activeCustomersCount || 0}`}
          icon={<Users className="text-primary" />}
          trend={stats?.newCustomersThisMonth && stats.newCustomersThisMonth > 0 ? `+${stats.newCustomersThisMonth} ${t('dashboard.newThisMonth')}` : undefined}
          trendType="up"
          isLoading={isLoadingStats}
          variant="primary"
        />
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl p-6 shadow-md border border-border">
            <h2 className="text-2xl font-bold mb-3">{t('dashboard.recentActivity')}</h2>
            <div className="space-y-4">
              {isLoadingTransactions ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCustomerRow key={i} />
                ))
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <p>{t('khata.noTransactions') || 'No recent transactions'}</p>
                </div>
              ) : (
                transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(txn)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                        {txn.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold">{txn.customerName}</p>
                        <p className="text-sm text-text-secondary">{txn.description}</p>
                      </div>
                    </div>
                    <div className={isRtl ? 'text-left' : 'text-right'}>
                      <p className={`font-bold ${txn.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                        {txn.type === 'credit' ? '-' : '+'} Rs {txn.amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-text-secondary">{txn.date}, {txn.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-surface rounded-xl p-6 shadow-md border border-border mb-6">
            <h2 className="text-2xl font-bold mb-3">{t('dashboard.quickActions')}</h2>
            <div className="flex flex-col gap-3">
              <Link href="/billing" className="inline-flex  items-center justify-start gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px w-full">
                <ArrowUpRight size={20} /> {t('dashboard.addTransaction')}
              </Link>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="inline-flex items-center justify-start gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-px border border-transparent w-full"
              >
                <ArrowDownLeft size={20} /> {t('dashboard.addPayment')}
              </button>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="inline-flex items-center justify-start gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-px border border-transparent w-full"
              >
                <Users size={20} /> {t('khata.addCustomer')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        t={t}
        isRtl={isRtl}
        invoices={selectedPaymentCustomer ? outstandingInvoices : []}
        selectedInvoiceId={selectedInvoiceId}
        onSelectedInvoiceChange={(value) => {
          setSelectedInvoiceId(value);
          if (!value) return;
          const invoice = outstandingInvoices.find((item) => item.id === value);
          if (invoice) {
            setPaymentAmount(getInvoiceRemaining(invoice).toString());
          }
        }}
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        paymentNotes={paymentNotes}
        onPaymentNotesChange={setPaymentNotes}
        onSubmit={handleSubmitPayment}
        isSubmitting={isSubmittingPayment}
        isInvoiceLoading={isLoadingInvoices}
        formatInvoiceDate={formatInvoiceDate}
        topContent={paymentCustomerContent}
        isSubmitDisabled={!selectedPaymentCustomer || isSubmittingPayment}
      />

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedTransaction(null)}>
          <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5 dark:bg-primary/10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {t('dashboard.transactionDetails')}
              </h3>
              <button onClick={() => setSelectedTransaction(null)} className="text-text-secondary hover:text-text-primary print:hidden">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedTransaction.type === 'credit' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                    {selectedTransaction.type === 'credit' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{selectedTransaction.customerName}</p>
                    <p className={`text-sm font-medium ${selectedTransaction.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                      {selectedTransaction.type === 'credit' ? t('dashboard.purchaseUdhar') : t('dashboard.paymentReceived')}
                    </p>
                  </div>
                </div>
                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <p className={`text-2xl font-bold ${selectedTransaction.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                    Rs {selectedTransaction.amount?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar size={18} />
                  <span>{selectedTransaction.date}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock size={18} />
                  <span>{selectedTransaction.time}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-text-secondary mb-2 uppercase tracking-wider">{t('dashboard.description')}</h4>
                  <p className="text-text-primary p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">{selectedTransaction.description}</p>
                </div>

                {(() => {
                  const totalAmount = selectedTransaction.billAmount ?? selectedTransaction.amount;
                  const paidAmount = selectedTransaction.paidAmount ?? (selectedTransaction.type === 'debit' ? totalAmount : 0);
                  const balance = Math.max(0, totalAmount - paidAmount);
                  const isUdhar = selectedTransaction.type === 'credit' && balance > 0;
                  const isPartial = selectedTransaction.type === 'credit' && paidAmount > 0 && balance > 0;
                  const statusLabel = isUdhar
                    ? (isPartial ? t('dashboard.partiallyPaid') : t('dashboard.udharOutstanding'))
                    : t('dashboard.paidInFull');

                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 bg-background/60">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-text-secondary">{t('dashboard.paymentStatus')}</p>
                        <p className="text-sm font-semibold text-text-primary">{statusLabel}</p>
                      </div>
                      {balance > 0 && (
                        <div className="text-sm font-bold text-danger">
                          {t('dashboard.udharRemaining')}: Rs {balance.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-text-secondary mb-2 uppercase tracking-wider">{t('dashboard.items')}</h4>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-primary/5 dark:bg-primary/10 text-text-secondary font-medium border-b border-border">
                          <tr>
                            <th className="p-3">{t('dashboard.item')}</th>
                            <th className={`p-3 ${isRtl ? 'text-left' : 'text-right'}`}>{t('dashboard.qty')}</th>
                            <th className={`p-3 ${isRtl ? 'text-left' : 'text-right'}`}>{t('inventory.price')}</th>
                            <th className={`p-3 ${isRtl ? 'text-left' : 'text-right'}`}>{t('dashboard.total')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTransaction.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-border last:border-0">
                              <td className="p-3">{item.name}</td>
                              <td className={`p-3 ${isRtl ? 'text-left' : 'text-right'}`}>{item.qty}</td>
                              <td className={`p-3 ${isRtl ? 'text-left' : 'text-right'}`}>Rs {item.price}</td>
                              <td className={`p-3 ${isRtl ? 'text-left' : 'text-right'} font-medium`}>Rs {item.qty * item.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  {selectedTransaction.billAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">{t('dashboard.totalBill')}</span>
                      <span className="font-bold">Rs {selectedTransaction.billAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedTransaction.paidAmount != null && selectedTransaction.paidAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">{t('dashboard.paidAmount')}</span>
                      <span className="font-bold text-success">Rs {selectedTransaction.paidAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedTransaction.type === 'credit' && selectedTransaction.billAmount && selectedTransaction.paidAmount != null && (
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-border">
                      <span>{t('dashboard.addedToUdhar')}</span>
                      <span className="text-danger">Rs {(selectedTransaction.billAmount - selectedTransaction.paidAmount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-3 print:hidden">
                <button
                  onClick={() => handlePrint('ur')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark w-full shadow-md"
                >
                  <Printer size={18} /> {t('billing.invoice.printUrdu')}
                </button>
                <button
                  onClick={() => handlePrint('en')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border border-border outline-none bg-surface text-text-primary hover:bg-background w-full"
                >
                  <Printer size={18} /> {t('billing.invoice.printEnglish')}
                </button>
                <button onClick={() => setSelectedTransaction(null)} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-surface text-text-primary border border-border hover:bg-background w-full">
                  {t('dashboard.closeDetails')}
                </button>
              </div>
            </div>
          </div>
          {selectedTransaction && (
            <>
              <div className="invoice-print-root lang-en hidden print:block">
                <InvoicePrintSheet bill={buildReceiptFromTransaction(selectedTransaction)} t={tEn} printFormat="a4" />
              </div>
              <div className="invoice-print-root lang-ur hidden print:block urdu-text" dir="rtl">
                <InvoicePrintSheet bill={buildReceiptFromTransaction(selectedTransaction)} t={tUr} printFormat="a4" />
              </div>
            </>
          )}
        </div>
      )}

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />
    </div>

  );
}

function StatCard({ title, value, icon, trend, trendType, isLoading, variant = 'primary' }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down';
  isLoading?: boolean;
  variant?: Variant;
}) {
  const getTrendColor = () => {
    if (trendType === 'up') return 'text-success';
    if (trendType === 'down') return 'text-danger';
    return 'text-text-secondary';
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-danger/10 text-danger';
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'primary':
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 shadow-md border border-border">
      <div className="flex items-start justify-between mb-2">
        <p className="text-text-secondary font-medium">{title}</p>
        <div className={`p-2 rounded-lg ${getVariantStyles()}`}>{icon}</div>
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold mb-1">{value}</h3>
          {trend && <p className={`text-sm ${getTrendColor()}`}>{trend}</p>}
        </>
      )}
    </div>
  );
}
