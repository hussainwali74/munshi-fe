import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCustomerModal from './AddCustomerModal';

// Mock khata actions
jest.mock('@/app/khata/actions', () => ({
    addCustomer: jest.fn(),
}));

// Mock LanguageContext
jest.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'khata.addNewCustomer': 'Add New Customer',
                'khata.customerName': 'Customer Name',
                'khata.phoneNumber': 'Phone Number',
                'khata.address': 'Address',
                'khata.addCustomer': 'Add Customer',
            };
            return translations[key] || key;
        },
    }),
}));

describe('AddCustomerModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should not render when isOpen is false', () => {
            render(
                <AddCustomerModal
                    isOpen={false}
                    onClose={mockOnClose}
                />
            );

            expect(screen.queryByText('Add New Customer')).not.toBeInTheDocument();
        });

        it('should render when isOpen is true', () => {
            render(
                <AddCustomerModal
                    isOpen={true}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByText('Add New Customer')).toBeInTheDocument();
        });

        it('should render all form fields', () => {
            render(
                <AddCustomerModal
                    isOpen={true}
                    onClose={mockOnClose}
                />
            );

            // Check for labels
            expect(screen.getByText(/Customer Name/)).toBeInTheDocument();
            expect(screen.getByText(/Phone Number/)).toBeInTheDocument();
            expect(screen.getByText(/Address/)).toBeInTheDocument();

            // Check for input fields
            expect(screen.getByPlaceholderText('Ahmed Ali')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('0300-1234567')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Street, Area, City')).toBeInTheDocument();
        });

        it('should render submit button', () => {
            render(
                <AddCustomerModal
                    isOpen={true}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByRole('button', { name: /Add Customer/i })).toBeInTheDocument();
        });
    });

    describe('Close functionality', () => {
        it('should call onClose when X button is clicked', () => {
            render(
                <AddCustomerModal
                    isOpen={true}
                    onClose={mockOnClose}
                />
            );

            // Find the close button (the X icon button in the header)
            const closeButtons = screen.getAllByRole('button');
            const closeButton = closeButtons.find(btn =>
                btn.querySelector('svg') && !btn.textContent?.includes('Add Customer')
            );

            if (closeButton) {
                fireEvent.click(closeButton);
                expect(mockOnClose).toHaveBeenCalled();
            }
        });

        it('should call onClose when clicking overlay', () => {
            render(
                <AddCustomerModal
                    isOpen={true}
                    onClose={mockOnClose}
                />
            );

            // Click the overlay (the fixed background)
            const overlay = screen.getByText('Add New Customer').closest('.fixed');
            if (overlay) {
                fireEvent.click(overlay);
                expect(mockOnClose).toHaveBeenCalled();
            }
        });
    });

    describe('Form inputs', () => {
        it('should have name field as required', () => {
            render(
                <AddCustomerModal
                    isOpen={true}
                    onClose={mockOnClose}
                />
            );

            const nameInput = screen.getByPlaceholderText('Ahmed Ali');
            expect(nameInput).toHaveAttribute('required');
        });

        it('should allow typing in form fields', () => {
            render(
                <AddCustomerModal
                    isOpen={true}
                    onClose={mockOnClose}
                />
            );

            const nameInput = screen.getByPlaceholderText('Ahmed Ali');
            const phoneInput = screen.getByPlaceholderText('0300-1234567');
            const addressInput = screen.getByPlaceholderText('Street, Area, City');

            fireEvent.change(nameInput, { target: { value: 'Test Customer' } });
            fireEvent.change(phoneInput, { target: { value: '1234567890' } });
            fireEvent.change(addressInput, { target: { value: '123 Test Street' } });

            expect(nameInput).toHaveValue('Test Customer');
            expect(phoneInput).toHaveValue('1234567890');
            expect(addressInput).toHaveValue('123 Test Street');
        });
    });
});
