
import { addCustomer, addTransaction } from './actions';
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
