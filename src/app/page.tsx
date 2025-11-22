
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, Users, Search, X, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { searchCustomers } from './search-actions';
import Link from 'next/link';

interface Transaction {
  id: string;
  customerName: string;
  date: string;
  time: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  items?: { name: string; qty: number; price: number }[];
  billAmount?: number;
  paidAmount?: number;
}

const recentTransactions: Transaction[] = [
  {
    id: '1',
    customerName: 'Ahmed Ali',
    date: 'Today',
    time: '10:30 AM',
    type: 'credit',
    amount: 1500,
    description: 'Plumbing Pipe x 2',
    items: [
        { name: 'Plumbing Pipe', qty: 2, price: 500 },
        { name: 'Labor', qty: 1, price: 500 }
    ],
    billAmount: 1500,
    paidAmount: 0
  },
  {
    id: '2',
    customerName: 'Sara Khan',
    date: 'Today',
    time: '09:15 AM',
    type: 'debit',
    amount: 5000,
    description: 'Payment Received',
    paidAmount: 5000
  },
  {
      id: '3',
      customerName: 'Bilal Ahmed',
      date: 'Yesterday',
      time: '05:45 PM',
      type: 'credit',
      amount: 3200,
      description: 'Paint & Brushes',
      items: [
          { name: 'Dulux Paint 4L', qty: 1, price: 2800 },
          { name: 'Paint Brush 4"', qty: 2, price: 200 }
      ],
      billAmount: 3200,
      paidAmount: 0
  },
   {
      id: '4',
      customerName: 'Usman Ghani',
      date: 'Yesterday',
      time: '02:30 PM',
      type: 'debit',
      amount: 1500,
      description: 'Partial Payment',
      paidAmount: 1500
  },
   {
      id: '5',
      customerName: 'Tariq Mehmood',
      date: 'Jan 22, 2024',
      time: '11:00 AM',
      type: 'credit',
      amount: 850,
      description: 'Electrical Socket',
       items: [
          { name: 'Power Socket', qty: 5, price: 150 },
          { name: 'Switch Box', qty: 1, price: 100 }
      ],
      billAmount: 850,
      paidAmount: 0
  }
];

export default function Home() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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
      <div className="mb-8">
        <h1 className="heading-1">{t('common.dashboard')}</h1>
        <p className="text-muted">{t('common.welcomeBack')} Ezekata</p>
      </div>

      {/* Main Search Bar */}
      <div className="mb-8 relative z-20" ref={searchRef}>
        <div className="relative">
            <input
                type="text"
                className="input pl-12 h-14 text-lg shadow-sm focus:shadow-md transition-shadow w-full"
                placeholder={t('common.search') || "Search customers by name or phone..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={24} />
            {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
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
      <div className="grid grid-cols-1 grid-cols-2 grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Udhar (Receivable)"
          value="Rs 45,200"
          icon={<ArrowUpRight className="text-danger" />}
          trend="+12% this month"
        />
        <StatCard
          title="Total Payable"
          value="Rs 12,500"
          icon={<ArrowDownLeft className="text-success" />}
          trend="-5% this month"
        />
        <StatCard
          title="Low Stock Items"
          value="3 Items"
          icon={<AlertTriangle className="text-warning" />}
          trend="Needs attention"
        />
        <StatCard
          title="Active Customers"
          value="128"
          icon={<Users className="text-primary" />}
          trend="+4 new today"
        />
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 grid-cols-3 gap-8">
        <div className="lg-col-span-2">
          <div className="card">
            <h2 className="heading-2 mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {recentTransactions.map((txn) => (
                <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(txn)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`}>
                      {txn.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold">{txn.customerName}</p>
                      <p className="text-sm text-muted">{txn.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${txn.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                      {txn.type === 'credit' ? '-' : '+'} Rs {txn.amount}
                    </p>
                    <p className="text-sm text-muted">{txn.date}, {txn.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-6">
            <h2 className="heading-2 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <button className="btn btn-primary w-full justify-start">
                <ArrowUpRight size={20} /> Add Udhar (Credit)
              </button>
              <button className="btn btn-secondary w-full justify-start">
                <ArrowDownLeft size={20} /> Add Payment
              </button>
              <button className="btn btn-secondary w-full justify-start">
                <Users size={20} /> Add New Customer
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedTransaction(null)}>
                <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-border flex items-center justify-between bg-gray-50">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            Transaction Details
                        </h3>
                        <button onClick={() => setSelectedTransaction(null)} className="text-text-secondary hover:text-text-primary">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedTransaction.type === 'credit' ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`}>
                                    {selectedTransaction.type === 'credit' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{selectedTransaction.customerName}</p>
                                    <p className={`text-sm font-medium ${selectedTransaction.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                                        {selectedTransaction.type === 'credit' ? 'Purchase (Udhar)' : 'Payment Received'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-2xl font-bold ${selectedTransaction.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                                    Rs {selectedTransaction.amount}
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
                                <h4 className="font-semibold text-sm text-text-secondary mb-2 uppercase tracking-wider">Description</h4>
                                <p className="text-text-primary p-3 bg-gray-50 rounded-lg">{selectedTransaction.description}</p>
                            </div>

                            {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-text-secondary mb-2 uppercase tracking-wider">Items</h4>
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-text-secondary font-medium border-b border-border">
                                                <tr>
                                                    <th className="p-3">Item</th>
                                                    <th className="p-3 text-right">Qty</th>
                                                    <th className="p-3 text-right">Price</th>
                                                    <th className="p-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedTransaction.items.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-border last:border-0">
                                                        <td className="p-3">{item.name}</td>
                                                        <td className="p-3 text-right">{item.qty}</td>
                                                        <td className="p-3 text-right">Rs {item.price}</td>
                                                        <td className="p-3 text-right font-medium">Rs {item.qty * item.price}</td>
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
                                        <span className="text-text-secondary">Total Bill</span>
                                        <span className="font-bold">Rs {selectedTransaction.billAmount}</span>
                                    </div>
                                )}
                                {selectedTransaction.paidAmount !== undefined && selectedTransaction.paidAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Paid Amount</span>
                                        <span className="font-bold text-success">Rs {selectedTransaction.paidAmount}</span>
                                    </div>
                                )}
                                {selectedTransaction.type === 'credit' && selectedTransaction.billAmount && selectedTransaction.paidAmount !== undefined && (
                                    <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-border">
                                        <span>Added to Udhar</span>
                                        <span className="text-danger">Rs {selectedTransaction.billAmount - selectedTransaction.paidAmount}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8">
                             <button onClick={() => setSelectedTransaction(null)} className="btn btn-secondary w-full justify-center">
                                Close Details
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <p className="text-muted font-medium">{title}</p>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-muted">{trend}</p>
    </div>
  );
}
