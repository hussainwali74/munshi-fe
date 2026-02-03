'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { translations, Language } from '@/lib/translations';
import { Search, Edit2, X, Check, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { updateCustomTranslation, deleteCustomTranslation, getMergedTranslations, CustomTranslation } from './translation-actions';
import { toast } from 'react-hot-toast';
import { SkeletonTranslationCard } from '@/components/Skeleton';
import { useLanguage } from '@/context/LanguageContext';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

// Helper to flatten keys but keep structure for grouping
function getFlattenedKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    return Object.keys(obj).reduce((acc: string[], k: string) => {
        const pre = prefix.length ? prefix + '.' : '';
        const value = obj[k];
        if (isRecord(value) && !Array.isArray(value)) {
            acc.push(...getFlattenedKeys(value, pre + k));
        } else {
            acc.push(pre + k);
        }
        return acc;
    }, []);
}

interface TranslationPair {
    key: string;
    en: string;
    ur: string;
    isCustomEn: boolean;
    isCustomUr: boolean;
}

export default function TranslationManager() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [customMap, setCustomMap] = useState<Record<string, string>>({}); // format: "lang:key" -> value
    const [systemMap, setSystemMap] = useState<Record<string, string>>({}); // format: "lang:key" -> value
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ en: string, ur: string }>({ en: '', ur: '' });
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ 'dashboard': true, 'common': true });

    // Load translations
    const loadTranslations = useCallback(async () => {
        try {
            const { system, custom } = await getMergedTranslations();

            const sysMap: Record<string, string> = {};
            system.forEach((item: CustomTranslation) => {
                sysMap[`${item.lang}:${item.key}`] = item.value;
            });
            setSystemMap(sysMap);

            const cusMap: Record<string, string> = {};
            custom.forEach((item: CustomTranslation) => {
                cusMap[`${item.lang}:${item.key}`] = item.value;
            });
            setCustomMap(cusMap);
        } catch (error) {
            console.error(error);
            toast.error(t('settings.translationManager.loadFailed'));
        } finally {
            setIsInitialLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadTranslations();
    }, [loadTranslations]);

    // Prepare data
    const allData = useMemo(() => {
        // Get all known keys from file AND database (system)
        const fileKeys = getFlattenedKeys(translations.en as Record<string, unknown>);
        const dbKeys = Object.keys(systemMap)
            .filter(k => k.startsWith('en:'))
            .map(k => k.substring(3));

        const allKeys = Array.from(new Set([...fileKeys, ...dbKeys])).sort();

        const grouped: Record<string, TranslationPair[]> = {};

        allKeys.forEach(key => {
            // Determine section (first part of key)
            const parts = key.split('.');
            const section = parts[0]; // e.g., 'common', 'dashboard'

            // Get original values (prefer DB system over file)
            const getOriginal = (lang: Language, k: string) => {
                // Check DB system first
                const dbVal = systemMap[`${lang}:${k}`];
                if (dbVal) return dbVal;

                // Fallback to file
                const p = k.split('.');
                let curr: unknown = translations[lang] as Record<string, unknown>;
                for (const part of p) {
                    if (!isRecord(curr) || !(part in curr)) return '';
                    curr = curr[part];
                }
                return typeof curr === 'string' ? curr : '';
            };

            const originalEn = getOriginal('en', key);
            const originalUr = getOriginal('ur', key);

            // Get current values (custom or original)
            const customEn = customMap[`en:${key}`];
            const customUr = customMap[`ur:${key}`];

            if (!grouped[section]) grouped[section] = [];

            grouped[section].push({
                key,
                en: customEn || originalEn,
                ur: customUr || originalUr,
                isCustomEn: !!customEn,
                isCustomUr: !!customUr
            });
        });

        return grouped;
    }, [customMap, systemMap]);

    const sections = Object.keys(allData).sort();

    const handleSave = async (key: string) => {
        setLoading(true);
        try {
            // Save English if changed
            if (editValues.en) {
                await updateCustomTranslation(key, 'en', editValues.en);
            }
            // Save Urdu if changed
            if (editValues.ur) {
                await updateCustomTranslation(key, 'ur', editValues.ur);
            }

            await loadTranslations();
            setEditingKey(null);
            toast.success(t('settings.translationManager.updateSuccess'));
            if (process.env.NODE_ENV !== 'test') {
                window.location.reload();
            }
        } catch {
            toast.error(t('settings.translationManager.saveFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleRevert = async (key: string, lang: 'en' | 'ur') => {
        const languageLabel = lang === 'en'
            ? t('settings.translationManager.languageEnglish')
            : t('settings.translationManager.languageUrdu');
        if (!confirm(t('settings.translationManager.revertConfirm', { language: languageLabel }))) return;
        setLoading(true);
        try {
            await deleteCustomTranslation(key, lang);
            await loadTranslations();
            setEditingKey(null); // Close edit mode if open
            toast.success(t('settings.translationManager.revertSuccess', { language: languageLabel }));
            if (process.env.NODE_ENV !== 'test') {
                window.location.reload();
            }
        } catch {
            toast.error(t('settings.translationManager.revertFailed'));
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Filter logic
    const filteredSections = sections.filter(section => {
        if (!searchTerm) return true;
        // If search term matches section name, show all items in section
        if (section.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        // Otherwise checks if any item in section matches
        return allData[section].some(item =>
            item.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ur.includes(searchTerm)
        );
    });

    return (
        <div className="space-y-6">
            <div className="relative">
                <input
                    type="text"
                    placeholder={t('settings.translationManager.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface shadow-sm focus:ring-1 focus:ring-primary outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            </div>

            <div className="space-y-4">
                {isInitialLoading ? (
                    // Skeleton loading state
                    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50/50 flex items-center gap-2">
                            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonTranslationCard key={i} />
                            ))}
                        </div>
                    </div>
                ) : filteredSections.map(section => {
                    const items = allData[section].filter(item =>
                        !searchTerm ||
                        section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.ur.includes(searchTerm)
                    );

                    if (items.length === 0) return null;

                    const isExpanded = expandedSections[section] || !!searchTerm; // Auto expand on search

                    return (
                        <div key={section} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleSection(section)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                            >
                                <h3 className="text-lg font-bold capitalize text-text-primary flex items-center gap-2">
                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    {section} <span className="text-sm font-normal text-text-secondary">({items.length})</span>
                                </h3>
                            </button>

                            {isExpanded && (
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {items.map(item => {
                                        const isEditing = editingKey === item.key;
                                        return (
                                            <div key={item.key} className="bg-background border border-border rounded-lg p-4 relative group hover:shadow-md transition-shadow">
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-xs font-semibold text-text-secondary uppercase">{t('settings.translationManager.languageEnglish')}</label>
                                                            <input
                                                                type="text"
                                                                value={editValues.en}
                                                                onChange={(e) => setEditValues({ ...editValues, en: e.target.value })}
                                                                className="w-full p-2 mt-1 rounded border border-primary outline-none text-sm bg-surface text-text-primary"
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-text-secondary uppercase">{t('settings.translationManager.languageUrdu')}</label>
                                                            <input
                                                                type="text"
                                                                value={editValues.ur}
                                                                onChange={(e) => setEditValues({ ...editValues, ur: e.target.value })}
                                                                className="w-full p-2 mt-1 rounded border border-primary outline-none text-sm text-right font-noto bg-surface text-text-primary"
                                                                dir="rtl"
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <button
                                                                onClick={() => setEditingKey(null)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                disabled={loading}
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSave(item.key)}
                                                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                                disabled={loading}
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="mb-3 border-b border-gray-100 pb-2">
                                                            <div className="flex justify-between items-start">
                                                                <p className="font-medium text-text-primary">{item.en}</p>
                                                                {item.isCustomEn && (
                                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-2">{t('settings.translationManager.customBadge')}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <p className="font-medium text-text-primary font-noto text-xl text-right w-full" dir="rtl">{item.ur}</p>
                                                                {item.isCustomUr && (
                                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{t('settings.translationManager.customBadge')}</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-surface shadow-sm p-1 rounded-lg border border-border">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingKey(item.key);
                                                                    setEditValues({ en: item.en, ur: item.ur });
                                                                }}
                                                                className="p-1.5 hover:bg-gray-100 rounded-md text-text-secondary"
                                                                title={t('settings.translationManager.editTitle')}
                                                                disabled={loading}
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            {(item.isCustomEn || item.isCustomUr) && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (item.isCustomEn && item.isCustomUr) {
                                                                            if (confirm(t('settings.translationManager.revertConfirmBoth'))) {
                                                                                handleRevert(item.key, 'en');
                                                                                handleRevert(item.key, 'ur');
                                                                            }
                                                                        } else if (item.isCustomEn) {
                                                                            handleRevert(item.key, 'en');
                                                                        } else {
                                                                            handleRevert(item.key, 'ur');
                                                                        }
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"
                                                                    title={t('settings.translationManager.revertTitle')}
                                                                    disabled={loading}
                                                                >
                                                                    <RotateCcw size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredSections.length === 0 && (
                    <div className="text-center py-12 text-text-secondary bg-surface rounded-xl border border-border">
                        <p>{t('settings.translationManager.noResults', { term: searchTerm })}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
