// src/app/inventory/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InventoryPage from './page';

// Mock the actions used by the component
jest.mock('./actions', () => ({
    addInventoryItem: jest.fn(),
    getInventoryItems: jest.fn(() => Promise.resolve([])),
    deleteInventoryItem: jest.fn(),
}));

// Mock react-hot-toast to avoid real toasts during tests
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('InventoryPage – loading state', () => {
    it('disables the form and shows a spinner while adding an item', async () => {
        const { addInventoryItem } = require('./actions');
        // Make the addInventoryItem promise resolve after a short delay
        const resolvePromise = jest.fn();
        addInventoryItem.mockImplementation(
            () => new Promise((res) => setTimeout(() => {
                resolvePromise();
                res();
            }, 100))
        );

        render(<InventoryPage />);

        // Open the Add Item modal
        fireEvent.click(screen.getByRole('button', { name: /add item/i }));

        // Fill required fields (minimal set)
        fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'Test Item' } });
        fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'other' } });
        fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '1' } });

        const submitBtn = screen.getByRole('button', { name: /save/i });

        // Submit the form
        fireEvent.click(submitBtn);

        // Immediately after click, button should be disabled and spinner should appear
        expect(submitBtn).toBeDisabled();
        expect(screen.getByTestId('loader')).toBeInTheDocument();

        // Wait for the mocked promise to resolve
        await waitFor(() => expect(resolvePromise).toHaveBeenCalled());

        // After resolution, button should be enabled again
        expect(submitBtn).not.toBeDisabled();
        // Toast success should have been called
        const { toast } = require('react-hot-toast');
        expect(toast.success).toHaveBeenCalledWith('✅ Item added successfully');
    });
});
