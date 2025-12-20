
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { updateShopDetails } from './actions';
import { Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';

    return (
        <DashboardLayout>
            <div className="mb-8" dir={isRtl ? 'rtl' : 'ltr'}>
                <h1 className="text-3xl font-bold mb-2">{t('settings.title')}</h1>
                <p className="text-text-secondary">{t('settings.subtitle')}</p>
            </div>

            <div className="bg-surface rounded-xl p-8 shadow-md border border-border max-w-2xl" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                        <SettingsIcon className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">{t('settings.detailsTitle')}</h2>
                        <p className="text-sm text-text-secondary">{t('settings.detailsSubtitle')}</p>
                    </div>
                </div>

                <form action={updateShopDetails} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.shopName')}</label>
                        <input
                            name="businessName"
                            type="text"
                            className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder={t('settings.placeholders.shopName')}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.ownerName')}</label>
                        <input
                            name="fullName"
                            type="text"
                            className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder={t('settings.placeholders.ownerName')}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.shopPhone')}</label>
                            <input
                                name="shopPhone"
                                type="tel"
                                className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-left"
                                placeholder={t('settings.placeholders.phone')}
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-primary">{t('settings.shopAddress')}</label>
                            <input
                                name="shopAddress"
                                type="text"
                                className="w-full p-3 rounded-xl border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder={t('settings.placeholders.address')}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm hover:-translate-y-px">
                            {t('settings.save')}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
