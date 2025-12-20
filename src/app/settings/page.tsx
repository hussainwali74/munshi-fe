'use client';

import { updateShopDetails, getCategories, addCategory, removeCategory, getShopDetails } from './actions';
import { Settings as SettingsIcon, Languages as LanguagesIcon, Store as StoreIcon, Tags as TagsIcon, Plus, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';
import TranslationManager from './TranslationManager';
import { toast } from 'react-hot-toast';
import { formatShopPhone, validateShopPhone } from '@/lib/utils';


export default function SettingsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';
    const [activeTab, setActiveTab] = useState<'shop' | 'categories' | 'translations'>('shop');

    // Categories state
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [removingCategory, setRemovingCategory] = useState<string | null>(null);

    // Shop details state
    const [shopDetails, setShopDetails] = useState({
        businessName: '',
        fullName: '',
        shopPhone: '',
        shopAddress: ''
    });
    const [isLoadingShopDetails, setIsLoadingShopDetails] = useState(true);
    const [isSavingShop, setIsSavingShop] = useState(false);

    // Fetch shop details on mount
    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoadingShopDetails(true);
            try {
                const data = await getShopDetails();
                if (data) {
                    setShopDetails({
                        businessName: data.businessName || '',
                        fullName: data.fullName || '',
                        shopPhone: data.shopPhone || '',
                        shopAddress: data.shopAddress || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching shop details:', error);
            } finally {
                setIsLoadingShopDetails(false);
            }
        };
        fetchDetails();
    }, []);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast.error(t('settings.categoryNameRequired') || 'Category name is required');
            return;
        }

        setIsAddingCategory(true);
        try {
            const result = await addCategory(newCategory);
            if (result.success) {
                setCategories([...categories, newCategory.trim().toLowerCase()]);
                setNewCategory('');
                toast.success(t('settings.categoryAdded') || 'Category added successfully');
            } else {
                toast.error(result.error || 'Failed to add category');
            }
        } catch {
            toast.error('Failed to add category');
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleRemoveCategory = async (category: string) => {
        if (categories.length <= 1) {
            toast.error(t('settings.cannotRemoveLastCategory') || 'Cannot remove the last category');
            return;
        }

        setRemovingCategory(category);
        try {
            const result = await removeCategory(category);
            if (result.success) {
                setCategories(categories.filter(c => c !== category));
                toast.success(t('settings.categoryRemoved') || 'Category removed successfully');
            } else {
                toast.error(result.error || 'Failed to remove category');
            }
        } catch {
            toast.error('Failed to remove category');
        } finally {
            setRemovingCategory(null);
        }
    };

    const handleShopUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateShopPhone(shopDetails.shopPhone)) {
            toast.error('Invalid phone format. Must be 03XX-XXXXXX-X');
            return;
        }

        setIsSavingShop(true);

        try {
            const formData = new FormData(e.currentTarget);
            await updateShopDetails(formData);
            toast.success(t('settings.shopDetailsSaved') || 'Shop details saved successfully');
        } catch (error) {
            console.error('Error updating shop details:', error);
            toast.error('Failed to update shop details');
        } finally {
            setIsSavingShop(false);
        }
    };

    return (
        <>
            <div className="mb-8" dir={isRtl ? 'rtl' : 'ltr'}>
                <h1 className="text-3xl font-bold mb-2">{t('settings.title')}</h1>
                <p className="text-text-secondary">{t('settings.subtitle')}</p>
            </div>

            <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2" dir={isRtl ? 'rtl' : 'ltr'}>
                <button
                    onClick={() => setActiveTab('shop')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'shop'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-surface text-text-secondary hover:bg-primary/5 hover:text-primary border border-border'
                        }`}
                >
                    <StoreIcon size={20} />
                    {t('settings.detailsTitle')}
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'categories'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-surface text-text-secondary hover:bg-primary/5 hover:text-primary border border-border'
                        }`}
                >
                    <TagsIcon size={20} />
                    {t('settings.categories') || 'Categories'}
                </button>
                <button
                    onClick={() => setActiveTab('translations')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'translations'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-surface text-text-secondary hover:bg-primary/5 hover:text-primary border border-border'
                        }`}
                >
                    <LanguagesIcon size={20} />
                    {t('settings.translations') || 'Translations'}
                </button>
            </div>

            <div dir={isRtl ? 'rtl' : 'ltr'}>
                {activeTab === 'shop' ? (
                    <div className="bg-surface rounded-xl p-8 shadow-md border border-border max-w-2xl">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                                <SettingsIcon className="text-primary" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">{t('settings.detailsTitle')}</h2>
                                <p className="text-sm text-text-secondary">{t('settings.detailsSubtitle')}</p>
                            </div>
                        </div>

                        {isLoadingShopDetails ? (
                            <div className="space-y-6 animate-pulse">
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleShopUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.shopName')}</label>
                                    <input
                                        name="businessName"
                                        type="text"
                                        value={shopDetails.businessName}
                                        onChange={(e) => setShopDetails(prev => ({ ...prev, businessName: e.target.value }))}
                                        className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder={t('settings.placeholders.shopName')}
                                        required
                                        disabled={isSavingShop}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.ownerName')}</label>
                                    <input
                                        name="fullName"
                                        type="text"
                                        value={shopDetails.fullName}
                                        onChange={(e) => setShopDetails(prev => ({ ...prev, fullName: e.target.value }))}
                                        className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder={t('settings.placeholders.ownerName')}
                                        required
                                        disabled={isSavingShop}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.shopPhone')}</label>
                                        <input
                                            name="shopPhone"
                                            type="tel"
                                            value={shopDetails.shopPhone}
                                            onChange={(e) => {
                                                const formatted = formatShopPhone(e.target.value);
                                                setShopDetails(prev => ({ ...prev, shopPhone: formatted }));
                                            }}
                                            className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-left"
                                            placeholder="0332-828280-8"
                                            dir="ltr"
                                            disabled={isSavingShop}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.shopAddress')}</label>
                                        <input
                                            name="shopAddress"
                                            type="text"
                                            value={shopDetails.shopAddress}
                                            onChange={(e) => setShopDetails(prev => ({ ...prev, shopAddress: e.target.value }))}
                                            className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder={t('settings.placeholders.address')}
                                            disabled={isSavingShop}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSavingShop}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingShop && <Loader2 size={18} className="animate-spin" />}
                                        {t('settings.save')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : activeTab === 'categories' ? (
                    <div className="bg-surface rounded-xl p-8 shadow-md border border-border max-w-2xl">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                                <TagsIcon className="text-primary" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">{t('settings.categoriesTitle') || 'Inventory Categories'}</h2>
                                <p className="text-sm text-text-secondary">{t('settings.categoriesSubtitle') || 'Manage categories for your inventory items'}</p>
                            </div>
                        </div>

                        {/* Add New Category */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.addNewCategory') || 'Add New Category'}</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                    className="flex-1 p-3 rounded-xl border border-border bg-background text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder={t('settings.categoryPlaceholder') || 'e.g. Electronics'}
                                    disabled={isAddingCategory}
                                />
                                <button
                                    onClick={handleAddCategory}
                                    disabled={isAddingCategory || !newCategory.trim()}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAddingCategory ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Plus size={20} />
                                    )}
                                    {t('common.add') || 'Add'}
                                </button>
                            </div>
                        </div>

                        {/* Categories List */}
                        <div>
                            <label className="block text-sm font-semibold mb-3 text-text-primary">{t('settings.currentCategories') || 'Current Categories'}</label>
                            {isLoadingCategories ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : categories.length === 0 ? (
                                <p className="text-text-secondary text-center py-8">{t('settings.noCategories') || 'No categories found'}</p>
                            ) : (
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <div
                                            key={category}
                                            className="flex items-center justify-between p-4 bg-background rounded-xl border border-border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <TagsIcon size={16} className="text-primary" />
                                                </div>
                                                <span className="font-medium text-text-primary capitalize">{category}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveCategory(category)}
                                                disabled={removingCategory === category || categories.length <= 1}
                                                className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={categories.length <= 1 ? (t('settings.cannotRemoveLastCategory') || 'Cannot remove the last category') : (t('common.delete') || 'Delete')}
                                            >
                                                {removingCategory === category ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <X size={18} />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
                            <p className="text-sm text-primary">
                                <strong>{t('common.note') || 'Note'}:</strong> {t('settings.categoriesNote') || 'Categories are used when adding inventory items. Changes will be reflected in the inventory page.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <TranslationManager />
                )}
            </div>
        </>
    );
}
