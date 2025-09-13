import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Logout API Endpoint
 * Handles session termination
 */

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value;

    if (sessionId) {
      const session = authManager.validateSession(sessionId);
      if (session) {
        authManager.revokeSession(sessionId);
        logger.info(`User logged out: ${session.email}`);
      }
    }

    // Create response and clear session cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    logger.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}