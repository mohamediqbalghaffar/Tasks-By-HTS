import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow access to auth page
    if (pathname === '/auth') {
        return NextResponse.next();
    }

    // Allow access to public assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // For all other routes, the client-side auth check in ClientLayout
    // will handle redirects. We just allow the request to proceed.
    return NextResponse.next();
}
