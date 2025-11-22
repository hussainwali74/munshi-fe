'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Users, Package, FileText, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/app/login/actions';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { t, dir } = useLanguage();

    const navItems = [
        { name: t('common.home'), icon: Home, href: '/' },
        { name: t('common.khata'), icon: FileText, href: '/khata' },
        { name: t('common.inventory'), icon: Package, href: '/inventory' },
        { name: t('common.employees'), icon: Users, href: '/employees' },
        { name: t('common.settings'), icon: Settings, href: '/settings' },
    ];

    return (
        <div className="flex min-h-screen relative" style={{ direction: dir === 'rtl' ? 'ltr' : undefined }}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-surface border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{ direction: dir }}
            >
                <div className="p-6 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-primary">Ezekata<span className="text-text-primary">App</span></span>
                    <button className="md:hidden text-text-primary" onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="px-4 flex flex-col gap-2 h-[calc(100%-88px)] overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-[0.75rem] font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary hover:bg-background hover:text-text-primary'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="mt-auto px-4 py-2 space-y-2">
                        <div className="flex gap-2">
                            <ThemeToggle />
                            <LanguageToggle />
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-[0.75rem] font-medium text-text-secondary hover:bg-background hover:text-text-primary bg-transparent border-none cursor-pointer"
                    >
                        <LogOut size={20} />
                        <span>{t('common.signOut')}</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-background" style={{ direction: dir }}>
                <header className="md:hidden bg-surface border-b border-border p-4 flex items-center gap-4" style={{ direction: 'ltr' }}>
                    <button className="text-text-primary bg-transparent border-none cursor-pointer" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-lg">{t('common.dashboard')}</span>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
                    {children}
                </main>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-2 flex justify-around z-40">
                    {navItems.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 p-2 rounded-[0.75rem] text-xs ${
                                    isActive ? 'text-primary' : 'text-text-secondary'
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
