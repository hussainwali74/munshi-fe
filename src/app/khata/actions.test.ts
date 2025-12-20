import { addCustomer, addTransaction } from './actions';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Create a mock query builder that returns itself for chaining
const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn((resolve) => resolve({ data: [], error: null })),
};

const mockRpc = jest.fn().mockResolvedValue({ error: null });

// Mock dependencies
jest.mock('@/lib/db', () => ({
    getDb: jest.fn(() => ({
        from: jest.fn(() => mockQueryBuilder),
        rpc: mockRpc,
    })),
}));

jest.mock('@/lib/auth', () => ({
    getSession: jest.fn(),
    verifyPassword: jest.fn(),
    hashPassword: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

describe('Khata Actions', () => {
    const mockSession = { userId: 'user-123' };
    const mockGetDb = getDb as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (getSession as jest.Mock).mockResolvedValue(mockSession);
        mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: [], error: null }));
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
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            const formData = new FormData();
            formData.append('name', 'Test Customer');
            formData.append('phone', '1234567890');
            formData.append('address', '123 Street');

            await addCustomer(formData);

            expect(mockGetDb).toHaveBeenCalled();
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
                user_id: 'user-123',
                name: 'Test Customer',
                phone: '1234567890',
                address: '123 Street',
                balance: 0
            });
        });

        it('should throw error on DB error', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ error: { message: 'DB Error' } })
            );

            const formData = new FormData();
            formData.append('name', 'Test Customer');
            formData.append('phone', '1234567890');
            formData.append('address', '123 Street');

            await expect(addCustomer(formData)).rejects.toThrow('Failed to add customer');
        });

        it('should call revalidatePath on success', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

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
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));
            const items = [{ name: 'Item 1', price: 50 }];

            const formData = new FormData();
            formData.append('customerId', 'cust-123');
            formData.append('type', 'credit');
            formData.append('amount', '100');
            formData.append('description', 'Test transaction');
            formData.append('items', JSON.stringify(items));

            await addTransaction(formData);

            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: items
                })
            );
        });

        it('should update customer balance via RPC', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            const formData = new FormData();
            formData.append('customerId', 'cust-123');
            formData.append('type', 'credit');
            formData.append('amount', '100');
            formData.append('description', 'Test transaction');

            await addTransaction(formData);

            expect(mockRpc).toHaveBeenCalledWith('update_customer_balance', {
                p_customer_id: 'cust-123',
                p_amount: 100 // credit = positive
            });
        });

        it('should use negative amount for debit transactions', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            const formData = new FormData();
            formData.append('customerId', 'cust-123');
            formData.append('type', 'debit');
            formData.append('amount', '50');
            formData.append('description', 'Payment received');

            await addTransaction(formData);

            expect(mockRpc).toHaveBeenCalledWith('update_customer_balance', {
                p_customer_id: 'cust-123',
                p_amount: -50 // debit = negative
            });
        });
    });
});
