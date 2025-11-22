
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, User, ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useState } from 'react';
import { addCustomer } from './actions';
import Link from 'next/link';

export default function KhataPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            {/* Header Section with Gradient */}
            <div className="flex items-center justify-between mb-8 animate-in slide-in-from-bottom-5 duration-500">
                <div>
                    <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent">
                        Khata (Ledger)
                    </h1>
                    <p className="text-text-secondary text-lg">Manage customer credit accounts</p>
                </div>
                <button
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[0.75rem] font-semibold cursor-pointer transition-all duration-300 border-none outline-none bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 overflow-hidden relative"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={20} /> Add Customer
                </button>
            </div>

            {/* Add Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl w-full max-w-md shadow-2xl">
                        {/* Modal Header with Gradient */}
                        <div className="bg-gradient-to-br from-primary to-primary-dark p-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Add New Customer</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form action={async (formData) => {
                            await addCustomer(formData);
                            setIsModalOpen(false);
                        }} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-text-primary">
                                    Customer Name *
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full p-3 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                                    placeholder="Ahmed Ali"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-text-primary">
                                    Phone Number
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    className="w-full p-3 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                                    placeholder="0300-1234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-text-primary">
                                    Address
                                </label>
                                <input
                                    name="address"
                                    type="text"
                                    className="w-full p-3 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                                    placeholder="Street, Area, City"
                                />
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[0.75rem] font-semibold cursor-pointer transition-all duration-300 border-none outline-none bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40">
                                    Add Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search Section with Glass Effect */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-xl p-6 mb-6 shadow-lg animate-in slide-in-from-bottom-5 duration-500 delay-100">
                <div className="flex items-center gap-3 rounded-lg p-3 border-2 border-border bg-surface transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <Search size={22} className="text-primary" />
                    <input
                        type="text"
                        placeholder="Search customer by name or phone..."
                        className="w-full text-base outline-none border-none bg-transparent text-text-primary placeholder:text-text-secondary"
                    />
                </div>
            </div>

            {/* Customer List with Premium Cards */}
            <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-500 delay-200">
                {customers.map((customer, index) => (
                    <Link
                        key={customer.id}
                        href={`/khata/${customer.id}`}
                        className="block transition-transform duration-300"
                    >
                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-xl p-5 shadow-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                            <div className="flex items-center justify-between gap-4">
                                {/* Customer Info */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Avatar with Gradient */}
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark shadow-glow flex-shrink-0">
                                        <User size={28} color="white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-text-primary mb-1 truncate">
                                            {customer.name}
                                        </h3>
                                        <p className="text-text-secondary text-sm">{customer.phone}</p>
                                    </div>
                                </div>

                                {/* Balance Section */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="text-xs text-text-secondary mb-1 font-medium">Balance</p>

                                        {customer.balance === 0 ? (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                                Settled ✓
                                            </div>
                                        ) : (
                                            <>
                                                <p className={`text-2xl font-bold mb-1 ${customer.balance > 0 ? 'text-red-500' : 'text-green-500'
                                                    }`}>
                                                    Rs {Math.abs(customer.balance).toLocaleString()}
                                                </p>
                                                {customer.balance > 0 && (
                                                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-br from-red-500/10 to-orange-500/10 text-red-500 border border-red-500/20">
                                                        <ArrowUpRight size={14} />
                                                        Udhar
                                                    </div>
                                                )}
                                                {customer.balance < 0 && (
                                                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-br from-green-500/10 to-teal-500/10 text-green-500 border border-green-500/20">
                                                        <ArrowDownLeft size={14} />
                                                        Advance
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <ChevronRight size={24} className="text-text-secondary" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Empty State (if no customers) */}
            {customers.length === 0 && (
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-xl p-12 text-center shadow-lg">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark mx-auto mb-4 flex items-center justify-center shadow-glow">
                        <User size={40} color="white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Customers Yet</h3>
                    <p className="text-text-secondary mb-6">Start by adding your first customer</p>
                    <button
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[0.75rem] font-semibold cursor-pointer transition-all duration-300 border-none outline-none bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={20} /> Add First Customer
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}
