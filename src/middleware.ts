import { NextRequest, NextResponse } from 'next/server';
import { trackRequest, trackError } from '@/lib/monitoring';
import { securityManager, applySecurityHeaders, enforceHTTPS } from '@/config/security';
import { authManager } from '@/lib/auth';

/**
 * Next.js Middleware
 * Handles security, authentication, and monitoring for all requests
 */

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. HTTPS Enforcement (for production)
    const httpsRedirect = enforceHTTPS(request);
    if (httpsRedirect) {
      return httpsRedirect;
    }

    // 2. Security validation
    const isSecure = securityManager.validateSecureConnection(request);
    if (!isSecure && process.env.NODE_ENV === 'production') {
      // Log security warning but don't block (free hosting handles HTTPS)
      console.warn('Insecure connection detected:', request.url);
    }

    // 3. Authentication check for protected routes
    const authResult = checkAuthentication(request);
    if (authResult) {
      return authResult;
    }

    // 4. Rate limiting (basic implementation for free tier)
    const rateLimitResult = checkRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // 5. Continue to the route handler
    const response = NextResponse.next();

    // 6. Apply security headers
    applySecurityHeaders(response);

    // 7. Track request metrics
    const responseTime = Date.now() - startTime;
    const userAgent = request.headers.get('user-agent') || undefined;
    const session = authManager.getSessionFromRequest(request);
    
    // Track after response to avoid blocking
    setTimeout(() => {
      trackRequest(
        request.method,
        request.nextUrl.pathname,
        response.status,
        responseTime,
        userAgent,
        session?.userId
      );
    }, 0);

    return response;

  } catch (error) {
    // Track error and return error response
    const responseTime = Date.now() - startTime;
    
    setTimeout(() => {
      trackError(
        error instanceof Error ? error.message : 'Middleware error',
        error instanceof Error ? error.stack : undefined,
        request.nextUrl.pathname
      );
      
      trackRequest(
        request.method,
        request.nextUrl.pathname,
        500,
        responseTime
      );
    }, 0);

    console.error('Middleware error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function checkAuthentication(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/health',
    '/auth/login',
    '/auth/logout',
    '/_next',
    '/favicon.ico',
    '/api/auth/login',
    '/api/auth/logout',
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return null;
  }

  // Check if authentication is enabled
  const authConfig = authManager.getConfig();
  if (!authConfig.enabled) {
    return null;
  }

  // Check authentication for protected routes
  const authResult = authManager.requireAuth(request);
  if (!authResult.authorized) {
    if (pathname.startsWith('/api/')) {
      // API routes return JSON error
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    } else {
      // Web routes redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check admin routes
  const adminRoutes = ['/api/monitoring', '/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (isAdminRoute) {
    const adminResult = authManager.requireAdmin(request);
    if (!adminResult.authorized) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }
  }

  return null;
}

function checkRateLimit(request: NextRequest): NextResponse | null {
  // Simple rate limiting for free tier
  // In production, use Redis or external rate limiting service
  
  const { pathname } = request.nextUrl;
  
  // Skip rate limiting for static assets
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return null;
  }

  // Basic rate limiting based on IP (not persistent across restarts)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `${ip}:${Math.floor(Date.now() / 60000)}`; // Per minute
  
  // This is a simple in-memory rate limiter
  // For production, use Redis or external service
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const currentCount = global.rateLimitStore.get(rateLimitKey) || 0;
  const limit = 60; // 60 requests per minute for free tier
  
  if (currentCount >= limit) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Rate limit exceeded',
        retryAfter: 60 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Math.floor(Date.now() / 60000) + 1).toString(),
        }
      }
    );
  }
  
  global.rateLimitStore.set(rateLimitKey, currentCount + 1);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    const currentMinute = Math.floor(Date.now() / 60000);
    for (const [key] of global.rateLimitStore.entries()) {
      const keyMinute = parseInt(key.split(':')[1]);
      if (currentMinute - keyMinute > 5) { // Remove entries older than 5 minutes
        global.rateLimitStore.delete(key);
      }
    }
  }
  
  return null;
}

// Configure which routes the middleware should run on
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

// Extend global type for rate limiting store
declare global {
  var rateLimitStore: Map<string, number> | undefined;
}