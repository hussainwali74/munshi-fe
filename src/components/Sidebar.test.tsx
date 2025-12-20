import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock login actions
jest.mock('@/app/login/actions', () => ({
    signOut: jest.fn(),
}));

// Mock LanguageContext
jest.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'common.home': 'Dashboard',
                'common.khata': 'Khata',
                'common.inventory': 'Inventory',
                'common.employees': 'Employees',
                'common.settings': 'Settings',
                'common.signOut': 'Sign Out',
            };
            return translations[key] || key;
        },
        dir: 'ltr',
    }),
}));

// Mock ThemeContext
jest.mock('@/context/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'light',
        toggleTheme: jest.fn(),
    }),
}));

import { usePathname } from 'next/navigation';

describe('Sidebar', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (usePathname as jest.Mock).mockReturnValue('/dashboard');
    });

    describe('Navigation links rendering', () => {
        it('should render all navigation links', () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Khata')).toBeInTheDocument();
            expect(screen.getByText('Inventory')).toBeInTheDocument();
            expect(screen.getByText('Employees')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });

        it('should render sign out button', () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('Sign Out')).toBeInTheDocument();
        });
    });

    describe('Active link highlighting', () => {
        it('should highlight Dashboard when on /dashboard', () => {
            (usePathname as jest.Mock).mockReturnValue('/dashboard');
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const dashboardLink = screen.getByText('Dashboard').closest('a');
            expect(dashboardLink).toHaveClass('sidebar-nav-item-active');
        });

        it('should highlight Khata when on /khata', () => {
            (usePathname as jest.Mock).mockReturnValue('/khata');
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const khataLink = screen.getByText('Khata').closest('a');
            expect(khataLink).toHaveClass('sidebar-nav-item-active');
        });

        it('should highlight Inventory when on /inventory', () => {
            (usePathname as jest.Mock).mockReturnValue('/inventory');
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const inventoryLink = screen.getByText('Inventory').closest('a');
            expect(inventoryLink).toHaveClass('sidebar-nav-item-active');
        });
    });

    describe('Sign out button', () => {
        it('should have a form with signOut action', () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const signOutButton = screen.getByText('Sign Out');
            const form = signOutButton.closest('form');

            expect(form).toBeInTheDocument();
            expect(signOutButton.tagName).toBe('SPAN');
        });
    });

    describe('Logo', () => {
        it('should render the app logo', () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByText('EzKhata')).toBeInTheDocument();
            expect(screen.getByText('App')).toBeInTheDocument();
        });
    });
});
