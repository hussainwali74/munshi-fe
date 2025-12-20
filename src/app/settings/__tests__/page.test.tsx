
import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsPage from '../page';
import { useLanguage } from '@/context/LanguageContext';

import '@testing-library/jest-dom';

// Mock the useLanguage hook
jest.mock('@/context/LanguageContext', () => ({
    useLanguage: jest.fn(),
}));

// Mock server actions
jest.mock('../actions', () => ({
    updateShopDetails: jest.fn(),
    getCategories: jest.fn().mockResolvedValue([]),
    addCategory: jest.fn(),
    removeCategory: jest.fn(),
}));

// Mock DashboardLayout
jest.mock('@/components/DashboardLayout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock Lucide icons
// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Settings: () => <span data-testid="settings-icon" />,
    Languages: () => <span data-testid="languages-icon" />,
    Store: () => <span data-testid="store-icon" />,
    Search: () => <span data-testid="search-icon" />,
    Edit2: () => <span data-testid="edit-icon" />,
    X: () => <span data-testid="x-icon" />,
    Check: () => <span data-testid="check-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    ChevronRight: () => <span data-testid="chevron-right-icon" />,
    RotateCcw: () => <span data-testid="rotate-ccw-icon" />,
    Tags: () => <span data-testid="tags-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    Loader2: () => <span data-testid="loader-icon" />,
}));

describe('Settings Page - Urdu Support', () => {
    const mockT = jest.fn((key) => key);

    beforeEach(() => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'en',
            t: mockT,
        });
    });

    it('renders translations correctly', () => {
        render(<SettingsPage />);
        expect(screen.getByText('settings.title')).toBeInTheDocument();
    });

    it('applies RTL direction when language is Urdu', () => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'ur',
            t: mockT,
        });

        render(<SettingsPage />);

        // Check for RTL direction
        const titleElement = screen.getByText('settings.title');
        const container = titleElement.closest('div[dir="rtl"]');
        expect(container).toBeInTheDocument();

        // Check main container
        const heading = screen.getByRole('heading', { name: 'settings.detailsTitle' });
        const mainContainer = heading.closest('div[dir="rtl"]');
        expect(mainContainer).toBeInTheDocument();
    });

    it('renders phone input as LTR even in Urdu mode', () => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'ur',
            t: mockT,
        });

        render(<SettingsPage />);

        const phoneInput = screen.getByPlaceholderText('settings.placeholders.phone');
        expect(phoneInput).toHaveAttribute('dir', 'ltr');
    });
});
