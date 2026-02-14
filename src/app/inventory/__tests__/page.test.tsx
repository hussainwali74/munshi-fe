
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import InventoryPage from '../page';
import { useLanguage } from '@/context/LanguageContext';
import { getInventoryItems } from '../actions';

// Mock the useLanguage hook
jest.mock('@/context/LanguageContext', () => ({
    useLanguage: jest.fn(),
}));

// Mock server actions
jest.mock('../actions', () => ({
    getInventoryItems: jest.fn(),
    addInventoryItem: jest.fn(),
    deleteInventoryItem: jest.fn(),
}));

jest.mock('@/app/settings/actions', () => ({
    getCategories: jest.fn().mockResolvedValue([]),
}));

// Mock DashboardLayout
jest.mock('@/components/DashboardLayout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock EditInventoryModal
jest.mock('@/components/EditInventoryModal', () => ({
    __esModule: true,
    default: () => <div data-testid="edit-inventory-modal" />,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Search: () => <span data-testid="search-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    Package: () => <span data-testid="package-icon" />,
    Filter: () => <span data-testid="filter-icon" />,
    X: () => <span data-testid="x-icon" />,
    Upload: () => <span data-testid="upload-icon" />,
    Edit: () => <span data-testid="edit-icon" />,
    Trash2: () => <span data-testid="trash-icon" />,
    Loader2: () => <span data-testid="loader-icon" />,
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Inventory Page - Urdu Support', () => {
    const mockT = jest.fn((key) => key);

    beforeEach(() => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'en',
            t: mockT,
        });
        (getInventoryItems as jest.Mock).mockResolvedValue([]);
    });

    it('renders translations correctly', async () => {
        render(<InventoryPage />);

        // Wait for items to load (useEffect)
        await waitFor(() => {
            expect(getInventoryItems).toHaveBeenCalled();
        });

        expect(screen.getAllByText('inventory.title').length).toBeGreaterThan(0);
    });

    it('renders correctly in Urdu (RTL)', async () => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'ur',
            t: mockT,
        });

        render(<InventoryPage />);

        await waitFor(() => {
            expect(getInventoryItems).toHaveBeenCalled();
        });

        const titleElement = screen.getAllByText('inventory.title')[0];
        expect(titleElement.closest('div[dir="rtl"]')).toBeInTheDocument();
    });
});
