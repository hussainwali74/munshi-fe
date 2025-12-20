import { login, signup, signOut } from './actions';
import { getDb } from '@/lib/db';
import { verifyPassword, hashPassword, createSession, deleteSession } from '@/lib/auth';

// Create a mock query builder that returns itself for chaining
const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn((resolve) => resolve({ data: null, error: null })),
};

// Mock dependencies
jest.mock('@/lib/db', () => ({
    getDb: jest.fn(() => ({
        from: jest.fn(() => mockQueryBuilder),
    })),
}));

jest.mock('@/lib/auth', () => ({
    verifyPassword: jest.fn(),
    hashPassword: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
    getSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Mock redirect to throw an error so we can catch it
const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
    redirect: (url: string) => {
        mockRedirect(url);
        throw new Error(`NEXT_REDIRECT:${url}`);
    },
}));

describe('Login Actions', () => {
    const mockGetDb = getDb as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: null, error: null }));
    });

    describe('login', () => {
        it('should return error for user not found', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ data: null, error: { message: 'Not found' } })
            );

            const formData = new FormData();
            formData.append('identifier', 'test@example.com');
            formData.append('password', 'password123');

            const result = await login({}, formData);

            expect(result).toEqual({ error: 'Invalid credentials' });
        });

        it('should return error for invalid password', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                password_hash: 'hashed-password',
                full_name: 'Test User'
            };
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ data: mockUser, error: null })
            );
            (verifyPassword as jest.Mock).mockResolvedValue(false);

            const formData = new FormData();
            formData.append('identifier', 'test@example.com');
            formData.append('password', 'wrongpassword');

            const result = await login({}, formData);

            expect(result).toEqual({ error: 'Invalid credentials' });
            expect(verifyPassword).toHaveBeenCalledWith('wrongpassword', 'hashed-password');
        });

        it('should redirect to dashboard on successful login', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                password_hash: 'hashed-password',
                full_name: 'Test User'
            };
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ data: mockUser, error: null })
            );
            (verifyPassword as jest.Mock).mockResolvedValue(true);

            const formData = new FormData();
            formData.append('identifier', 'test@example.com');
            formData.append('password', 'correctpassword');

            await expect(login({}, formData)).rejects.toThrow('NEXT_REDIRECT:/dashboard');
            expect(createSession).toHaveBeenCalledWith({
                userId: 'user-123',
                email: 'test@example.com',
                name: 'Test User'
            });
        });
    });

    describe('signup', () => {
        it('should return error if user already exists', async () => {
            mockQueryBuilder.then.mockImplementation((resolve) =>
                resolve({ data: { id: 'existing-user' }, error: null })
            );

            const formData = new FormData();
            formData.append('email', 'existing@example.com');
            formData.append('password', 'password123');
            formData.append('fullName', 'Test User');
            formData.append('businessName', 'Test Business');
            formData.append('phoneNumber', '1234567890');

            const result = await signup({}, formData);

            expect(result).toEqual({ error: 'User with this email or phone already exists' });
        });

        it('should return error on DB insert failure', async () => {
            // First call: check existing user - return null
            mockQueryBuilder.then
                .mockImplementationOnce((resolve) => resolve({ data: null, error: null }))
                // Second call: insert - return error
                .mockImplementationOnce((resolve) => resolve({ data: null, error: { message: 'DB Error' } }));

            (hashPassword as jest.Mock).mockResolvedValue('hashed-password');

            const formData = new FormData();
            formData.append('email', 'new@example.com');
            formData.append('password', 'password123');
            formData.append('fullName', 'New User');
            formData.append('businessName', 'New Business');
            formData.append('phoneNumber', '0987654321');

            const result = await signup({}, formData);

            expect(result).toEqual({ error: 'Could not create user' });
        });

        it('should redirect to dashboard on successful signup', async () => {
            const mockNewUser = {
                id: 'new-user-123',
                email: 'new@example.com',
                full_name: 'New User'
            };
            // First call: check existing user - return null
            mockQueryBuilder.then
                .mockImplementationOnce((resolve) => resolve({ data: null, error: null }))
                // Second call: insert - return new user
                .mockImplementationOnce((resolve) => resolve({ data: mockNewUser, error: null }));

            (hashPassword as jest.Mock).mockResolvedValue('hashed-password');

            const formData = new FormData();
            formData.append('email', 'new@example.com');
            formData.append('password', 'password123');
            formData.append('fullName', 'New User');
            formData.append('businessName', 'New Business');
            formData.append('phoneNumber', '0987654321');

            await expect(signup({}, formData)).rejects.toThrow('NEXT_REDIRECT:/dashboard');
            expect(createSession).toHaveBeenCalledWith({
                userId: 'new-user-123',
                email: 'new@example.com',
                name: 'New User'
            });
        });
    });

    describe('signOut', () => {
        it('should call deleteSession', async () => {
            await expect(signOut()).rejects.toThrow('NEXT_REDIRECT:/login');
            expect(deleteSession).toHaveBeenCalled();
        });

        it('should redirect to login', async () => {
            await expect(signOut()).rejects.toThrow('NEXT_REDIRECT:/login');
            expect(mockRedirect).toHaveBeenCalledWith('/login');
        });
    });
});
