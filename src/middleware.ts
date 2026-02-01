import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect routes from unauthenticated access
 * 
 * Note: This is a basic implementation. For production, you should use
 * Firebase Admin SDK on the server side to verify authentication tokens.
 * This implementation relies on client-side auth state.
 */
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

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
