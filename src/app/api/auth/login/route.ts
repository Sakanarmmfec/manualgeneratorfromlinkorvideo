import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Simple Team Authentication API
 * Handles login requests for team access
 */

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const authResult = await authManager.authenticateUser(email);

    if (!authResult.success) {
      logger.warn(`Failed authentication attempt: ${email}`);
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = authManager.createSession(authResult.user);

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        email: authResult.user.email,
        name: authResult.user.name,
        role: authResult.user.role,
      },
    });

    // Set session cookie
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: authManager.getConfig().sessionTimeout,
      path: '/',
    });

    logger.info(`User logged in: ${authResult.user.email}`);
    return response;

  } catch (error) {
    logger.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current session status
    const session = authManager.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.email,
        role: session.role,
      },
      expiresAt: session.expiresAt,
    });

  } catch (error) {
    logger.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Session check failed' },
      { status: 500 }
    );
  }
}