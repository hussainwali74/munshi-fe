
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import KhataPage from '../page';
import { useLanguage } from '@/context/LanguageContext';

// Mock the useLanguage hook
jest.mock('@/context/LanguageContext', () => ({
    useLanguage: jest.fn(),
}));

// Mock DashboardLayout
jest.mock('@/components/DashboardLayout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock AddCustomerModal
jest.mock('@/components/AddCustomerModal', () => ({
    __esModule: true,
    default: () => <div data-testid="add-customer-modal" />,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Search: () => <span data-testid="search-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    ChevronRight: () => <span data-testid="chevron-right-icon" />,
    User: () => <span data-testid="user-icon" />,
    ArrowUpRight: () => <span data-testid="arrow-up-right-icon" />,
    ArrowDownLeft: () => <span data-testid="arrow-down-left-icon" />,
    X: () => <span data-testid="x-icon" />,
}));

// Mock Link
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('Khata Page - Urdu Support', () => {
    const mockT = jest.fn((key) => key);

    beforeEach(() => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'en',
            t: mockT,
        });
    });

    it('renders translations correctly', () => {
        render(<KhataPage />);
        expect(screen.getByText('khata.title')).toBeInTheDocument();
    });

    it('applies RTL direction when language is Urdu', () => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'ur',
            t: mockT,
        });

        render(<KhataPage />);

        // Find the header div that should have RTL direction
        const titleElement = screen.getByText('khata.title');
        // The structure is DashboardLayout -> div -> h1
        // The div containing h1 has the dir attribute
        const container = titleElement.closest('div[dir="rtl"]');
        expect(container).toBeInTheDocument();
    });
});
