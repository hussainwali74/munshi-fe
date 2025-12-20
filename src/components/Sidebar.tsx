'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, Users, Package, FileText, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/app/login/actions';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { t, dir } = useLanguage();

    const navItems = [
        { name: t('common.home'), icon: Home, href: '/dashboard' },
        { name: t('common.khata'), icon: FileText, href: '/khata' },
        { name: t('common.inventory'), icon: Package, href: '/inventory' },
        { name: t('common.employees'), icon: Users, href: '/employees' },
        { name: t('common.settings'), icon: Settings, href: '/settings' },
    ];

    return (
        <aside
            className={`sidebar fixed inset-y-0 left-0 z-50 w-[260px] bg-surface border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            style={{ direction: dir }}
        >
            {/* Sidebar Header */}
            <div className="sidebar-header p-6 flex items-center justify-between border-b border-border/50">
                <span className="sidebar-logo text-2xl font-extrabold">
                    <span className="text-primary">EzKhata</span>
                    <span className="text-text-primary">App</span>
                </span>
                <button
                    className="sidebar-close-btn md:hidden text-text-primary hover:text-primary transition-colors p-1 rounded-lg hover:bg-background"
                    onClick={onClose}
                    aria-label="Close sidebar"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="sidebar-nav px-4 flex flex-col gap-2 h-[calc(100%-88px)] overflow-y-auto py-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-nav-item flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                ? 'sidebar-nav-item-active bg-primary/10 text-primary shadow-sm'
                                : 'text-text-secondary hover:bg-background hover:text-text-primary'
                                }`}
                            onClick={onClose}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {/* Sidebar Footer - Theme & Language Toggles */}
                <div className="sidebar-footer mt-auto px-4 py-2 space-y-3 border-t border-border/50 pt-4">
                    <div className="flex gap-2 w-full justify-center " dir="ltr">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>

                    {/* Sign Out Button */}
                    <form action={signOut} className="w-full">
                        <button
                            type="submit"
                            className="sidebar-signout-btn w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-text-secondary hover:bg-background hover:text-danger transition-all duration-200 bg-transparent border-none cursor-pointer"
                        >
                            <LogOut size={20} />
                            <span>{t('common.signOut')}</span>
                        </button>
                    </form>
                </div>
            </nav>
        </aside>
    );
}
