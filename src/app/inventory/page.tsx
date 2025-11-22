
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Package, Filter, X, Upload, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addInventoryItem } from './actions';
import { createClient } from '@supabase/supabase-js';
import EditInventoryModal from '@/components/EditInventoryModal';
import { useLanguage } from '@/context/LanguageContext';

// Initialize supabase client for client-side fetching
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InventoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const { t } = useLanguage();

    // Fetch inventory items
    useEffect(() => {
        const fetchInventory = async () => {
            // In a real app, you would filter by the logged-in user
            // For now, assuming RLS or manual filtering on server, but here we just fetch all for demo
            // or fetch by user_id if we had the user context available here easily.
            // Actually, RLS policies should handle it if configured.
            const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
            if (data) setItems(data);
        };

        fetchInventory();

        // Subscribe to changes
        const channel = supabase
            .channel('inventory_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
                fetchInventory();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="heading-1" style={{ marginBottom: 0 }}>{t('inventory.title')}</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> {t('inventory.addItem')}
                </button>
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <EditInventoryModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                />
            )}

            {/* Add Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-xl font-bold">{t('inventory.addItem')}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-secondary">
                                <X size={24} />
                            </button>
                        </div>

                        <form action={async (formData) => {
                            await addInventoryItem(formData);
                            setIsModalOpen(false);
                        }} className="p-4 space-y-4">

                            {/* Image Upload */}
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-background">
                                <Upload size={32} className="text-text-secondary mb-2" />
                                <label htmlFor="image" className="text-primary font-medium cursor-pointer">
                                    {t('inventory.uploadImage')}
                                </label>
                                <input type="file" id="image" name="image" accept="image/*" className="hidden" />
                                <p className="text-xs text-muted mt-1">PNG, JPG up to 5MB</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('inventory.itemName')}</label>
                                    <input name="name" type="text" required className="input" placeholder={t('inventory.placeholders.itemName')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('inventory.category')}</label>
                                    <select name="category" className="input">
                                        <option value="sanitary">{t('inventory.categories.sanitary')}</option>
                                        <option value="electrical">{t('inventory.categories.electrical')}</option>
                                        <option value="plumbing">{t('inventory.categories.plumbing')}</option>
                                        <option value="other">{t('inventory.categories.other')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('inventory.price')} (Rs)</label>
                                    <input name="price" type="number" required className="input" placeholder={t('inventory.placeholders.price')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('inventory.quantity')}</label>
                                    <input name="quantity" type="number" required className="input" placeholder={t('inventory.placeholders.quantity')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('inventory.size')}</label>
                                    <input name="size" type="text" className="input" placeholder={t('inventory.placeholders.size')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('inventory.color')}</label>
                                    <input name="color" type="text" className="input" placeholder={t('inventory.placeholders.color')} />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="btn btn-primary w-full justify-center">
                                    {t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 rounded-lg p-2 flex-1" style={{ border: '1px solid var(--border)' }}>
                        <Search size={20} className="text-muted" />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            className="w-full"
                            style={{ outline: 'none', border: 'none', background: 'transparent' }}
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter size={20} /> Filter
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="w-full text-start" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 font-medium text-muted text-start">{t('inventory.itemName')}</th>
                                <th className="p-3 font-medium text-muted text-start">{t('inventory.category')}</th>
                                <th className="p-3 font-medium text-muted text-start">{t('inventory.stock')}</th>
                                <th className="p-3 font-medium text-muted text-start">{t('inventory.price')}</th>
                                <th className="p-3 font-medium text-muted text-start">{t('inventory.status')}</th>
                                <th className="p-3 font-medium text-muted text-start">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted">
                                        {t('inventory.noItems')}
                                    </td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50/50 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded flex items-center justify-center text-muted overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={16} />
                                                )}
                                            </div>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-muted capitalize">{t(`inventory.categories.${item.category}`)}</td>
                                    <td className="p-3 font-medium">{item.quantity}</td>
                                    <td className="p-3">Rs {item.selling_price}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full font-medium ${item.quantity < 10 ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`} style={{ fontSize: '0.75rem' }}>
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
