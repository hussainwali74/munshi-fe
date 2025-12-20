
export const SignJWT = jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-token'),
}));

export const jwtVerify = jest.fn().mockResolvedValue({
    payload: { sub: 'mock-user', role: 'admin' },
    protectedHeader: { alg: 'HS256' }
});
