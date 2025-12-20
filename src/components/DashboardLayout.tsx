'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Users, Package, FileText } from 'lucide-react';
import Sidebar from './Sidebar';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { t, dir } = useLanguage();

    const navItems = [
        { name: t('common.home'), icon: Home, href: '/dashboard' },
        { name: t('common.khata'), icon: FileText, href: '/khata' },
        { name: t('common.inventory'), icon: Package, href: '/inventory' },
        { name: t('common.employees'), icon: Users, href: '/employees' },
    ];

    return (
        <div className="flex min-h-screen relative" style={{ direction: dir === 'rtl' ? 'ltr' : undefined }}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-background" style={{ direction: dir }}>
                {/* Mobile Header */}
                <header className="md:hidden bg-surface border-b border-border p-4 flex items-center gap-4 sticky top-0 z-30" style={{ direction: 'ltr' }}>
                    <button
                        className="text-text-primary bg-transparent border-none cursor-pointer hover:text-primary transition-colors p-1 rounded-lg hover:bg-background"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-lg">{t('common.dashboard')}</span>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-2 flex justify-around z-40 shadow-lg">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all duration-200 ${isActive
                                    ? 'text-primary bg-primary/10'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                <Icon size={24} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
