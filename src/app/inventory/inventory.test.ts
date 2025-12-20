import { deleteInventoryItem, getInventoryItems, addInventoryItem } from './actions';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Create a mock query builder that returns itself for chaining
const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    // Add then to make it awaitable
    then: jest.fn((resolve) => resolve({ data: [], error: null })),
};

// Track the from calls
const mockFrom = jest.fn(() => mockQueryBuilder);

// Mock dependencies
jest.mock('@/lib/db', () => ({
    getDb: jest.fn(() => ({
        from: mockFrom,
    })),
}));

jest.mock('@/lib/auth', () => ({
    getSession: jest.fn(),
    // Mocking verifyPassword and hashPassword to avoid "not a function" errors if they are imported
    verifyPassword: jest.fn(),
    hashPassword: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
}));

jest.mock('@/lib/r2', () => ({
    uploadImageToR2: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

describe('Inventory Actions', () => {
    const mockSession = { userId: 'user-123' };
    // Helper to get the mocked instance
    const mockGetDb = getDb as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (getSession as jest.Mock).mockResolvedValue(mockSession);
        // Reset default return value for then
        mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: [], error: null }));
    });

    describe('getInventoryItems', () => {
        it('should return items when authenticated', async () => {
            const mockItems = [{ id: '1', name: 'Item 1' }];
            // Mock the resolved value for this specific test
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: mockItems, error: null }));

            const result = await getInventoryItems();
            expect(result).toEqual(mockItems);
            expect(mockGetDb).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith('inventory');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', mockSession.userId);
        });

        it('should return empty array if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);
            const result = await getInventoryItems();
            expect(result).toEqual([]);
        });
    });

    describe('addInventoryItem', () => {
        it('should add item successfully', async () => {
            const formData = new FormData();
            formData.append('name', 'New Item');
            formData.append('price', '100');
            formData.append('quantity', '10');

            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            await addInventoryItem(formData);

            expect(mockGetDb).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith('inventory');
            expect(mockQueryBuilder.insert).toHaveBeenCalled();
        });
    });

    describe('deleteInventoryItem', () => {
        it('should delete item successfully', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            await deleteInventoryItem('1');

            expect(mockGetDb).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith('inventory');
            expect(mockQueryBuilder.delete).toHaveBeenCalled();
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '1');
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', mockSession.userId);
        });

        it('should throw error if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);
            await expect(deleteInventoryItem('1')).rejects.toThrow('Not authenticated');
        });
    });
});
