'use client';

import { Search, Plus, Package, X, Upload, Edit, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { addInventoryItem, getInventoryItems, deleteInventoryItem } from './actions';
import { getCategories } from '@/app/settings/actions';
import EditInventoryModal from '@/components/EditInventoryModal';
import { useLanguage } from '@/context/LanguageContext';
import { SkeletonTableRow } from '@/components/Skeleton';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

export default function InventoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
    const [addImageFile, setAddImageFile] = useState<File | null>(null);
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categories, setCategories] = useState<string[]>(['sanitary', 'electrical', 'plumbing', 'other']);

    const getCategoryLabel = (category: string) => {
        if (!category) return '';
        const key = `inventory.categories.${category}`;
        const translation = t(key);
        return translation === key ? category.charAt(0).toUpperCase() + category.slice(1) : translation;
    };

    // Fetch categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        loadCategories();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            // Use Server Action to fetch data securely with cookies
            const data = await getInventoryItems();
            console.log('Inventory items:', data);
            setItems(data || []);
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `https://${url}`;
    };

    const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('📸 Image selected:', file.name, file.size, file.type);
            const url = URL.createObjectURL(file);
            setAddImagePreview(url);
            setAddImageFile(file);
        }
    };

    const handleCloseAddModal = () => {
        setIsModalOpen(false);
        setAddImagePreview(null);
        setAddImageFile(null);
    };

    // Fetch inventory items
    useEffect(() => {
        fetchInventory();
    }, []);

    // Filter items based on search and filters
    const filteredItems = items.filter(item => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query ||
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.selling_price.toString().includes(query);

        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesSize = !selectedSize || (item.size && item.size.toLowerCase().includes(selectedSize.toLowerCase()));
        const matchesPrice = (minPrice === '' || item.selling_price >= minPrice) &&
            (maxPrice === '' || item.selling_price <= maxPrice);

        return matchesSearch && matchesCategory && matchesSize && matchesPrice;
    });

    const suggestions = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showSuggestions) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showSuggestions]);

    return (

        <div dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold mb-0 tracking-tight">{t('inventory.title')}</h1>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> {t('inventory.addItem')}
                </button>
            </div>

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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleCloseAddModal}>
                    <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-xl font-bold">{t('inventory.addItem')}</h2>
                            <button onClick={handleCloseAddModal} className="text-text-secondary hover:text-text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formElement = e.currentTarget;
                            const formData = new FormData(formElement);

                            // Manually append the file from state if it exists
                            if (addImageFile) {
                                console.log('📎 Appending image file to formData:', addImageFile.name, addImageFile.size, addImageFile.type);
                                formData.set('image', addImageFile);
                            } else {
                                console.log('⚠️ No image file in state to upload');
                            }

                            // Debug: Log all FormData entries
                            console.log('📋 FormData contents:');
                            for (const [key, value] of formData.entries()) {
                                if (value instanceof File) {
                                    console.log(`  ${key}:`, value.name, value.size, 'bytes', value.type);
                                } else {
                                    console.log(`  ${key}:`, value);
                                }
                            }

                            try {
                                setIsSubmitting(true);               // ← start spinner
                                // Show a toast on success/failure
                                await addInventoryItem(formData);
                                toast.success('✅ Item added successfully');
                                console.log('✅ Item added successfully');
                                handleCloseAddModal();
                                // Refresh list
                                const data = await getInventoryItems();
                                setItems(data || []);
                            } catch (error) {
                                console.error('❌ Error adding item:', error);
                                toast.error('❌ Error adding item');
                                alert('Error: ' + (error as Error).message);
                            } finally {
                                setIsSubmitting(false);              // ← stop spinner
                            }
                        }} className="p-4 space-y-4">
                            {/* Progress bar (indeterminate) */}
                            {isSubmitting && (
                                <div className="w-full bg-border rounded h-2 mb-4 overflow-hidden">
                                    <div className="h-full w-1/3 bg-primary animate-pulse"></div>
                                </div>
                            )}

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.productImage')}</label>

                                {addImagePreview ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border bg-background">
                                            <Image src={addImagePreview} alt="Preview" fill className="object-contain" unoptimized />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddImagePreview(null);
                                                    setAddImageFile(null);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-surface/80 hover:bg-surface text-danger rounded-full shadow-sm transition-colors backdrop-blur-sm"
                                                title={t('inventory.deleteImage')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="flex justify-end">
                                            <label htmlFor="image-replace" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors">
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
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-background hover:bg-surface transition-colors group cursor-pointer relative">
                                        <Upload size={32} className="text-text-secondary mb-2 group-hover:text-primary transition-colors" />
                                        <span className="text-primary font-medium group-hover:underline">
                                            {t('inventory.uploadImage')}
                                        </span>
                                        <input
                                            type="file"
                                            id="image"
                                            name="image"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isSubmitting}
                                            onChange={handleAddImageChange}
                                        />
                                        <p className="text-xs text-text-secondary mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.itemName')}</label>
                                    <input name="name" type="text" required disabled={isSubmitting} className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder={t('inventory.placeholders.itemName')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.category')}</label>
                                    <select name="category" disabled={isSubmitting} className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none capitalize">
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.price')} (Rs)</label>
                                    <input name="price" type="number" required disabled={isSubmitting} className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder={t('inventory.placeholders.price')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.quantity')}</label>
                                    <input name="quantity" type="number" required disabled={isSubmitting} className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder={t('inventory.placeholders.quantity')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.size')}</label>
                                    <input name="size" type="text" disabled={isSubmitting} className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder={t('inventory.placeholders.size')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.color')}</label>
                                    <input name="color" type="text" disabled={isSubmitting} className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder={t('inventory.placeholders.color')} />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px">
                                    {isSubmitting ? <Loader2 className="animate-spin" data-testid="loader" /> : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-surface rounded-xl border border-border shadow-md mb-6 overflow-hidden">
                <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full p-3 pl-10 rounded-xl border border-border bg-background text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && searchQuery && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 border-b border-border bg-background/50 text-xs font-semibold text-text-secondary uppercase tracking-wider px-4">
                                        {t('inventory.suggestions') || 'Product Suggestions'}
                                    </div>
                                    {suggestions.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setSearchQuery(item.name);
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full p-3 flex items-center gap-3 hover:bg-background/80 transition-colors text-left"
                                        >
                                            <div className="relative w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
                                                {item.image_url ? (
                                                    <Image src={getImageUrl(item.image_url)} alt="" fill className="object-cover" />
                                                ) : (
                                                    <Package size={16} className="text-text-secondary" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-text-primary truncate">{item.name}</div>
                                                <div className="text-xs text-text-secondary capitalize">
                                                    {getCategoryLabel(item.category)} • Rs {item.selling_price}
                                                    {item.size ? ` • ${item.size}` : ''}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-200 p-1">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">{t('inventory.category')}</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-border bg-background text-text-primary focus:ring-1 focus:ring-primary outline-none transition-all capitalize"
                            >
                                <option value="">{t('common.all') || 'All Categories'}</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">{t('inventory.size')}</label>
                            <input
                                type="text"
                                placeholder={t('inventory.placeholders.size')}
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-border bg-background text-text-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">{t('inventory.price')} (Min)</label>
                                <input
                                    type="number"
                                    placeholder="Min Rs"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full p-2.5 rounded-xl border border-border bg-background text-text-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">{t('inventory.price')} (Max)</label>
                                <input
                                    type="number"
                                    placeholder="Max Rs"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full p-2.5 rounded-xl border border-border bg-background text-text-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-background/50 text-text-secondary font-medium border-b border-border">
                        <tr className="border-b border-border">
                            <th className="p-3 font-medium text-left">{t('inventory.itemName')}</th>
                            <th className="p-3 font-medium text-left">{t('inventory.category')}</th>
                            <th className="p-3 font-medium text-left">{t('inventory.stock')}</th>
                            <th className="p-3 font-medium text-left">{t('inventory.price')}</th>
                            <th className="p-3 font-medium text-left">{t('inventory.status')}</th>
                            <th className="p-3 font-medium text-left">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            // Skeleton loading state
                            Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonTableRow key={i} columns={6} />
                            ))
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-text-secondary">
                                    {t('inventory.noItems')}
                                </td>
                            </tr>
                        ) : filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors">
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-lg flex items-center justify-center text-text-secondary overflow-hidden bg-background border border-border shrink-0">
                                            {item.image_url ? (
                                                <Image
                                                    src={getImageUrl(item.image_url)}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        const target = e.currentTarget as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        target.parentElement?.classList.add('fallback-icon');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`hidden ${!item.image_url ? 'block' : ''} fallback-icon`}>
                                                <Package size={20} />
                                            </div>
                                        </div>
                                        <span className="font-medium text-text-primary">{item.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-text-secondary capitalize">{getCategoryLabel(item.category)}</td>
                                <td className="p-3 font-medium text-text-primary">{item.quantity}</td>
                                <td className="p-3 text-text-primary">Rs {item.selling_price}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.quantity < 10 ? 'bg-danger/10 text-danger dark:bg-danger/20 dark:text-red-400' : 'bg-success/10 text-success dark:bg-success/20 dark:text-emerald-400'}`}>
                                        {item.quantity < 10 ? t('inventory.lowStock') : t('inventory.inStock')}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => setEditingItem(item)}
                                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                        title={t('common.edit')}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm(t('inventory.confirmDelete') || 'Are you sure you want to delete this item?')) {
                                                await deleteInventoryItem(item.id);
                                                const data = await getInventoryItems();
                                                setItems(data || []);
                                            }
                                        }}
                                        className="p-2 text-danger hover:bg-danger/10 rounded-full transition-colors"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
}
