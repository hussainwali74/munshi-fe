
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
            <div className="flex items-center justify-between mb-8 slide-up">
                <div>
                    <h1 className="heading-1 gradient-text" style={{ marginBottom: '0.5rem' }}>
                        Khata (Ledger)
                    </h1>
                    <p className="text-muted text-lg">Manage customer credit accounts</p>
                </div>
                <button
                    className="btn btn-gradient hover-scale transition-smooth"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={20} /> Add Customer
                </button>
            </div>

            {/* Add Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-heavy scale-in">
                    <div className="glass-strong rounded-xl w-full max-w-md shadow-2xl">
                        {/* Modal Header with Gradient */}
                        <div
                            className="gradient-primary p-4 rounded-t-xl"
                            style={{
                                background: 'var(--gradient-primary)',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Add New Customer</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-smooth"
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
                                    className="input w-full input-focus"
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
                                    className="input w-full input-focus"
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
                                    className="input w-full input-focus"
                                    placeholder="Street, Area, City"
                                />
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="btn btn-gradient w-full justify-center">
                                    Add Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search Section with Glass Effect */}
            <div className="glass-card rounded-xl p-6 mb-6 slide-up stagger-1">
                <div
                    className="flex items-center gap-3 rounded-lg p-3 transition-smooth"
                    style={{
                        border: '2px solid var(--border)',
                        background: 'var(--surface)'
                    }}
                >
                    <Search size={22} className="text-primary" />
                    <input
                        type="text"
                        placeholder="Search customer by name or phone..."
                        className="w-full text-base"
                        style={{
                            outline: 'none',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>
            </div>

            {/* Customer List with Premium Cards */}
            <div className="space-y-4 slide-up stagger-2">
                {customers.map((customer, index) => (
                    <Link
                        key={customer.id}
                        href={`/khata/${customer.id}`}
                        className="block"
                        style={{
                            animation: `slideUp 0.5s ease-out ${0.1 * (index + 3)}s backwards`
                        }}
                    >
                        <div className="glass-card rounded-xl p-5 card-hover transition-smooth hover-glow">
                            <div className="flex items-center justify-between gap-4">
                                {/* Customer Info */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Avatar with Gradient */}
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center gradient-primary flex-shrink-0"
                                        style={{
                                            background: 'var(--gradient-primary)',
                                            boxShadow: 'var(--shadow-glow)'
                                        }}
                                    >
                                        <User size={28} color="white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-text-primary mb-1">
                                            {customer.name}
                                        </h3>
                                        <p className="text-muted text-sm">{customer.phone}</p>
                                    </div>
                                </div>

                                {/* Balance Section */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="text-xs text-muted mb-1 font-medium">Balance</p>

                                        {customer.balance === 0 ? (
                                            <div className="balance-badge" style={{
                                                background: 'rgba(100, 116, 139, 0.1)',
                                                color: 'var(--text-secondary)',
                                                border: '1px solid rgba(100, 116, 139, 0.2)'
                                            }}>
                                                Settled ✓
                                            </div>
                                        ) : (
                                            <>
                                                <p className={`text-2xl font-bold mb-1 ${customer.balance > 0 ? 'text-danger' : 'text-success'
                                                    }`}>
                                                    Rs {Math.abs(customer.balance).toLocaleString()}
                                                </p>
                                                {customer.balance > 0 && (
                                                    <div className="balance-badge balance-badge-danger">
                                                        <ArrowUpRight size={14} />
                                                        Udhar
                                                    </div>
                                                )}
                                                {customer.balance < 0 && (
                                                    <div className="balance-badge balance-badge-success">
                                                        <ArrowDownLeft size={14} />
                                                        Advance
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <ChevronRight size={24} className="text-muted" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Empty State (if no customers) */}
            {customers.length === 0 && (
                <div className="glass-card rounded-xl p-12 text-center">
                    <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                        <User size={40} color="white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Customers Yet</h3>
                    <p className="text-muted mb-6">Start by adding your first customer</p>
                    <button
                        className="btn btn-gradient"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={20} /> Add First Customer
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}
