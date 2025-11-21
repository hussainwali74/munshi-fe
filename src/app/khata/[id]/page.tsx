
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Plus, Phone, MapPin, ArrowUpRight, ArrowDownLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState, use } from 'react';
import { addTransaction } from '../actions';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'purchase' | 'payment'>('purchase');

    // Unwrap params Promise
    const { id } = use(params);

    // Mock data - in production, fetch from DB based on id
    const customer = {
        id: id,
        name: 'Ahmed Ali',
        phone: '0300-1234561',
        address: 'Main Bazaar, Karachi',
        balance: 2500
    };

    const transactions = [
        {
            id: '1',
            date: '2024-01-20',
            type: 'credit',
            amount: 1500,
            description: 'Plumbing items',
            items: [
                { name: 'PVC Pipe 4"', qty: 2, price: 500 },
                { name: 'Elbow Joint', qty: 4, price: 125 }
            ],
            billAmount: 1500,
            paidAmount: 0
        },
        {
            id: '2',
            date: '2024-01-18',
            type: 'debit',
            amount: 1000,
            description: 'Payment received',
            paidAmount: 1000
        },
        {
            id: '3',
            date: '2024-01-15',
            type: 'credit',
            amount: 2000,
            description: 'Sanitary items',
            items: [
                { name: 'Washbasin', qty: 1, price: 2000 }
            ],
            billAmount: 2000,
            paidAmount: 0
        },
    ];

    return (
        <DashboardLayout>
            <Link href="/khata" className="flex items-center gap-2 text-primary mb-4 hover:underline">
                <ArrowLeft size={20} /> Back to Khata
            </Link>

            {/* Customer Header */}
            <div className="card mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-primary bg-primary/10">
                            <span className="text-2xl font-bold">{customer.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{customer.name}</h1>
                            <div className="flex flex-col gap-1 text-sm text-muted">
                                <div className="flex items-center gap-2">
                                    <Phone size={14} /> {customer.phone}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} /> {customer.address}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-muted mb-1">Current Balance</p>
                        <p className={`text-3xl font-bold ${customer.balance > 0 ? 'text-danger' : customer.balance < 0 ? 'text-success' : 'text-muted'}`}>
                            Rs {Math.abs(customer.balance)}
                        </p>
                        <p className="text-xs text-muted mt-1">
                            {customer.balance > 0 ? 'Udhar (Customer Owes)' : customer.balance < 0 ? 'Advance (Shop Owes)' : 'Settled'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 border-t border-border pt-4">
                    <button
                        className="btn btn-primary flex-1 justify-center"
                        onClick={() => {
                            setTransactionType('purchase');
                            setIsModalOpen(true);
                        }}
                    >
                        <ShoppingBag size={20} /> Add Purchase (Udhar)
                    </button>
                    <button
                        className="btn btn-secondary flex-1 justify-center"
                        onClick={() => {
                            setTransactionType('payment');
                            setIsModalOpen(true);
                        }}
                    >
                        <ArrowDownLeft size={20} /> Record Payment
                    </button>
                </div>
            </div>

            {/* Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-10">
                            <h2 className="text-xl font-bold">
                                {transactionType === 'purchase' ? 'Add Purchase (Udhar)' : 'Record Payment'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-secondary">
                                ✕
                            </button>
                        </div>

                        <form action={async (formData) => {
                            formData.append('customerId', customer.id);
                            formData.append('type', transactionType === 'purchase' ? 'credit' : 'debit');
                            await addTransaction(formData);
                            setIsModalOpen(false);
                        }} className="p-4 space-y-4">
                            <input type="hidden" name="customerId" value={customer.id} />

                            {transactionType === 'purchase' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Total Bill Amount (Rs)</label>
                                        <input name="billAmount" type="number" step="0.01" required className="input w-full" placeholder="0.00" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Amount Paid Now (Rs)</label>
                                        <input name="paidAmount" type="number" step="0.01" className="input w-full" placeholder="0.00" defaultValue="0" />
                                        <p className="text-xs text-muted mt-1">The remaining amount will be added to Udhar</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea name="description" className="input w-full" rows={2} placeholder="e.g. Plumbing items, Sanitary goods"></textarea>
                                    </div>

                                    <input type="hidden" name="amount" value="0" />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Payment Amount (Rs)</label>
                                        <input name="amount" type="number" step="0.01" required className="input w-full" placeholder="0.00" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                        <textarea name="description" className="input w-full" rows={2} placeholder="Payment notes"></textarea>
                                    </div>
                                </>
                            )}

                            <div className="pt-4">
                                <button type="submit" className="btn btn-primary w-full justify-center">
                                    {transactionType === 'purchase' ? 'Add Purchase' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="card">
                <h2 className="heading-2 mb-4">Transaction History</h2>

                {transactions.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((txn) => (
                            <div key={txn.id} className="p-4 rounded-lg border border-border">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`}>
                                            {txn.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {txn.type === 'credit' ? 'Purchase (Udhar)' : 'Payment Received'}
                                            </p>
                                            <p className="text-sm text-muted">{txn.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${txn.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                                            {txn.type === 'credit' ? '+' : '-'} Rs {txn.amount}
                                        </p>
                                        <p className="text-xs text-muted">{txn.date}</p>
                                    </div>
                                </div>

                                {txn.items && txn.items.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-xs font-medium text-muted mb-2">Items:</p>
                                        <div className="space-y-1">
                                            {txn.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span>{item.name} × {item.qty}</span>
                                                    <span className="font-medium">Rs {item.price * item.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {txn.billAmount !== undefined && (
                                            <div className="mt-2 pt-2 border-t border-border flex justify-between text-sm">
                                                <span className="font-medium">Bill Total:</span>
                                                <span className="font-bold">Rs {txn.billAmount}</span>
                                            </div>
                                        )}
                                        {txn.paidAmount !== undefined && txn.paidAmount > 0 && (
                                            <div className="flex justify-between text-sm text-success">
                                                <span>Paid:</span>
                                                <span>Rs {txn.paidAmount}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
