
export const getSession = jest.fn().mockResolvedValue({ userId: 'test-user', user: { name: 'Test User' } });
export const hashPassword = jest.fn().mockResolvedValue('hashed_password');
export const verifyPassword = jest.fn().mockResolvedValue(true);
export const createSession = jest.fn().mockResolvedValue(undefined);
export const deleteSession = jest.fn().mockResolvedValue(undefined);
export const updateSession = jest.fn().mockResolvedValue(undefined);
