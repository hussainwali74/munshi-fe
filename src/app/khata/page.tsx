
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, User, ChevronRight, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { useState } from 'react';
import { addCustomer } from './actions';
import Link from 'next/link';
import AddCustomerModal from '@/components/AddCustomerModal';
import { useLanguage } from '@/context/LanguageContext';

export default function KhataPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';

    // Mock data - in production, fetch from DB
    const customers = [
        { id: '1', name: 'Ahmed Ali', phone: '0300-1234561', balance: 2500 },
        { id: '2', name: 'Fatima Khan', phone: '0300-1234562', balance: -500 },
        { id: '3', name: 'Hassan Malik', phone: '0300-1234563', balance: 1200 },
        { id: '4', name: 'Ayesha Siddiqui', phone: '0300-1234564', balance: 0 },
        { id: '5', name: 'Usman Shah', phone: '0300-1234565', balance: 3400 },
    ];

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div>
                    <h1 className="text-3xl font-extrabold mb-2 tracking-tight">
                        {t('khata.title')}
                    </h1>
                    <p className="text-text-secondary">{t('khata.subtitle')}</p>
                </div>
                <button
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={20} /> {t('khata.addCustomer')}
                </button>
            </div>

            {/* Add Customer Modal */}
            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Search Section */}
            <div className="mb-6 relative" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="relative">
                    <input
                        type="text"
                        className={`w-full p-3 ${isRtl ? 'pr-12 pl-3' : 'pl-12 pr-3'} h-14 text-lg rounded-xl border border-border bg-surface text-text-primary shadow-sm focus:shadow-md transition-shadow focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                        placeholder={t('khata.searchPlaceholder')}
                    />
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-text-secondary`} size={24} />
                </div>
            </div>

            {/* Customer List */}
            <div className="space-y-4">
                {customers.map((customer, index) => (
                    <Link
                        key={customer.id}
                        href={`/khata/${customer.id}`}
                        className="block"
                    >
                        <div className="bg-surface rounded-xl p-5 shadow-md border border-border hover:bg-gray-50 transition-colors" dir={isRtl ? 'rtl' : 'ltr'}>
                            <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                {/* Customer Info */}
                                <div className={`flex items-center gap-4 flex-1 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary font-bold shrink-0">
                                        <User size={24} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-text-primary mb-1 truncate">
                                            {customer.name}
                                        </h3>
                                        <p className="text-text-secondary text-sm">{customer.phone}</p>
                                    </div>
                                </div>

                                {/* Balance Section */}
                                <div className={`flex items-center gap-3 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={isRtl ? 'text-left' : 'text-right'}>
                                        <p className="text-xs text-text-secondary mb-1 font-medium">{t('khata.balance')}</p>

                                        {customer.balance === 0 ? (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                                {t('khata.settled')} ✓
                                            </div>
                                        ) : (
                                            <>
                                                <p className={`text-xl font-bold mb-1 ${customer.balance > 0 ? 'text-danger' : 'text-success'
                                                    }`}>
                                                    Rs {Math.abs(customer.balance).toLocaleString()}
                                                </p>
                                                {customer.balance > 0 && (
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-danger">
                                                        <ArrowUpRight size={12} />
                                                        {t('khata.udhar')}
                                                    </div>
                                                )}
                                                {customer.balance < 0 && (
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-success">
                                                        <ArrowDownLeft size={12} />
                                                        {t('khata.advance')}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <ChevronRight size={20} className={`text-text-secondary ${isRtl ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Empty State (if no customers) */}
            {customers.length === 0 && (
                <div className="bg-surface rounded-xl p-12 text-center shadow-md border border-border">
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary">
                        <User size={40} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('khata.noCustomersTitle')}</h3>
                    <p className="text-text-secondary mb-6">{t('khata.noCustomersSubtitle')}</p>
                    <button
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={20} /> {t('khata.addFirstCustomer')}
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}
