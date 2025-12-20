'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Trash2, Mic, MicOff, ShoppingCart, User, Calculator, Save, X, Package, Minus, Receipt, Loader2 } from 'lucide-react';
import { searchCustomers } from '@/app/dashboard/search-actions';
import { searchInventoryItems, createBill } from './actions';
import AddCustomerModal from '@/components/AddCustomerModal';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { formatCNIC } from '@/lib/utils';

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
    cnic?: string;
}

export default function BillingPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';
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
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [isSearchingItem, setIsSearchingItem] = useState(false);

    // Refs for click outside
    const customerSearchRef = useRef<HTMLDivElement>(null);
    const itemSearchRef = useRef<HTMLDivElement>(null);

    // Search Customers
    useEffect(() => {
        if (customerQuery.trim().length > 0 && !selectedCustomer) {
            setIsSearchingCustomer(true);
        }
        const delayDebounceFn = setTimeout(async () => {
            if (customerQuery.trim().length > 0 && !selectedCustomer) {
                const data = await searchCustomers(customerQuery);
                setCustomerResults(data || []);
            } else {
                setCustomerResults([]);
            }
            setIsSearchingCustomer(false);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [customerQuery, selectedCustomer]);

    // Search Items
    useEffect(() => {
        if (itemQuery.trim().length > 0) {
            setIsSearchingItem(true);
        }
        const delayDebounceFn = setTimeout(async () => {
            if (itemQuery.trim().length > 0) {
                const data = await searchInventoryItems(itemQuery);
                setItemResults(data || []);
            } else {
                setItemResults([]);
            }
            setIsSearchingItem(false);
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
    const udharAmount = paymentMode === 'credit' ? totalAmount - paidAmount : 0;

    // Handlers
    const addToCart = (item: any) => {
        // Check if item exists and is at max quantity before updating state
        const existing = cart.find(i => i.id === item.id);
        if (existing && existing.qty >= existing.maxQty) {
            toast.error(`Maximum stock available: ${existing.maxQty}`);
            return;
        }

        setCart(prev => {
            const existingItem = prev.find(i => i.id === item.id);
            if (existingItem) {
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

        // Check max quantity before updating state
        const item = cart.find(i => i.id === id);
        if (item && qty > item.maxQty) {
            toast.error(`Maximum stock available: ${item.maxQty}`);
            setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.maxQty } : i));
            return;
        }

        setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error('Voice input not supported in this browser.');
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice Input:', transcript);

            const match = transcript.match(/^(\d+)\s+(.+)$/);
            let qty = 1;
            let query = transcript;

            if (match) {
                qty = parseInt(match[1]);
                query = match[2];
            }

            const items = await searchInventoryItems(query);
            if (items && items.length > 0) {
                const item = items[0];
                setCart(prev => {
                    const existing = prev.find(i => i.id === item.id);
                    if (existing) {
                        const newQty = Math.min(existing.qty + qty, existing.maxQty);
                        return prev.map(i => i.id === item.id ? { ...i, qty: newQty } : i);
                    }
                    return [...prev, { id: item.id, name: item.name, price: item.selling_price, qty: Math.min(qty, item.quantity), maxQty: item.quantity }];
                });
                toast.success(`Added ${item.name} to cart`);
            } else {
                toast.error(`Item not found: ${query}`);
            }
        };

        recognition.start();
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            toast.error(t('billing.selectCustomerAlert'));
            return;
        }
        if (cart.length === 0) {
            toast.error(t('billing.cartEmptyAlert'));
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
            toast.success(t('billing.billCreated'));
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(t('billing.failedCreateBill'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div dir={isRtl ? 'rtl' : 'ltr'}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Receipt size={28} className="text-primary" />
                            </div>
                            {t('billing.title')}
                        </h1>
                    </div>
                    <button
                        onClick={handleVoiceInput}
                        className={`p-3 rounded-xl transition-all shadow-sm ${isListening
                            ? 'bg-red-100 text-red-600 animate-pulse border-2 border-red-300'
                            : 'bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary'
                            }`}
                        title={t('billing.voiceBilling')}
                    >
                        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Customer & Items */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Customer Selection */}
                        <div className="bg-surface rounded-xl p-6 shadow-md border border-border" ref={customerSearchRef}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <User size={18} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    {t('billing.customer')}
                                </h2>
                                <button
                                    onClick={() => setIsAddCustomerOpen(true)}
                                    className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                    <Plus size={16} /> {t('billing.newCustomer')}
                                </button>
                            </div>

                            {selectedCustomer ? (
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {selectedCustomer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary">{selectedCustomer.name}</p>
                                            <p className="text-sm text-text-secondary">
                                                {selectedCustomer.phone || selectedCustomer.address || '-'}
                                                {selectedCustomer.cnic && ` • ${formatCNIC(selectedCustomer.cnic)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedCustomer(null); setCustomerQuery(''); }}
                                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`w-full p-3.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                                        placeholder={t('billing.searchCustomer')}
                                        value={customerQuery}
                                        onChange={(e) => setCustomerQuery(e.target.value)}
                                    />
                                    <Search className={`absolute top-1/2 -translate-y-1/2 text-text-secondary ${isRtl ? 'right-4' : 'left-4'}`} size={18} />
                                    {isSearchingCustomer && (
                                        <Loader2 className={`absolute top-1/2 -translate-y-1/2 text-primary animate-spin ${isRtl ? 'left-4' : 'right-4'}`} size={18} />
                                    )}

                                    {customerResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border border-border z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                            {customerResults.map(c => (
                                                <div
                                                    key={c.id}
                                                    className="p-3 hover:bg-background cursor-pointer border-b border-border last:border-0 flex items-center gap-3 transition-colors"
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setCustomerResults([]);
                                                        setCustomerQuery('');
                                                    }}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-text-primary">{c.name}</p>
                                                        <p className="text-xs text-text-secondary">
                                                            {c.phone}
                                                            {c.cnic && ` • ${formatCNIC(c.cnic)}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Item Selection */}
                        <div className="bg-surface rounded-xl p-6 shadow-md border border-border flex flex-col" style={{ minHeight: '450px' }}>
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <ShoppingCart size={18} className="text-green-600 dark:text-green-400" />
                                </div>
                                {t('billing.items')}
                                {cart.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                                        {cart.length}
                                    </span>
                                )}
                            </h2>

                            <div className="relative mb-4" ref={itemSearchRef}>
                                <input
                                    type="text"
                                    className={`w-full p-3.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                                    placeholder={t('billing.searchItems')}
                                    value={itemQuery}
                                    onChange={(e) => setItemQuery(e.target.value)}
                                />
                                <Search className={`absolute top-1/2 -translate-y-1/2 text-text-secondary ${isRtl ? 'right-4' : 'left-4'}`} size={18} />
                                {isSearchingItem && (
                                    <Loader2 className={`absolute top-1/2 -translate-y-1/2 text-primary animate-spin ${isRtl ? 'left-4' : 'right-4'}`} size={18} />
                                )}

                                {itemResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border border-border z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                        {itemResults.map(item => (
                                            <div
                                                key={item.id}
                                                className="p-3 hover:bg-background cursor-pointer border-b border-border last:border-0 flex justify-between items-center transition-colors"
                                                onClick={() => addToCart(item)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center">
                                                        <Package size={18} className="text-text-secondary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-text-primary">{item.name}</p>
                                                        <p className="text-xs text-text-secondary">{t('billing.stock')}: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">Rs {item.selling_price}</p>
                                                    <button className="text-xs text-primary hover:underline flex items-center gap-1">
                                                        <Plus size={12} /> Add
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cart List */}
                            <div className="flex-1 overflow-y-auto border border-border rounded-xl bg-background/50">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-12 text-text-secondary">
                                        <ShoppingCart size={48} className="mb-3 opacity-30" />
                                        <p className="text-center">{t('billing.cartEmpty')}</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-sm table-fixed">
                                        <thead className="bg-background text-text-secondary font-medium sticky top-0 border-b border-border">
                                            <tr>
                                                <th className="p-3 w-[40%]">{t('billing.item')}</th>
                                                <th className="p-3 text-center w-[25%]">{t('billing.qty')}</th>
                                                <th className={`p-3 w-[15%] ${isRtl ? 'text-left' : 'text-right'}`}>{t('billing.price')}</th>
                                                <th className={`p-3 w-[15%] ${isRtl ? 'text-left' : 'text-right'}`}>{t('billing.total')}</th>
                                                <th className="p-3 w-[5%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {cart.map(item => (
                                                <tr key={item.id} className="hover:bg-background/80 transition-colors">
                                                    <td className="p-3">
                                                        <span className="font-medium text-text-primary">{item.name}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                className="w-7 h-7 rounded-lg bg-surface border border-border hover:bg-background hover:border-primary flex items-center justify-center transition-colors"
                                                                onClick={() => updateQty(item.id, item.qty - 1)}
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={item.qty}
                                                                onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                                                                className="w-12 text-center p-1 rounded-lg border border-border bg-surface text-text-primary focus:border-primary outline-none"
                                                                min="1"
                                                                max={item.maxQty}
                                                            />
                                                            <button
                                                                className="w-7 h-7 rounded-lg bg-surface border border-border hover:bg-background hover:border-primary flex items-center justify-center transition-colors"
                                                                onClick={() => updateQty(item.id, item.qty + 1)}
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className={`p-3 text-text-secondary ${isRtl ? 'text-left' : 'text-right'}`}>
                                                        Rs {item.price}
                                                    </td>
                                                    <td className={`p-3 font-bold text-text-primary ${isRtl ? 'text-left' : 'text-right'}`}>
                                                        Rs {item.price * item.qty}
                                                    </td>
                                                    <td className="p-3">
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="space-y-6">
                        <div className="bg-surface rounded-xl p-6 shadow-md border border-border sticky top-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Calculator size={18} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                {t('billing.summary')}
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-text-secondary">
                                    <span>{t('billing.subtotal')}</span>
                                    <span className="font-medium text-text-primary">Rs {subTotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary">{t('billing.discount')}</span>
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="p-1.5 rounded-lg border border-border text-sm bg-background text-text-primary focus:border-primary outline-none"
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value as any)}
                                        >
                                            <option value="fixed">Rs</option>
                                            <option value="percent">%</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="w-20 p-1.5 rounded-lg border border-border text-right text-sm bg-background text-text-primary focus:border-primary outline-none"
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-success text-sm bg-success/10 p-2 rounded-lg">
                                        <span>{t('billing.discountApplied')}</span>
                                        <span className="font-medium">- Rs {discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="border-t border-border pt-4 flex justify-between font-bold text-xl">
                                    <span>{t('billing.total')}</span>
                                    <span className="text-primary">Rs {totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-text-primary">{t('billing.paymentMode')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            className={`p-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 ${paymentMode === 'cash'
                                                ? 'bg-success text-white border-success shadow-lg shadow-success/25'
                                                : 'bg-background border-border text-text-secondary hover:border-success hover:text-success'
                                                }`}
                                            onClick={() => { setPaymentMode('cash'); setPaidAmount(totalAmount); }}
                                        >
                                            💵 {t('billing.cash')}
                                        </button>
                                        <button
                                            className={`p-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 ${paymentMode === 'credit'
                                                ? 'bg-warning text-white border-warning shadow-lg shadow-warning/25'
                                                : 'bg-background border-border text-text-secondary hover:border-warning hover:text-warning'
                                                }`}
                                            onClick={() => { setPaymentMode('credit'); setPaidAmount(0); }}
                                        >
                                            📝 {t('billing.udharCredit')}
                                        </button>
                                    </div>
                                </div>

                                {paymentMode === 'credit' && (
                                    <div className="animate-in slide-in-from-top-2 duration-200">
                                        <label className="block text-sm font-semibold mb-2 text-text-primary">{t('billing.paidAmount')}</label>
                                        <input
                                            type="number"
                                            className="w-full p-3.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text-primary"
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                            min="0"
                                            max={totalAmount}
                                        />
                                        {udharAmount > 0 && (
                                            <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                                <p className="text-sm text-warning font-medium flex items-center justify-between">
                                                    <span>Remaining Udhar:</span>
                                                    <span className="text-lg font-bold">Rs {udharAmount.toLocaleString()}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            {t('billing.processing')}
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} /> {t('billing.createBill')}
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
                        toast.success(t('billing.customerAdded'));
                    }}
                />
            </div>
        </DashboardLayout>
    );
}
