import { addCustomer, addTransaction, getCustomers, getCustomerById, updateCustomer, deleteCustomer } from './actions';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/db');
jest.mock('@/lib/auth');
jest.mock('next/cache');

describe('Khata Actions', () => {
    const mockSession = { userId: 'user-123' };

    // Helper to get the mock chain object from the manual mock
    // We cast to any because we know the structure of our manual mock
    const getMockChain = () => (getDb() as any).from();
    const getRpcSpy = () => (getDb() as any).rpc;

    beforeEach(() => {
        jest.clearAllMocks();
        (getSession as jest.Mock).mockResolvedValue(mockSession);

        // Reset default response for db calls
        const chain = getMockChain();
        chain.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));
    });

    describe('getCustomers', () => {
        it('should return empty array if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            const result = await getCustomers();

            expect(result).toEqual([]);
        });

        it('should fetch customers for authenticated user', async () => {
            const mockCustomers = [
                { id: '1', name: 'Customer 1', balance: 100 },
                { id: '2', name: 'Customer 2', balance: 200 }
            ];
            getMockChain().then.mockImplementation((resolve: any) =>
                resolve({ data: mockCustomers, error: null })
            );

            const result = await getCustomers();

            expect(getDb).toHaveBeenCalled();
            expect(getMockChain().select).toHaveBeenCalledWith('*');
            expect(getMockChain().eq).toHaveBeenCalledWith('user_id', 'user-123');
            expect(getMockChain().order).toHaveBeenCalledWith('created_at', { ascending: false });
            expect(result).toEqual(mockCustomers);
        });

        it('should return empty array on DB error', async () => {
            getMockChain().then.mockImplementation((resolve: any) =>
                resolve({ data: null, error: { message: 'DB Error' } })
            );

            const result = await getCustomers();

            expect(result).toEqual([]);
        });
    });

    describe('getCustomerById', () => {
        it('should return null if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            const result = await getCustomerById('cust-123');

            expect(result).toBeNull();
        });

        it('should return null if customer not found', async () => {
            getMockChain().then.mockImplementation((resolve: any) =>
                resolve({ data: null, error: { message: 'Not found' } })
            );

            const result = await getCustomerById('cust-123');

            expect(result).toBeNull();
        });

        it('should return customer with transactions', async () => {
            const mockCustomer = { id: 'cust-123', name: 'Test Customer', balance: 100 };
            const mockTransactions = [{ id: 'tx-1', amount: 100, type: 'credit' }];

            // First call returns customer, second call returns transactions
            let callCount = 0;
            getMockChain().then.mockImplementation((resolve: any) => {
                callCount++;
                if (callCount === 1) {
                    return resolve({ data: mockCustomer, error: null });
                }
                return resolve({ data: mockTransactions, error: null });
            });

            const result = await getCustomerById('cust-123');

            expect(result).toEqual({
                ...mockCustomer,
                transactions: mockTransactions
            });
        });
    });

    describe('updateCustomer', () => {
        it('should throw error if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append('id', 'cust-123');
            formData.append('name', 'Updated Name');
            formData.append('phone', '9876543210');
            formData.append('address', 'New Address');

            await expect(updateCustomer(formData)).rejects.toThrow('Not authenticated');
        });

        it('should update customer data', async () => {
            const formData = new FormData();
            formData.append('id', 'cust-123');
            formData.append('name', 'Updated Name');
            formData.append('phone', '9876543210');
            formData.append('address', 'New Address');

            await updateCustomer(formData);

            expect(getDb).toHaveBeenCalled();
            expect(getMockChain().update).toHaveBeenCalledWith({
                name: 'Updated Name',
                phone: '9876543210',
                address: 'New Address',
                cnic: null
            });
            expect(getMockChain().eq).toHaveBeenCalledWith('id', 'cust-123');
            expect(getMockChain().eq).toHaveBeenCalledWith('user_id', 'user-123');
        });

        it('should throw error on DB error', async () => {
            getMockChain().then.mockImplementation((resolve: any) =>
                resolve({ error: { message: 'DB Error' } })
            );

            const formData = new FormData();
            formData.append('id', 'cust-123');
            formData.append('name', 'Updated Name');
            formData.append('phone', '9876543210');
            formData.append('address', 'New Address');

            await expect(updateCustomer(formData)).rejects.toThrow('Failed to update customer');
        });

        it('should call revalidatePath on success', async () => {
            const formData = new FormData();
            formData.append('id', 'cust-123');
            formData.append('name', 'Updated Name');
            formData.append('phone', '9876543210');
            formData.append('address', 'New Address');

            await updateCustomer(formData);

            expect(revalidatePath).toHaveBeenCalledWith('/khata');
            expect(revalidatePath).toHaveBeenCalledWith('/khata/cust-123');
        });
    });

    describe('deleteCustomer', () => {
        it('should throw error if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            await expect(deleteCustomer('cust-123')).rejects.toThrow('Not authenticated');
        });

        it('should delete customer', async () => {
            await deleteCustomer('cust-123');

            expect(getDb).toHaveBeenCalled();
            expect(getMockChain().delete).toHaveBeenCalled();
            expect(getMockChain().eq).toHaveBeenCalledWith('id', 'cust-123');
            expect(getMockChain().eq).toHaveBeenCalledWith('user_id', 'user-123');
        });

        it('should throw error on DB error', async () => {
            getMockChain().then.mockImplementation((resolve: any) =>
                resolve({ error: { message: 'DB Error' } })
            );

            await expect(deleteCustomer('cust-123')).rejects.toThrow('Failed to delete customer');
        });

        it('should call revalidatePath on success', async () => {
            await deleteCustomer('cust-123');

            expect(revalidatePath).toHaveBeenCalledWith('/khata');
        });
    });

    describe('addCustomer', () => {
        it('should throw error if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append('name', 'Test Customer');
            formData.append('phone', '1234567890');
            formData.append('address', '123 Street');

            await expect(addCustomer(formData)).rejects.toThrow('Not authenticated');
        });

        it('should insert correct customer data', async () => {
            const formData = new FormData();
            formData.append('name', 'Test Customer');
            formData.append('phone', '1234567890');
            formData.append('address', '123 Street');

            await addCustomer(formData);

            expect(getDb).toHaveBeenCalled();
            expect(getMockChain().insert).toHaveBeenCalledWith({
                user_id: 'user-123',
                name: 'Test Customer',
                phone: '1234567890',
                address: '123 Street',
                cnic: null,
                balance: 0
            });
        });

        it('should throw error on DB error', async () => {
            getMockChain().then.mockImplementation((resolve: any) =>
                resolve({ error: { message: 'DB Error' } })
            );

            const formData = new FormData();
            formData.append('name', 'Test Customer');
            formData.append('phone', '1234567890');
            formData.append('address', '123 Street');

            await expect(addCustomer(formData)).rejects.toThrow('Failed to add customer');
        });

        it('should call revalidatePath on success', async () => {
            const formData = new FormData();
            formData.append('name', 'Test Customer');
            formData.append('phone', '1234567890');
            formData.append('address', '123 Street');

            await addCustomer(formData);

            expect(revalidatePath).toHaveBeenCalledWith('/khata');
        });
    });

    describe('addTransaction', () => {
        it('should throw error if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append('customerId', 'cust-123');
            formData.append('type', 'credit');
            formData.append('amount', '100');
            formData.append('description', 'Test transaction');

            await expect(addTransaction(formData)).rejects.toThrow('Not authenticated');
        });

        it('should parse items JSON correctly', async () => {
            const items = [{ name: 'Item 1', price: 50 }];

            const formData = new FormData();
            formData.append('customerId', 'cust-123');
            formData.append('type', 'credit');
            formData.append('amount', '100');
            formData.append('description', 'Test transaction');
            formData.append('items', JSON.stringify(items));

            await addTransaction(formData);

            expect(getMockChain().insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: items
                })
            );
        });

        it('should update customer balance via RPC', async () => {
            const formData = new FormData();
            formData.append('customerId', 'cust-123');
            formData.append('type', 'credit');
            formData.append('amount', '100');
            formData.append('description', 'Test transaction');

            await addTransaction(formData);

            expect(getRpcSpy()).toHaveBeenCalledWith('update_customer_balance', {
                p_customer_id: 'cust-123',
                p_amount: 100 // credit = positive
            });
        });

        it('should use negative amount for debit transactions', async () => {
            const formData = new FormData();
            formData.append('customerId', 'cust-123');
            formData.append('type', 'debit');
            formData.append('amount', '50');
            formData.append('description', 'Payment received');

            await addTransaction(formData);

            expect(getRpcSpy()).toHaveBeenCalledWith('update_customer_balance', {
                p_customer_id: 'cust-123',
                p_amount: -50 // debit = negative
            });
        });
    });
});
