
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, Users, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { searchCustomers } from './search-actions';
import Link from 'next/link';

export default function Home() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`}>
                      {i % 2 === 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold">Ahmed Ali</p>
                      <p className="text-sm text-muted">Plumbing Pipe x 2</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${i % 2 === 0 ? 'text-danger' : 'text-success'}`}>
                      {i % 2 === 0 ? '-' : '+'} Rs {i * 500}
                    </p>
                    <p className="text-sm text-muted">Today, 10:30 AM</p>
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
