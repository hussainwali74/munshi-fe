
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, Users, Search, X, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { searchCustomers, getRecentTransactions } from './search-actions';
import Link from 'next/link';
import AddCustomerModal from '@/components/AddCustomerModal';
import { SkeletonCustomerRow } from '@/components/Skeleton';


interface Transaction {
  id: string;
  customerName: string;
  customerId?: string;
  date: string;
  time: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  items?: { name: string; qty: number; price: number }[];
  billAmount?: number;
  paidAmount?: number;
}

export default function Home() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Fetch recent transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const data = await getRecentTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, []);

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
    <DashboardLayout>
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
            value="Rs 45,200"
            icon={<ArrowUpRight className="text-danger" />}
            trend={`+12% ${t('dashboard.thisMonth')}`}
          />
          <StatCard
            title={t('dashboard.totalPayable')}
            value="Rs 12,500"
            icon={<ArrowDownLeft className="text-success" />}
            trend={`-5% ${t('dashboard.thisMonth')}`}
          />
          <StatCard
            title={t('dashboard.lowStock')}
            value={`3 ${t('dashboard.items')}`}
            icon={<AlertTriangle className="text-warning" />}
            trend={t('dashboard.needsAttention')}
          />
          <StatCard
            title={t('dashboard.activeCustomers')}
            value="128"
            icon={<Users className="text-primary" />}
            trend={`+4 ${t('dashboard.newToday')}`}
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
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer transition-colors"
                      onClick={() => setSelectedTransaction(txn)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-red-100 dark:bg-red-900/30 text-danger' : 'bg-green-100 dark:bg-green-900/30 text-success'}`}>
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
              <div className="flex flex-col gap-3 text-white">
                <Link href="/billing" className="inline-flex  items-center justify-start gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px w-full">
                  <ArrowUpRight size={20} /> {t('dashboard.addTransaction')}
                </Link>
                <button className="inline-flex items-center justify-start gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-surface text-text-primary border border-border hover:bg-background w-full">
                  <ArrowDownLeft size={20} /> {t('dashboard.addPayment')}
                </button>
                <button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="inline-flex items-center justify-start gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-surface text-text-primary border border-border hover:bg-background w-full"
                >
                  <Users size={20} /> {t('khata.addCustomer')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedTransaction(null)}>
            <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="p-4 border-b border-border flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {t('dashboard.transactionDetails')}
                </h3>
                <button onClick={() => setSelectedTransaction(null)} className="text-text-secondary hover:text-text-primary">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedTransaction.type === 'credit' ? 'bg-red-100 dark:bg-red-900/30 text-danger' : 'bg-green-100 dark:bg-green-900/30 text-success'}`}>
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
                    <p className="text-text-primary p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">{selectedTransaction.description}</p>
                  </div>

                  {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-text-secondary mb-2 uppercase tracking-wider">{t('dashboard.items')}</h4>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 dark:bg-gray-800/50 text-text-secondary font-medium border-b border-border">
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
                    {selectedTransaction.paidAmount !== undefined && selectedTransaction.paidAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">{t('dashboard.paidAmount')}</span>
                        <span className="font-bold text-success">Rs {selectedTransaction.paidAmount?.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedTransaction.type === 'credit' && selectedTransaction.billAmount && selectedTransaction.paidAmount !== undefined && (
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-border">
                        <span>{t('dashboard.addedToUdhar')}</span>
                        <span className="text-danger">Rs {(selectedTransaction.billAmount - selectedTransaction.paidAmount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button onClick={() => setSelectedTransaction(null)} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-surface text-text-primary border border-border hover:bg-background w-full">
                    {t('dashboard.closeDetails')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <AddCustomerModal
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-surface rounded-xl p-6 shadow-md border border-border">
      <div className="flex items-start justify-between mb-2">
        <p className="text-text-secondary font-medium">{title}</p>
        <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-text-secondary">{trend}</p>
    </div>
  );
}
