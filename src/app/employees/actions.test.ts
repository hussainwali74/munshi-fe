import { getEmployees, addEmployee, deleteEmployee, updateEmployee } from './actions';
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

const mockFrom = jest.fn(() => mockQueryBuilder);

jest.mock('@/lib/db', () => ({
    getDb: jest.fn(() => ({
        from: mockFrom,
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

describe('Employee Actions', () => {
    const mockSession = { userId: 'user-123' };
    const mockGetDb = getDb as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (getSession as jest.Mock).mockResolvedValue(mockSession);
        mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: [], error: null }));
    });

    describe('getEmployees', () => {
        it('should return employees when authenticated', async () => {
            const mockEmployees = [
                { id: '1', name: 'Employee 1', role: 'salesman', status: 'active' },
                { id: '2', name: 'Employee 2', role: 'cashier', status: 'active' },
            ];
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: mockEmployees, error: null }));

            const result = await getEmployees();

            expect(result).toEqual(mockEmployees);
            expect(mockGetDb).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith('employees');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', mockSession.userId);
            expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('should return empty array if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            const result = await getEmployees();

            expect(result).toEqual([]);
        });

        it('should return empty array on database error', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ data: null, error: { message: 'DB Error' } })
            );

            const result = await getEmployees();

            expect(result).toEqual([]);
        });
    });

    describe('addEmployee', () => {
        it('should throw error if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append('name', 'Test Employee');
            formData.append('phone', '0300-1234567');
            formData.append('role', 'salesman');
            formData.append('salary', '25000');
            formData.append('joinDate', '2024-01-15');

            await expect(addEmployee(formData)).rejects.toThrow('Not authenticated');
        });

        it('should insert correct employee data', async () => {
            const formData = new FormData();
            formData.append('name', 'Test Employee');
            formData.append('phone', '0300-1234567');
            formData.append('role', 'salesman');
            formData.append('salary', '25000');
            formData.append('joinDate', '2024-01-15');

            await addEmployee(formData);

            expect(mockGetDb).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith('employees');
            expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
                user_id: 'user-123',
                name: 'Test Employee',
                phone: '0300-1234567',
                role: 'salesman',
                salary: 25000,
                join_date: '2024-01-15',
                status: 'active'
            });
        });

        it('should handle null salary correctly', async () => {
            const formData = new FormData();
            formData.append('name', 'Test Employee');
            formData.append('phone', '0300-1234567');
            formData.append('role', 'helper');
            formData.append('joinDate', '2024-01-15');
            // Not appending salary

            await addEmployee(formData);

            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    salary: null
                })
            );
        });

        it('should throw error on database error', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ error: { message: 'DB Error' } })
            );

            const formData = new FormData();
            formData.append('name', 'Test Employee');
            formData.append('phone', '0300-1234567');
            formData.append('role', 'salesman');
            formData.append('joinDate', '2024-01-15');

            await expect(addEmployee(formData)).rejects.toThrow('Failed to add employee');
        });

        it('should call revalidatePath on success', async () => {
            const formData = new FormData();
            formData.append('name', 'Test Employee');
            formData.append('phone', '0300-1234567');
            formData.append('role', 'salesman');
            formData.append('joinDate', '2024-01-15');

            await addEmployee(formData);

            expect(revalidatePath).toHaveBeenCalledWith('/employees');
        });
    });

    describe('deleteEmployee', () => {
        it('should throw error if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            await expect(deleteEmployee('emp-123')).rejects.toThrow('Not authenticated');
        });

        it('should delete employee successfully', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            await deleteEmployee('emp-123');

            expect(mockGetDb).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith('employees');
            expect(mockQueryBuilder.delete).toHaveBeenCalled();
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'emp-123');
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', mockSession.userId);
        });

        it('should throw error on database error', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ error: { message: 'Delete Error' } })
            );

            await expect(deleteEmployee('emp-123')).rejects.toThrow('Failed to delete employee');
        });

        it('should call revalidatePath on success', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            await deleteEmployee('emp-123');

            expect(revalidatePath).toHaveBeenCalledWith('/employees');
        });
    });

    describe('updateEmployee', () => {
        it('should throw error if not authenticated', async () => {
            (getSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append('id', 'emp-123');
            formData.append('name', 'Updated Employee');

            await expect(updateEmployee(formData)).rejects.toThrow('Not authenticated');
        });

        it('should update employee with correct data', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            const formData = new FormData();
            formData.append('id', 'emp-123');
            formData.append('name', 'Updated Employee');
            formData.append('phone', '0300-9999999');
            formData.append('role', 'manager');
            formData.append('salary', '50000');
            formData.append('joinDate', '2024-02-01');
            formData.append('status', 'active');

            await updateEmployee(formData);

            expect(mockGetDb).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith('employees');
            expect(mockQueryBuilder.update).toHaveBeenCalledWith({
                name: 'Updated Employee',
                phone: '0300-9999999',
                role: 'manager',
                salary: 50000,
                join_date: '2024-02-01',
                status: 'active'
            });
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'emp-123');
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', mockSession.userId);
        });

        it('should throw error on database error', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ error: { message: 'Update Error' } })
            );

            const formData = new FormData();
            formData.append('id', 'emp-123');
            formData.append('name', 'Updated Employee');

            await expect(updateEmployee(formData)).rejects.toThrow('Failed to update employee');
        });

        it('should call revalidatePath on success', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) => resolve({ error: null }));

            const formData = new FormData();
            formData.append('id', 'emp-123');
            formData.append('name', 'Updated Employee');

            await updateEmployee(formData);

            expect(revalidatePath).toHaveBeenCalledWith('/employees');
        });
    });
});

