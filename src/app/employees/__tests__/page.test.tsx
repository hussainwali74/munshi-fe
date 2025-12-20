
import React from 'react';
import { render, screen } from '@testing-library/react';
import EmployeesPage from '../page';
import { useLanguage } from '@/context/LanguageContext';
import '@testing-library/jest-dom';

// Mock the useLanguage hook
jest.mock('@/context/LanguageContext', () => ({
    useLanguage: jest.fn(),
}));

// Mock DashboardLayout
jest.mock('@/components/DashboardLayout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Search: () => <span data-testid="search-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    UserCheck: () => <span data-testid="user-check-icon" />,
    Phone: () => <span data-testid="phone-icon" />,
}));

describe('Employees Page - Urdu Support', () => {
    const mockT = jest.fn((key) => key);

    beforeEach(() => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'en',
            t: mockT,
        });
    });

    it('renders translations correctly', () => {
        render(<EmployeesPage />);
        expect(screen.getByText('employees.title')).toBeInTheDocument();
    });

    it('applies RTL direction when language is Urdu', () => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'ur',
            t: mockT,
        });

        render(<EmployeesPage />);

        // Check for RTL direction
        const titleElement = screen.getByText('employees.title');
        const container = titleElement.closest('div[dir="rtl"]');
        expect(container).toBeInTheDocument();
    });
});
