
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
    X: () => <span data-testid="x-icon" />,
    Trash2: () => <span data-testid="trash-icon" />,
    Calendar: () => <span data-testid="calendar-icon" />,
    Briefcase: () => <span data-testid="briefcase-icon" />,
    DollarSign: () => <span data-testid="dollar-icon" />,
    Edit: () => <span data-testid="edit-icon" />,
}));

// Mock server actions to avoid cookies() error
jest.mock('../actions', () => ({
    getEmployees: jest.fn().mockResolvedValue([]),
    addEmployee: jest.fn().mockResolvedValue(undefined),
    deleteEmployee: jest.fn().mockResolvedValue(undefined),
    updateEmployee: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
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
