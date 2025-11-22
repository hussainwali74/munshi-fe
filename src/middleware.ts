// src/middleware.ts or middleware.ts at root
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // your logic
    return NextResponse.next();
}

export const config = {
    matcher: '/about/:path*', // or whatever you need
};

// This is crucial — tells Next.js to use Edge runtime
export const runtime = 'edge';