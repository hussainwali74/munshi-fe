'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { updateInventoryItem } from '@/app/inventory/actions';
import { useLanguage } from '@/context/LanguageContext';

interface EditInventoryModalProps {
    item: any;
    onClose: () => void;
}

export default function EditInventoryModal({ item, onClose }: EditInventoryModalProps) {
    const { t } = useLanguage();
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
            <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-xl font-bold">{t('common.edit')} Item</h2>
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
                }} className="p-6 space-y-6">

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium mb-1">{t('inventory.productImage')}</label>

                        {previewUrl ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
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
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-background hover:bg-surface transition-colors">
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
                                <p className="text-xs text-muted mt-1">PNG, JPG up to 5MB</p>
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
                            <label className="block text-sm font-medium mb-1">{t('inventory.itemName')}</label>
                            <input name="name" type="text" required defaultValue={item.name} className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('inventory.category')}</label>
                            <select name="category" defaultValue={item.category} className="input">
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
                            <input name="price" type="number" required defaultValue={item.selling_price} className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('inventory.quantity')}</label>
                            <input name="quantity" type="number" required defaultValue={item.quantity} className="input" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('inventory.size')}</label>
                            <input name="size" type="text" defaultValue={item.size} className="input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('inventory.color')}</label>
                            <input name="color" type="text" defaultValue={item.color} className="input" />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1 justify-center">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary flex-1 justify-center">
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
