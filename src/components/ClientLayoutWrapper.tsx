'use client';

import { usePathname } from 'next/navigation';
import DashboardLayout from './DashboardLayout';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Define paths that should NOT use the dashboard layout (public paths)
    const isPublic = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/auth');

    if (isPublic) {
        return <>{children}</>;
    }

    // Wrap authenticated pages in DashboardLayout
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}
