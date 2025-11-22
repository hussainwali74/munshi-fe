'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Users, Package, FileText, Settings, LogOut } from 'lucide-react';
import styles from './DashboardLayout.module.css';
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
        <div className={styles.container} style={{ direction: dir === 'rtl' ? 'ltr' : undefined }}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}
                style={{ direction: dir }}
            >
                <div className={styles.brand}>
                    <span className={styles.brandTitle}>Ezekata<span style={{ color: 'var(--text-primary)' }}>App</span></span>
                    <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
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
                        className={`${styles.navItem} w-full text-left`}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                        <LogOut size={20} />
                        <span>{t('common.signOut')}</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className={styles.main} style={{ direction: dir }}>
                <header className={styles.header} style={{ direction: 'ltr' }}>
                    <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span style={{ fontWeight: 600 }}>{t('common.dashboard')}</span>
                </header>

                <main className={styles.content} style={{ paddingBottom: '5rem' }}>
                    {children}
                </main>

                {/* Mobile Bottom Nav */}
                <div className={styles.bottomNav}>
                    {navItems.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.bottomNavItem} ${isActive ? styles.active : ''}`}
                            >
                                <Icon size={24} />
                                <span className="text-xs">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
