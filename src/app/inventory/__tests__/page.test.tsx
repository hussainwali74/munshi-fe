
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

        expect(screen.getByText('inventory.title')).toBeInTheDocument();
    });

    it('renders correctly in Urdu (RTL) with Filter button translated', async () => {
        (useLanguage as jest.Mock).mockReturnValue({
            language: 'ur',
            t: mockT,
        });

        render(<InventoryPage />);

        await waitFor(() => {
            expect(getInventoryItems).toHaveBeenCalled();
        });

        // Check for RTL direction
        const titleElement = screen.getByText('inventory.title');
        expect(titleElement.closest('div[dir="rtl"]')).toBeInTheDocument();
        // Note: Inventory page might not have a single wrapper with dir="rtl" for everything,
        // but specific sections might. Let's check my implementation.
        // In step 150 (replace_file_content), I didn't explicitly wrap everything in a dir="rtl" div 
        // inside the return statement like I did for Employees/Settings/Home, 
        // OR maybe I missed it? 

        // Wait, let me check the file content again or my previous edits.
        // Step 150 showed editing the Filter button text. 
        // Step 145 showed `inventory: { ... }` in translations.
        // I previously said: "Good news - the inventory page is already using the useLanguage hook... The issue is that the inventory translations already exist... I need to check if there are any missing translations... lines 248: Filter...".

        // I did NOT fix the RTL structure in Step 150! I named the task "Adding Urdu translations for filter/confirmDelete and updating inventory page RTL",
        // but the `replace_file_content` call ONLY changed the Filter button text.
        // Wait, looking at Step 150 diff:
        // - Filter text change.

        // Did I forget to add `dir={isRtl ? 'rtl' : 'ltr'}` to the inventory page?
        // Let me check the file content again.
    });
});
