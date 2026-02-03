'use client';

import { Search, Plus, User, ChevronRight, ArrowUpRight, ArrowDownLeft, X, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer, updateCustomer } from './actions';
import Link from 'next/link';
import AddCustomerModal from '@/components/AddCustomerModal';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';
import { SkeletonCustomerRow } from '@/components/Skeleton';
import { formatCNIC } from '@/lib/utils';

interface Customer {
    id: string;
    name: string;
    phone: string;
    cnic?: string;
    address: string;
    balance: number;
}

export default function KhataPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [editingCnic, setEditingCnic] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data || []);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        const confirmMessage = t('khata.confirmDeleteCustomer', { name });
        if (confirm(confirmMessage)) {
            try {
                await deleteCustomer(id);
                toast.success(t('khata.customerDeleted'));
                await fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
                toast.error(t('khata.deleteCustomerFailed'));
            }
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setEditingCnic(customer.cnic || '');
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            await updateCustomer(formData);
            toast.success(t('khata.customerUpdated'));
            setEditingCustomer(null);
            await fetchCustomers();
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error(t('khata.updateCustomerFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter customers based on search query
    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.cnic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (<>

        {/* Header Section */}
        < div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`
        } dir={isRtl ? 'rtl' : 'ltr'} >
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
        </div >

        {/* Add Customer Modal */}
        < AddCustomerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchCustomers}
        />

        {/* Edit Customer Modal */}
        {
            editingCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditingCustomer(null)}>
                    <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-xl font-bold">{t('khata.editCustomer') || 'Edit Customer'}</h2>
                            <button onClick={() => setEditingCustomer(null)} className="text-text-secondary hover:text-text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-4 space-y-4">
                            <input type="hidden" name="id" value={editingCustomer.id} />

                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">
                                    {t('khata.customerName') || 'Customer Name'} *
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    disabled={isSubmitting}
                                    defaultValue={editingCustomer.name}
                                    className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">
                                    {t('khata.phoneNumber') || 'Phone Number'}
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    disabled={isSubmitting}
                                    defaultValue={editingCustomer.phone || ''}
                                    className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">
                                    {t('khata.cnic') || 'CNIC'} <span className="text-text-secondary font-normal text-xs">({t('common.optional') || 'Optional'})</span>
                                </label>
                                <input
                                    name="cnic"
                                    type="text"
                                    disabled={isSubmitting}
                                    value={editingCnic}
                                    onChange={(e) => setEditingCnic(formatCNIC(e.target.value))}
                                    maxLength={15}
                                    className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                                    placeholder="12345-1234567-1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">
                                    {t('khata.address') || 'Address'}
                                </label>
                                <input
                                    name="address"
                                    type="text"
                                    disabled={isSubmitting}
                                    defaultValue={editingCustomer.address || ''}
                                    className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (t('common.loading') || 'Loading...') : (t('common.save') || 'Save')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingCustomer(null)}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-6 rounded-xl font-semibold border border-border text-text-primary hover:bg-background transition-colors disabled:opacity-50"
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }

        {/* Search Section */}
        <div className="mb-6 relative" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full p-3 ${isRtl ? 'pr-12 pl-3' : 'pl-12 pr-3'} h-14 text-lg rounded-xl border border-border bg-surface text-text-primary shadow-sm focus:shadow-md transition-shadow focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder={t('khata.searchPlaceholder')}
                />
                <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-text-secondary`} size={24} />
            </div>
        </div>

        {/* Customer List */}
        <div className="space-y-4">
            {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCustomerRow key={i} />
                ))
            ) : filteredCustomers.map((customer) => (
                <div key={customer.id} className="bg-surface rounded-xl p-5 shadow-sm border border-border hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        {/* Customer Info */}
                        <Link href={`/khata/${customer.id}`} className={`flex items-center gap-4 flex-1 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary font-bold shrink-0">
                                <User size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-text-primary mb-1 truncate">
                                    {customer.name}
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    {customer.phone}
                                    {customer.cnic && ` • ${formatCNIC(customer.cnic)}`}
                                </p>
                            </div>
                        </Link>

                        {/* Balance Section */}
                        <div className={`flex items-center gap-3 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className={isRtl ? 'text-left' : 'text-right'}>
                                <p className="text-xs text-text-secondary mb-1 font-medium">{t('khata.balance')}</p>

                                {customer.balance === 0 ? (
                                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                                        {t('khata.settled')} ✓
                                    </div>
                                ) : (
                                    <>
                                        <p className={`text-xl font-bold mb-1 ${customer.balance > 0 ? 'text-danger' : 'text-success'
                                            }`}>
                                            Rs {Math.abs(customer.balance).toLocaleString()}
                                        </p>
                                        {customer.balance > 0 && (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger">
                                                <ArrowUpRight size={12} />
                                                {t('khata.udhar')}
                                            </div>
                                        )}
                                        {customer.balance < 0 && (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                                                <ArrowDownLeft size={12} />
                                                {t('khata.advance')}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(customer);
                                    }}
                                    className="p-2 rounded-lg border border-border text-text-secondary hover:bg-background hover:text-primary transition-colors"
                                    title={t('common.edit') || 'Edit'}
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(customer.id, customer.name);
                                    }}
                                    className="p-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                                    title={t('common.delete') || 'Delete'}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <Link href={`/khata/${customer.id}`}>
                                    <ChevronRight size={20} className={`text-text-secondary ${isRtl ? 'rotate-180' : ''}`} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Empty State (if no customers) */}
        {
            !isLoading && customers.length === 0 && (
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
            )
        }

        {/* No search results */}
        {
            customers.length > 0 && filteredCustomers.length === 0 && (
                <div className="bg-surface rounded-xl p-12 text-center shadow-md border border-border">
                    <Search size={40} className="mx-auto text-text-secondary mb-4" />
                    <h3 className="text-xl font-bold mb-2">{t('common.noResults') || 'No Results Found'}</h3>
                    <p className="text-text-secondary">{t('khata.noSearchResults') || 'No customers match your search'}</p>
                </div>
            )
        }

    </>);
}
