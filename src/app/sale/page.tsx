'use client';

import { Loader2, Minus, Package, Plus, Search, ShoppingCart, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';
import { createSaleReceipt, getSaleInventoryItems } from './actions';
import type { InventorySearchItem } from '@/types/inventory';

interface SaleCartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    maxQty: number;
}

const GST_RATE = 18;

export const dynamic = 'force-dynamic';

export default function SalePage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';

    const [inventoryItems, setInventoryItems] = useState<InventorySearchItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [cart, setCart] = useState<SaleCartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadInventory = async () => {
        setIsLoading(true);
        try {
            const data = await getSaleInventoryItems();
            setInventoryItems(data || []);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const formattedDate = useMemo(
        () =>
            new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-GB', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(new Date()),
        [language]
    );

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return inventoryItems;

        return inventoryItems.filter((item) =>
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            String(item.selling_price).includes(query)
        );
    }, [inventoryItems, searchQuery]);

    const subtotal = useMemo(
        () => Math.round(cart.reduce((sum, item) => sum + item.price * item.qty, 0)),
        [cart]
    );
    const gstAmount = useMemo(
        () => Math.round((subtotal * GST_RATE) / 100),
        [subtotal]
    );
    const totalAmount = useMemo(
        () => subtotal + gstAmount,
        [subtotal, gstAmount]
    );

    const addItemToCart = (item: InventorySearchItem) => {
        if (item.quantity <= 0) {
            toast.error(t('sale.outOfStock'));
            return;
        }

        setCart((prev) => {
            const existing = prev.find((cartItem) => cartItem.id === item.id);
            if (!existing) {
                return [
                    ...prev,
                    {
                        id: item.id,
                        name: item.name,
                        price: item.selling_price,
                        qty: 1,
                        maxQty: item.quantity,
                    },
                ];
            }

            if (existing.qty >= existing.maxQty) {
                toast.error(t('sale.maxStockAvailable', { max: existing.maxQty }));
                return prev;
            }

            return prev.map((cartItem) =>
                cartItem.id === item.id
                    ? { ...cartItem, qty: cartItem.qty + 1 }
                    : cartItem
            );
        });
    };

    const changeCartQty = (id: string, direction: 'inc' | 'dec') => {
        setCart((prev) => {
            const currentItem = prev.find((item) => item.id === id);
            if (!currentItem) return prev;

            if (direction === 'inc') {
                if (currentItem.qty >= currentItem.maxQty) {
                    toast.error(t('sale.maxStockAvailable', { max: currentItem.maxQty }));
                    return prev;
                }
                return prev.map((item) =>
                    item.id === id ? { ...item, qty: item.qty + 1 } : item
                );
            }

            if (currentItem.qty <= 1) {
                return prev.filter((item) => item.id !== id);
            }

            return prev.map((item) =>
                item.id === id ? { ...item, qty: item.qty - 1 } : item
            );
        });
    };

    const removeCartItem = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const handleGenerateReceipt = async () => {
        if (!customerName.trim() || !customerPhone.trim()) {
            toast.error(t('sale.missingCustomer'));
            return;
        }
        if (cart.length === 0) {
            toast.error(t('sale.cartEmptyAlert'));
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('customerName', customerName.trim());
            formData.append('customerPhone', customerPhone.trim());
            formData.append('items', JSON.stringify(cart));
            formData.append('gstRate', String(GST_RATE));

            await createSaleReceipt(formData);
            toast.success(t('sale.receiptGenerated'));
            setCart([]);
            setCustomerName('');
            setCustomerPhone('');
            await loadInventory();
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : t('sale.failedGenerateReceipt');
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-7">
            <section className="-mx-4 border-b border-[#dbe1e8] bg-[#f6f8fb] px-4 py-4 md:-mx-8 md:px-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] md:text-3xl">{t('sale.title')}</h1>
                        <p className="mt-1 text-sm text-[#64748b] md:text-lg">{formattedDate}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d9dee6] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e293b] shadow-sm md:text-sm">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span>{t('sale.systemActive')}</span>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-extrabold leading-none tracking-tight text-[#0f172a] md:text-4xl">
                    {t('sale.newSale')}
                </h2>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.48fr]">
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#94a3b8] ${isRtl ? 'right-4' : 'left-4'}`} size={22} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('sale.searchItems')}
                                className={`h-12 w-full rounded-xl border border-[#d8dde6] bg-white text-base text-[#1e293b] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'}`}
                            />
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className="h-40 animate-pulse rounded-3xl border border-[#dde3ea] bg-white" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {filteredItems.map((item) => {
                                    const cartItem = cart.find((entry) => entry.id === item.id);
                                    const isSelected = !!cartItem;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => addItemToCart(item)}
                                            className={`w-full rounded-3xl border bg-white p-4 text-left shadow-[0_1px_1px_rgba(15,23,42,0.03)] transition hover:border-[#c2d3ea] ${isSelected ? 'border-[#5b9cff] ring-1 ring-[#5b9cff]/40' : 'border-[#d9dee6]'}`}
                                        >
                                            <div className={`flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef2f7] text-[#9aa9bb]">
                                                        <Package size={30} />
                                                    </span>
                                                    <div className={isRtl ? 'text-right' : ''}>
                                                        <p className="text-xl font-semibold text-[#0f172a]">{item.name}</p>
                                                        <p className="text-lg font-semibold text-[#64748b]">
                                                            Rs. {Number(item.selling_price).toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-[#8a9bb0]">
                                                            {t('sale.stock')}: {Number(item.quantity).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-2xl font-semibold text-[#0f172a]">+</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <aside className="h-fit rounded-3xl border border-[#d9dee6] bg-white p-6 shadow-[0_1px_1px_rgba(15,23,42,0.03)] xl:sticky xl:top-6">
                        <div className={`mb-6 flex items-center gap-2 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                            <ShoppingCart size={22} className="text-[#111827]" />
                            <h3 className="text-2xl font-extrabold text-[#111827]">{t('sale.currentSale')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-lg font-semibold text-[#111827]">{t('sale.customerName')}</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder={t('sale.customerNamePlaceholder')}
                                    className={`h-12 w-full rounded-xl border border-[#d8dde6] bg-[#f9fafb] px-4 text-base text-[#111827] outline-none transition focus:border-[#0f172a] ${isRtl ? 'text-right' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-lg font-semibold text-[#111827]">{t('sale.phoneNumber')}</label>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder={t('sale.phoneNumberPlaceholder')}
                                    className={`h-12 w-full rounded-xl border border-[#d8dde6] bg-[#f9fafb] px-4 text-base text-[#111827] outline-none transition focus:border-[#0f172a] ${isRtl ? 'text-right' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="my-5 border-t border-[#e5e9ef]" />

                        <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
                            {cart.length === 0 ? (
                                <p className={`rounded-xl bg-[#f5f7fb] p-4 text-sm text-[#64748b] ${isRtl ? 'text-right' : ''}`}>
                                    {t('sale.emptyCart')}
                                </p>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="rounded-xl bg-[#f5f7fb] px-3 py-3">
                                        <div className={`flex items-start justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                            <div className={isRtl ? 'text-right' : ''}>
                                                <p className="text-lg font-semibold text-[#111827]">{item.name}</p>
                                                <p className="text-sm font-semibold text-[#64748b]">Rs. {item.price.toLocaleString()}</p>
                                            </div>

                                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => changeCartQty(item.id, 'dec')}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#111827] transition hover:bg-white"
                                                    aria-label={t('sale.decreaseQty')}
                                                >
                                                    <Minus size={18} />
                                                </button>
                                                <span className="w-6 text-center text-base font-semibold text-[#111827]">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => changeCartQty(item.id, 'inc')}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#111827] transition hover:bg-white"
                                                    aria-label={t('sale.increaseQty')}
                                                >
                                                    <Plus size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCartItem(item.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                                                    aria-label={t('sale.removeItem')}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-5 border-t border-[#e5e9ef] pt-4">
                            <div className="space-y-1 text-base text-[#64748b]">
                                <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span>{t('sale.subtotal')}</span>
                                    <span className="text-[#111827]">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span>{t('sale.gst', { rate: GST_RATE })}</span>
                                    <span className="text-[#111827]">Rs. {gstAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="my-2 border-t border-[#e5e9ef]" />

                            <div className={`flex items-center justify-between text-2xl font-extrabold text-[#111827] ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span>{t('sale.total')}</span>
                                <span>Rs. {totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerateReceipt}
                            disabled={isSubmitting || cart.length === 0}
                            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#8e9196] text-base font-semibold text-white transition hover:bg-[#787b80] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
                            {t('sale.generateReceipt')}
                        </button>
                    </aside>
                </div>
            </section>
        </div>
    );
}
