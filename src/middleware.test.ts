// Mock next/server before importing middleware
jest.mock('next/server', () => {
    class MockNextRequest {
        nextUrl: URL;
        cookies: { get: jest.Mock };
        url: string;

        constructor(url: URL) {
            this.nextUrl = url;
            this.url = url.toString();
            this.cookies = {
                get: jest.fn(),
            };
        }
    }

    return {
        NextRequest: MockNextRequest,
        NextResponse: {
            next: jest.fn(() => ({
                status: 200,
                headers: new Map(),
            })),
            redirect: jest.fn((url: URL) => ({
                status: 307,
                headers: new Map([['location', url.toString()]]),
            })),
        },
    };
});

// Mock jose for JWT verification
jest.mock('jose', () => ({
    jwtVerify: jest.fn(),
}));

import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

// Import middleware after mocks are set up
import { middleware } from './middleware';

// Helper to create mock NextRequest
function createMockRequest(pathname: string, sessionCookie?: string) {
    const url = new URL(pathname, 'http://localhost:3000');
    const request = {
        nextUrl: url,
        url: url.toString(),
        cookies: {
            get: jest.fn().mockReturnValue(sessionCookie ? { value: sessionCookie } : undefined),
        },
    };
    return request as any;
}

describe('Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Public paths', () => {
        it('should allow access to /login without session', async () => {
            const request = createMockRequest('/login');

            await middleware(request);

            // Should call NextResponse.next() for public paths
            expect(NextResponse.next).toHaveBeenCalled();
        });

        it('should allow access to / (landing page) without session', async () => {
            const request = createMockRequest('/');

            await middleware(request);

            expect(NextResponse.next).toHaveBeenCalled();
        });

        it('should allow access to /auth paths without session', async () => {
            const request = createMockRequest('/auth/callback');

            await middleware(request);

            expect(NextResponse.next).toHaveBeenCalled();
        });
    });

    describe('Protected paths', () => {
        it('should redirect unauthenticated users to /login', async () => {
            const request = createMockRequest('/dashboard');

            await middleware(request);

            expect(NextResponse.redirect).toHaveBeenCalled();
            const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
            expect(redirectCall.toString()).toContain('/login');
        });

        it('should allow authenticated users to access protected routes', async () => {
            (jwtVerify as jest.Mock).mockResolvedValue({ payload: { userId: 'user-123' } });
            const request = createMockRequest('/dashboard', 'valid-session-token');

            await middleware(request);

            expect(NextResponse.next).toHaveBeenCalled();
        });
    });

    describe('Authenticated user redirects', () => {
        it('should redirect authenticated users from /login to /dashboard', async () => {
            (jwtVerify as jest.Mock).mockResolvedValue({ payload: { userId: 'user-123' } });
            const request = createMockRequest('/login', 'valid-session-token');

            await middleware(request);

            expect(NextResponse.redirect).toHaveBeenCalled();
            const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
            expect(redirectCall.toString()).toContain('/dashboard');
        });

        it('should redirect authenticated users from / to /dashboard', async () => {
            (jwtVerify as jest.Mock).mockResolvedValue({ payload: { userId: 'user-123' } });
            const request = createMockRequest('/', 'valid-session-token');

            await middleware(request);

            expect(NextResponse.redirect).toHaveBeenCalled();
            const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
            expect(redirectCall.toString()).toContain('/dashboard');
        });
    });

    describe('Static files', () => {
        it('should allow static files without session', async () => {
            const request = createMockRequest('/icon.svg');

            await middleware(request);

            // Static files should pass through
            expect(NextResponse.next).toHaveBeenCalled();
        });
    });

    describe('Invalid session handling', () => {
        it('should redirect to login if session token is invalid', async () => {
            (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));
            const request = createMockRequest('/dashboard', 'invalid-token');

            await middleware(request);

            expect(NextResponse.redirect).toHaveBeenCalled();
            const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
            expect(redirectCall.toString()).toContain('/login');
        });
    });
});
