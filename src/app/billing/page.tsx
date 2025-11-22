'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Trash2, Mic, MicOff, ShoppingCart, User, Calculator, Save, X } from 'lucide-react';
import { searchCustomers } from '@/app/dashboard/search-actions';
import { searchInventoryItems, createBill } from './actions';
import AddCustomerModal from '@/components/AddCustomerModal';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    maxQty: number; // Available stock
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
}

export default function BillingPage() {
    const { t } = useLanguage();
    const router = useRouter();

    // State
    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

    const [itemQuery, setItemQuery] = useState('');
    const [itemResults, setItemResults] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
    const [discountValue, setDiscountValue] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState<'cash' | 'credit'>('cash');

    const [isListening, setIsListening] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs for click outside
    const customerSearchRef = useRef<HTMLDivElement>(null);
    const itemSearchRef = useRef<HTMLDivElement>(null);

    // Search Customers
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (customerQuery.trim().length > 0 && !selectedCustomer) {
                const data = await searchCustomers(customerQuery);
                setCustomerResults(data || []);
            } else {
                setCustomerResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [customerQuery, selectedCustomer]);

    // Search Items
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (itemQuery.trim().length > 0) {
                const data = await searchInventoryItems(itemQuery);
                setItemResults(data || []);
            } else {
                setItemResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [itemQuery]);

    // Click Outside Handlers
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
                setCustomerResults([]);
            }
            if (itemSearchRef.current && !itemSearchRef.current.contains(event.target as Node)) {
                setItemResults([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calculations
    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = discountType === 'fixed' ? discountValue : (subTotal * discountValue / 100);
    const totalAmount = Math.max(0, subTotal - discountAmount);

    // Handlers
    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { id: item.id, name: item.name, price: item.selling_price, qty: 1, maxQty: item.quantity }];
        });
        setItemQuery('');
        setItemResults([]);
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQty = (id: string, qty: number) => {
        if (qty < 1) return;
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.min(qty, i.maxQty) } : i));
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice input not supported in this browser.');
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US'; // Or 'ur-PK' if we want Urdu support later

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice Input:', transcript);

            // Simple parsing: "2 [item name]"
            // Try to find number at start
            const match = transcript.match(/^(\d+)\s+(.+)$/);
            let qty = 1;
            let query = transcript;

            if (match) {
                qty = parseInt(match[1]);
                query = match[2];
            }

            // Search for item
            const items = await searchInventoryItems(query);
            if (items && items.length > 0) {
                // Add first match
                const item = items[0];
                setCart(prev => {
                    const existing = prev.find(i => i.id === item.id);
                    if (existing) {
                        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + qty } : i);
                    }
                    return [...prev, { id: item.id, name: item.name, price: item.selling_price, qty: qty, maxQty: item.quantity }];
                });
            } else {
                alert(`Item not found: ${query}`);
            }
        };

        recognition.start();
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            alert('Please select a customer');
            return;
        }
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('customerId', selectedCustomer.id);
            formData.append('items', JSON.stringify(cart));
            formData.append('totalAmount', subTotal.toString());
            formData.append('discount', discountAmount.toString());
            formData.append('finalAmount', totalAmount.toString());
            formData.append('paidAmount', paidAmount.toString());
            formData.append('paymentMode', paymentMode);

            await createBill(formData);

            // Reset
            setCart([]);
            setSelectedCustomer(null);
            setCustomerQuery('');
            setPaidAmount(0);
            setDiscountValue(0);
            alert('Bill created successfully!');
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to create bill');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">New Bill</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleVoiceInput}
                        className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-surface border border-border text-text-secondary hover:text-primary'}`}
                        title="Voice Billing"
                    >
                        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Customer & Items */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer Selection */}
                    <div className="bg-surface rounded-[0.75rem] p-6 shadow-md border border-border" ref={customerSearchRef}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <User size={20} className="text-primary" /> Customer
                            </h2>
                            <button
                                onClick={() => setIsAddCustomerOpen(true)}
                                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                            >
                                <Plus size={16} /> New Customer
                            </button>
                        </div>

                        {selectedCustomer ? (
                            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-[0.75rem] border border-primary/20">
                                <div>
                                    <p className="font-bold text-text-primary">{selectedCustomer.name}</p>
                                    <p className="text-sm text-text-secondary">{selectedCustomer.phone}</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedCustomer(null); setCustomerQuery(''); }}
                                    className="text-text-secondary hover:text-danger"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full p-3 pl-10 rounded-[0.75rem] border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Search customer..."
                                    value={customerQuery}
                                    onChange={(e) => setCustomerQuery(e.target.value)}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />

                                {customerResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-[0.75rem] shadow-xl border border-border z-20 max-h-60 overflow-y-auto">
                                        {customerResults.map(c => (
                                            <div
                                                key={c.id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-border last:border-0"
                                                onClick={() => {
                                                    setSelectedCustomer(c);
                                                    setCustomerResults([]);
                                                    setCustomerQuery('');
                                                }}
                                            >
                                                <p className="font-semibold">{c.name}</p>
                                                <p className="text-xs text-text-secondary">{c.phone}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Item Selection */}
                    <div className="bg-surface rounded-[0.75rem] p-6 shadow-md border border-border h-[500px] flex flex-col">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <ShoppingCart size={20} className="text-primary" /> Items
                        </h2>

                        <div className="relative mb-4" ref={itemSearchRef}>
                            <input
                                type="text"
                                className="w-full p-3 pl-10 rounded-[0.75rem] border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Search items to add..."
                                value={itemQuery}
                                onChange={(e) => setItemQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />

                            {itemResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-[0.75rem] shadow-xl border border-border z-20 max-h-60 overflow-y-auto">
                                    {itemResults.map(item => (
                                        <div
                                            key={item.id}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-border last:border-0 flex justify-between items-center"
                                            onClick={() => addToCart(item)}
                                        >
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-xs text-text-secondary">Stock: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-primary">Rs {item.selling_price}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart List */}
                        <div className="flex-1 overflow-y-auto border border-border rounded-[0.75rem]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-text-secondary font-medium sticky top-0">
                                    <tr>
                                        <th className="p-3">Item</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right">Price</th>
                                        <th className="p-3 text-right">Total</th>
                                        <th className="p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-text-secondary">
                                                Cart is empty. Search items or use voice.
                                            </td>
                                        </tr>
                                    ) : cart.map(item => (
                                        <tr key={item.id}>
                                            <td className="p-3 font-medium">{item.name}</td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                                        onClick={() => updateQty(item.id, item.qty - 1)}
                                                    >-</button>
                                                    <span className="w-8 text-center">{item.qty}</span>
                                                    <button
                                                        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                                        onClick={() => updateQty(item.id, item.qty + 1)}
                                                    >+</button>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">Rs {item.price}</td>
                                            <td className="p-3 text-right font-bold">Rs {item.price * item.qty}</td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-text-secondary hover:text-danger"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    <div className="bg-surface rounded-[0.75rem] p-6 shadow-md border border-border sticky top-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <Calculator size={20} className="text-primary" /> Summary
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-text-secondary">
                                <span>Subtotal</span>
                                <span>Rs {subTotal}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Discount</span>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="p-1 rounded border border-border text-sm bg-background"
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value as any)}
                                    >
                                        <option value="fixed">Rs</option>
                                        <option value="percent">%</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="w-20 p-1 rounded border border-border text-right text-sm bg-background"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-success text-sm">
                                    <span>Discount Applied</span>
                                    <span>- Rs {discountAmount}</span>
                                </div>
                            )}

                            <div className="border-t border-border pt-4 flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span>Rs {totalAmount}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-primary">Payment Mode</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        className={`p-2 rounded-[0.75rem] border font-medium transition-all ${paymentMode === 'cash' ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary'}`}
                                        onClick={() => { setPaymentMode('cash'); setPaidAmount(totalAmount); }}
                                    >
                                        Cash
                                    </button>
                                    <button
                                        className={`p-2 rounded-[0.75rem] border font-medium transition-all ${paymentMode === 'credit' ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary'}`}
                                        onClick={() => { setPaymentMode('credit'); setPaidAmount(0); }}
                                    >
                                        Udhar (Credit)
                                    </button>
                                </div>
                            </div>

                            {paymentMode === 'credit' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-text-primary">Paid Amount (Advance)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-[0.75rem] border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )}

                            <button
                                className="w-full py-4 rounded-[0.75rem] bg-primary text-white font-bold text-lg shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSubmit}
                                disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                            >
                                {isSubmitting ? 'Processing...' : (
                                    <>
                                        <Save size={20} /> Create Bill
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AddCustomerModal
                isOpen={isAddCustomerOpen}
                onClose={() => setIsAddCustomerOpen(false)}
                onSuccess={() => {
                    // Ideally fetch the new customer here or show a success message
                    alert('Customer added! Please search for them.');
                }}
            />
        </DashboardLayout>
    );
}
