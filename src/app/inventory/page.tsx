'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Package, Filter, X, Upload, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState, useEffect, useMemo } from 'react';
import { addInventoryItem, getInventoryItems, deleteInventoryItem } from './actions';
import { createClient } from '@supabase/supabase-js';
import EditInventoryModal from '@/components/EditInventoryModal';
import { useLanguage } from '@/context/LanguageContext';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

export default function InventoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
    const [addImageFile, setAddImageFile] = useState<File | null>(null);
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize supabase client for realtime subscriptions ONLY
    // Create it inside the component to avoid build-time errors
    const supabase = useMemo(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.warn('Supabase credentials not available, realtime updates disabled');
            return null;
        }

        return createClient(url, key);
    }, []);

    const fetchInventory = async () => {
        // Use Server Action to fetch data securely with cookies
        const data = await getInventoryItems();
        console.log('Inventory items:', data);
        setItems(data || []);
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

        // Subscribe to changes only if supabase client is available
        if (!supabase) {
            console.log('Realtime updates disabled - Supabase client not initialized');
            return;
        }

        // Note: Realtime subscriptions in Supabase JS client don't need auth if RLS allows reading public rows or if policy allows.
        // Since we have "No public access" policies, this subscription might fail without a session in the client.
        // However, for now, we rely on Server Action for initial fetch and re-fetch on updates manually or optimistic UI.
        // But let's keep it for now. If it fails, it just won't auto-update.
        const channel = supabase
            .channel('inventory_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
                fetchInventory();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <DashboardLayout>
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
                            for (let [key, value] of formData.entries()) {
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
                                <div className="w-full bg-gray-200 rounded h-2 mb-4 overflow-hidden">
                                    <div className="h-full w-1/3 bg-primary animate-pulse"></div>
                                </div>
                            )}

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.productImage')}</label>

                                {addImagePreview ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border bg-gray-50">
                                            <img src={addImagePreview} alt="Preview" className="w-full h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddImagePreview(null);
                                                    setAddImageFile(null);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white text-red-500 rounded-full shadow-sm transition-colors backdrop-blur-sm"
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
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-background hover:bg-gray-50 transition-colors group cursor-pointer relative">
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
                                    <select name="category" disabled={isSubmitting} className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none">
                                        <option value="sanitary">{t('inventory.categories.sanitary')}</option>
                                        <option value="electrical">{t('inventory.categories.electrical')}</option>
                                        <option value="plumbing">{t('inventory.categories.plumbing')}</option>
                                        <option value="other">{t('inventory.categories.other')}</option>
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
                <div className="p-4 flex items-center gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            className="w-full p-3 pl-10 rounded-xl border border-border bg-background text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface text-text-primary hover:bg-gray-50 transition-colors font-medium">
                        <Filter size={20} /> Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-text-secondary font-medium border-b border-border">
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
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-text-secondary">
                                        {t('inventory.noItems')}
                                    </td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-text-secondary overflow-hidden bg-gray-100 border border-border shrink-0">
                                                {item.image_url ? (
                                                    <img
                                                        src={getImageUrl(item.image_url)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement?.classList.add('fallback-icon');
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
                                    <td className="p-3 text-text-secondary capitalize">{t(`inventory.categories.${item.category}`)}</td>
                                    <td className="p-3 font-medium text-text-primary">{item.quantity}</td>
                                    <td className="p-3 text-text-primary">Rs {item.selling_price}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.quantity < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
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
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
        </DashboardLayout>
    );
}
