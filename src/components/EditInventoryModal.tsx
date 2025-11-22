'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { updateInventoryItem } from '@/app/inventory/actions';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

interface EditInventoryModalProps {
    item: any;
    onClose: () => void;
}

export default function EditInventoryModal({ item, onClose }: EditInventoryModalProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [previewUrl, setPreviewUrl] = useState<string | null>(item.image_url);
    const [deleteImage, setDeleteImage] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setDeleteImage(false);
        }
    };

    const handleDeleteImage = () => {
        setPreviewUrl(null);
        setDeleteImage(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-[0.75rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-xl font-bold text-text-primary">{t('common.edit')} Item</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form action={async (formData) => {
                    formData.append('id', item.id);
                    if (deleteImage) {
                        formData.append('deleteImage', 'true');
                    }
                    await updateInventoryItem(formData);
                    onClose();
                    // Force refresh of the page/data since we can't easily pass setItems here without prop drilling
                    // or we could assume Realtime works, but router.refresh() is safer for server components.
                    // Since Page is client-side fetching, router.refresh won't help unless we move fetch to server component.
                    // But we added window.location.reload() as a fallback or just rely on parent re-fetch if we passed a callback.
                    window.location.reload();
                }} className="p-6 space-y-6">

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.productImage')}</label>

                        {previewUrl ? (
                            <div className="relative w-full h-48 rounded-[0.75rem] overflow-hidden border border-border group">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDeleteImage}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        title={t('inventory.deleteImage')}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-[0.75rem] bg-background hover:bg-surface transition-colors">
                                <Upload size={32} className="text-text-secondary mb-2" />
                                <label htmlFor="edit-image" className="text-primary font-medium cursor-pointer hover:underline">
                                    {t('inventory.uploadNewImage')}
                                </label>
                                <input
                                    type="file"
                                    id="edit-image"
                                    name="image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <p className="text-xs text-text-secondary mt-1">PNG, JPG up to 5MB</p>
                            </div>
                        )}

                        {previewUrl && !deleteImage && (
                            <div className="flex justify-end">
                                <label htmlFor="edit-image-replace" className="text-xs text-primary cursor-pointer hover:underline">
                                    {t('inventory.changeImage')}
                                </label>
                                <input
                                    type="file"
                                    id="edit-image-replace"
                                    name="image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.itemName')}</label>
                            <input name="name" type="text" required defaultValue={item.name} className="w-full p-2 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.category')}</label>
                            <select name="category" defaultValue={item.category} className="w-full p-2 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none">
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
                            <input name="price" type="number" required defaultValue={item.selling_price} className="w-full p-2 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.quantity')}</label>
                            <input name="quantity" type="number" required defaultValue={item.quantity} className="w-full p-2 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.size')}</label>
                            <input name="size" type="text" defaultValue={item.size} className="w-full p-2 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.color')}</label>
                            <input name="color" type="text" defaultValue={item.color} className="w-full p-2 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-[0.75rem] border border-border text-text-primary hover:bg-gray-50 transition-colors shadow-sm font-medium">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-[0.75rem] hover:bg-primary-dark transition-colors shadow-md">
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
