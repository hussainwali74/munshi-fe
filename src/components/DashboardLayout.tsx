'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Users, Package, FileText, Settings, LogOut } from 'lucide-react';
import styles from './DashboardLayout.module.css';
import { signOut } from '@/app/login/actions';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', icon: Home, href: '/' },
        { name: 'Khata (Ledger)', icon: FileText, href: '/khata' },
        { name: 'Inventory', icon: Package, href: '/inventory' },
        { name: 'Employees', icon: Users, href: '/employees' },
        { name: 'Settings', icon: Settings, href: '/settings' },
    ];

    return (
        <div className={styles.container}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.brand}>
                    <span className={styles.brandTitle}>Dukan<span style={{ color: 'var(--text-primary)' }}>App</span></span>
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

                    <button
                        onClick={() => signOut()}
                        className={`${styles.navItem} w-full text-left mt-auto`}
                        style={{ marginTop: 'auto', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className={styles.main}>
                <header className={styles.header}>
                    <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span style={{ fontWeight: 600 }}>Dashboard</span>
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
