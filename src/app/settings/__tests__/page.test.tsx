
import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsPage from '../page';
import { useLanguage } from '@/context/LanguageContext';
import { updateShopDetails } from '../actions';
import '@testing-library/jest-dom';

// Mock the useLanguage hook
jest.mock('@/context/LanguageContext', () => ({
    useLanguage: jest.fn(),
}));

// Mock server actions
jest.mock('../actions', () => ({
    updateShopDetails: jest.fn(),
}));

// Mock DashboardLayout
jest.mock('@/components/DashboardLayout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Settings: () => <span data-testid="settings-icon" />,
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
        const mainContainer = screen.getByText('settings.detailsTitle').closest('div[dir="rtl"]');
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
