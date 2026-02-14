'use client';

import { Search, Plus, Package, X, Upload, Edit, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useEffect, useMemo, useRef, useState } from 'react';
import { addInventoryItem, deleteInventoryItem, getInventoryItems } from './actions';
import { getCategories } from '@/app/settings/actions';
import EditInventoryModal from '@/components/EditInventoryModal';
import { useLanguage } from '@/context/LanguageContext';
import type { InventoryItem } from '@/types/inventory';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = ['sanitary', 'electrical', 'plumbing', 'other'];

export default function InventoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
    const [addImageFile, setAddImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

    const { t, language } = useLanguage();
    const isRtl = language === 'ur';
    const searchContainerRef = useRef<HTMLDivElement | null>(null);

    const getCategoryLabel = (category: string) => {
        if (!category) return '';
        const key = `inventory.categories.${category}`;
        const translation = t(key);
        return translation === key
            ? category.charAt(0).toUpperCase() + category.slice(1)
            : translation;
    };

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const data = await getInventoryItems();
            setItems(data || []);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getCategories();
                if (Array.isArray(data) && data.length > 0) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!searchContainerRef.current?.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return items;

        return items.filter((item) =>
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            String(item.selling_price).includes(query)
        );
    }, [items, searchQuery]);

    const suggestions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return [];

        return items
            .filter((item) =>
                item.name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            )
            .slice(0, 5);
    }, [items, searchQuery]);

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

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `https://${url}`;
    };

    const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setAddImagePreview(url);
        setAddImageFile(file);
    };

    const handleCloseAddModal = () => {
        setIsModalOpen(false);
        setAddImagePreview(null);
        setAddImageFile(null);
    };

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-7">
            <section className="-mx-4 border-b border-[#dbe1e8] bg-[#f6f8fb] px-4 py-4 md:-mx-8 md:px-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] md:text-3xl">{t('inventory.title')}</h1>
                        <p className="mt-1 text-sm text-[#64748b] md:text-lg">{formattedDate}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d9dee6] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e293b] shadow-sm md:text-sm">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span>{language === 'ur' ? 'سسٹم فعال' : 'System Active'}</span>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <h2 className="text-3xl font-extrabold leading-none tracking-tight text-[#0f172a] md:text-4xl">{t('inventory.title')}</h2>

                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto" ref={searchContainerRef}>
                        <div className="relative w-full sm:w-[320px] md:w-[380px]">
                            <Search className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#94a3b8] ${isRtl ? 'right-4' : 'left-4'}`} size={22} />
                            <input
                                type="text"
                                placeholder={language === 'ur' ? 'اشیاء تلاش کریں...' : 'Search items...'}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className={`h-12 w-full rounded-xl border border-[#d8dde6] bg-white text-base text-[#1e293b] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'}`}
                            />

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[#d8dde6] bg-white shadow-xl">
                                    {suggestions.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery(item.name);
                                                setShowSuggestions(false);
                                            }}
                                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f8fafc] ${isRtl ? 'flex-row-reverse text-right' : ''}`}
                                        >
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2f7] text-[#94a3b8]">
                                                <Package size={16} />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-[#1e293b]">{item.name}</span>
                                                <span className="block truncate text-xs text-[#64748b]">
                                                    {getCategoryLabel(item.category)} • Rs {Number(item.selling_price).toLocaleString()}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 text-base font-semibold text-white transition hover:bg-[#020617]"
                        >
                            <Plus size={18} />
                            {t('inventory.addItem')}
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="overflow-hidden rounded-3xl border border-[#dde3ea] bg-white">
                                <div className="h-40 animate-pulse bg-[#edf2f7]" />
                                <div className="space-y-3 p-5">
                                    <div className="h-5 w-20 animate-pulse rounded-full bg-[#edf2f7]" />
                                    <div className="h-7 w-2/3 animate-pulse rounded bg-[#edf2f7]" />
                                    <div className="h-7 w-full animate-pulse rounded bg-[#edf2f7]" />
                                    <div className="h-6 w-32 animate-pulse rounded bg-[#edf2f7]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#cad4df] bg-[#f8fafc] px-6 py-20 text-center">
                        <p className="text-2xl font-semibold text-[#1e293b]">{t('inventory.noItems')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {filteredItems.map((item) => (
                            <article
                                key={item.id}
                                className="group overflow-hidden rounded-3xl border border-[#d9dee6] bg-white shadow-[0_1px_1px_rgba(15,23,42,0.03)]"
                            >
                                <div className="relative h-40 border-b border-[#e4e9f0] bg-[#edf2f7]">
                                    {item.image_url ? (
                                        <Image
                                            src={getImageUrl(item.image_url)}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-[#bfcbda]">
                                            <Package size={74} strokeWidth={1.4} />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(item)}
                                        className={`absolute top-3 rounded-xl border border-[#d8dde6] bg-white/95 p-2 text-[#475569] opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-[#0f172a] ${isRtl ? 'left-3' : 'right-3'}`}
                                        title={t('common.edit')}
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>

                                <div className="space-y-3 px-5 py-6">
                                    <span className="inline-flex rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#475569]">
                                        {getCategoryLabel(item.category)}
                                    </span>
                                    <h3 className="min-h-[2.75rem] text-xl font-semibold leading-tight text-[#0f172a]">{item.name}</h3>

                                    <div className={`flex items-end justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <p className="text-2xl font-extrabold leading-none text-[#0f172a]">
                                            Rs. {Number(item.selling_price).toLocaleString()}
                                        </p>
                                        <p className="text-sm font-medium text-[#64748b] md:text-base">
                                            {language === 'ur' ? 'اسٹاک:' : 'Stock:'} {Number(item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center border-t border-[#eef2f7] pb-6 pt-4">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (confirm(t('inventory.confirmDelete') || 'Are you sure you want to delete this item?')) {
                                                await deleteInventoryItem(item.id);
                                                await fetchInventory();
                                            }
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#ef4444] transition hover:bg-red-50 md:text-base"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={16} />
                                        {t('common.delete')}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Edit Modal */}
            {editingItem && (
                <EditInventoryModal
                    item={editingItem}
                    categories={categories}
                    onClose={() => setEditingItem(null)}
                    onUpdate={fetchInventory}
                />
            )}

            {/* Add Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleCloseAddModal}>
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-border p-4">
                            <h2 className="text-xl font-bold">{t('inventory.addItem')}</h2>
                            <button onClick={handleCloseAddModal} className="text-text-secondary hover:text-text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const formElement = e.currentTarget;
                                const formData = new FormData(formElement);

                                if (addImageFile) {
                                    formData.set('image', addImageFile);
                                }

                                try {
                                    setIsSubmitting(true);
                                    await addInventoryItem(formData);
                                    toast.success(t('inventory.itemAdded'));
                                    handleCloseAddModal();
                                    await fetchInventory();
                                } catch (error) {
                                    console.error('Error adding item:', error);
                                    toast.error(t('inventory.itemAddFailed'));
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className="space-y-4 p-4"
                        >
                            {isSubmitting && (
                                <div className="mb-4 h-2 w-full overflow-hidden rounded bg-border">
                                    <div className="h-full w-1/3 animate-pulse bg-primary" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="mb-1 block text-sm font-medium text-text-primary">{t('inventory.productImage')}</label>

                                {addImagePreview ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-background">
                                            <Image src={addImagePreview} alt="Preview" fill className="object-contain" unoptimized />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddImagePreview(null);
                                                    setAddImageFile(null);
                                                }}
                                                className="absolute right-2 top-2 rounded-full bg-surface/80 p-2 text-danger shadow-sm backdrop-blur-sm transition-colors hover:bg-surface"
                                                title={t('inventory.deleteImage')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="flex justify-end">
                                            <label htmlFor="image-replace" className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                                                <Upload size={16} />
                                                {t('inventory.changeImage')}
                                            </label>
                                            <input
                                                type="file"
                                                id="image-replace"
                                                name="image"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={isSubmitting}
                                                onChange={handleAddImageChange}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-6 transition-colors hover:bg-surface">
                                        <Upload size={32} className="mb-2 text-text-secondary transition-colors group-hover:text-primary" />
                                        <span className="font-medium text-primary group-hover:underline">{t('inventory.uploadImage')}</span>
                                        <input
                                            type="file"
                                            id="image"
                                            name="image"
                                            accept="image/*"
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            disabled={isSubmitting}
                                            onChange={handleAddImageChange}
                                        />
                                        <p className="mt-1 text-xs text-text-secondary">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-primary">{t('inventory.itemName')}</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-border bg-surface p-2 text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder={t('inventory.placeholders.itemName')}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-primary">{t('inventory.category')}</label>
                                    <select
                                        name="category"
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-border bg-surface p-2 capitalize text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {getCategoryLabel(cat)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-primary">{t('inventory.price')} (Rs)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-border bg-surface p-2 text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder={t('inventory.placeholders.price')}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-primary">{t('inventory.quantity')}</label>
                                    <input
                                        name="quantity"
                                        type="number"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-border bg-surface p-2 text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder={t('inventory.placeholders.quantity')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-primary">{t('inventory.size')}</label>
                                    <input
                                        name="size"
                                        type="text"
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-border bg-surface p-2 text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder={t('inventory.placeholders.size')}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-primary">{t('inventory.color')}</label>
                                    <input
                                        name="color"
                                        type="text"
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg border border-border bg-surface p-2 text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder={t('inventory.placeholders.color')}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" data-testid="loader" /> : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
