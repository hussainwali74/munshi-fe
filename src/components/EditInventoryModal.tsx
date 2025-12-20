'use client';

import { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { updateInventoryItem } from '@/app/inventory/actions';
import { useLanguage } from '@/context/LanguageContext';

interface EditInventoryModalProps {
    item: any;
    categories?: string[];
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditInventoryModal({ item, categories = ['sanitary', 'electrical', 'plumbing', 'other'], onClose, onUpdate }: EditInventoryModalProps) {
    const { t } = useLanguage();

    const getCategoryLabel = (category: string) => {
        if (!category) return '';
        const key = `inventory.categories.${category}`;
        const translation = t(key);
        return translation === key ? category.charAt(0).toUpperCase() + category.slice(1) : translation;
    };
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

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `https://${url}`;
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
                    onUpdate();
                    onClose();
                }} className="p-6 space-y-6">

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium mb-1 text-text-primary">{t('inventory.productImage')}</label>

                        {previewUrl ? (
                            <div className="flex flex-col gap-3">
                                <div className="relative w-full h-48 rounded-[0.75rem] overflow-hidden border border-border bg-background">
                                    <Image
                                        src={getImageUrl(previewUrl)}
                                        alt="Preview"
                                        fill
                                        className="object-contain"
                                        unoptimized
                                        onError={(e) => {
                                            const target = e.currentTarget as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.parentElement?.classList.add('bg-background', 'flex', 'items-center', 'justify-center');
                                            target.parentElement!.innerHTML = '<div class="text-text-secondary flex flex-col items-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off mb-2"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 6.69C11.24 5.77 12.6 5.77 13.41 6.69L15 8.28 18 5.27L20 7.27"/><path d="M18.22 18.22L12.13 12.13"/><path d="M2 12L5 15L6.3 13.7"/><path d="M22 15.89V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.18-.39"/></svg><span>Image not found</span></div>';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleDeleteImage}
                                        className="absolute top-2 right-2 p-2 bg-surface/80 hover:bg-surface text-danger rounded-full shadow-sm transition-colors backdrop-blur-sm"
                                        title={t('inventory.deleteImage')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <label htmlFor="edit-image-replace" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors">
                                        <Upload size={16} />
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
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-[0.75rem] bg-background hover:bg-surface transition-colors group cursor-pointer relative">
                                <Upload size={32} className="text-text-secondary mb-2 group-hover:text-primary transition-colors" />
                                <span className="text-primary font-medium group-hover:underline">
                                    {t('inventory.uploadNewImage')}
                                </span>
                                <input
                                    type="file"
                                    id="edit-image"
                                    name="image"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                                <p className="text-xs text-text-secondary mt-1">PNG, JPG up to 5MB</p>
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
                            <select name="category" defaultValue={item.category} className="w-full p-2 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none capitalize">
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                                ))}
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
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-[0.75rem] border border-border text-text-primary hover:bg-background/80 transition-colors shadow-sm font-medium">
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
