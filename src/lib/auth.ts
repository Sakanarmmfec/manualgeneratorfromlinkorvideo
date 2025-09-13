/**
 * Simple Team Authentication for Free Tier
 * Uses environment-based authentication suitable for small teams
 */

import { NextRequest } from 'next/server';
import { environmentManager } from '@/config/environment';
import { logger } from './logger';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  lastLogin: Date;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthConfig {
  enabled: boolean;
  provider: 'simple' | 'oauth' | 'disabled';
  sessionTimeout: number;
  allowedUsers: string[];
  adminUsers: string[];
}

class SimpleAuthManager {
  private config: AuthConfig;
  private sessions: Map<string, AuthSession> = new Map();
  private sessionCleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = this.loadAuthConfig();
    this.startSessionCleanup();
  }

  private loadAuthConfig(): AuthConfig {
    const isFreeTier = environmentManager.isFreeTier();
    
    return {
      enabled: process.env.ENABLE_AUTH === 'true',
      provider: (process.env.AUTH_PROVIDER as 'simple' | 'oauth') || 'simple',
      sessionTimeout: isFreeTier ? 3600 : 86400, // 1 hour for free tier, 24 hours otherwise
      allowedUsers: this.parseUserList(process.env.ALLOWED_USERS || ''),
      adminUsers: this.parseUserList(process.env.ADMIN_USERS || ''),
    };
  }

  private parseUserList(userString: string): string[] {
    return userString
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
  }

  private startSessionCleanup(): void {
    // Clean up expired sessions every 5 minutes
    this.sessionCleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private isUserAllowed(email: string): boolean {
    if (!this.config.enabled) {
      return true; // Auth disabled, allow all
    }

    if (this.config.allowedUsers.length === 0) {
      return true; // No restrictions configured
    }

    return this.config.allowedUsers.includes(email.toLowerCase());
  }

  private isUserAdmin(email: string): boolean {
    return this.config.adminUsers.includes(email.toLowerCase());
  }

  public async authenticateUser(email: string, password?: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      if (!this.config.enabled) {
        // Auth disabled, create a default user
        const user: AuthUser = {
          id: 'default',
          email: 'anonymous@localhost',
          name: 'Anonymous User',
          role: 'user',
          lastLogin: new Date(),
        };
        return { success: true, user };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if user is allowed
      if (!this.isUserAllowed(email)) {
        logger.warn(`Authentication attempt by unauthorized user: ${email}`);
        return { success: false, error: 'User not authorized' };
      }

      // For simple auth, we use environment-based validation
      if (this.config.provider === 'simple') {
        // In a real implementation, you would validate against a user database
        // For free tier, we use a simple environment-based approach
        const user: AuthUser = {
          id: email,
          email: email.toLowerCase(),
          name: email.split('@')[0],
          role: this.isUserAdmin(email) ? 'admin' : 'user',
          lastLogin: new Date(),
        };

        logger.info(`User authenticated: ${email}`);
        return { success: true, user };
      }

      return { success: false, error: 'Authentication provider not configured' };

    } catch (error) {
      logger.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  public createSession(user: AuthUser): string {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + this.config.sessionTimeout * 1000);

    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    
    logger.info(`Session created for user: ${user.email}`);
    return sessionId;
  }

  public validateSession(sessionId: string): AuthSession | null {
    if (!this.config.enabled) {
      // Auth disabled, return a default session
      return {
        userId: 'default',
        email: 'anonymous@localhost',
        role: 'user',
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
        createdAt: new Date(),
      };
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  public extendSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.expiresAt = new Date(Date.now() + this.config.sessionTimeout * 1000);
    return true;
  }

  public revokeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  public getSessionFromRequest(request: NextRequest): AuthSession | null {
    // Try to get session from cookie
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return null;
    }

    return this.validateSession(sessionId);
  }

  public requireAuth(request: NextRequest): { authorized: boolean; session?: AuthSession; redirectUrl?: string } {
    if (!this.config.enabled) {
      return { authorized: true };
    }

    const session = this.getSessionFromRequest(request);
    if (!session) {
      return { 
        authorized: false, 
        redirectUrl: '/auth/login' 
      };
    }

    return { authorized: true, session };
  }

  public requireAdmin(request: NextRequest): { authorized: boolean; session?: AuthSession; error?: string } {
    const authResult = this.requireAuth(request);
    if (!authResult.authorized) {
      return authResult;
    }

    if (authResult.session?.role !== 'admin') {
      return { 
        authorized: false, 
        error: 'Admin access required' 
      };
    }

    return { authorized: true, session: authResult.session };
  }

  public getConfig(): AuthConfig {
    return this.config;
  }

  public getSessionStats(): { total: number; active: number; expired: number } {
    const now = new Date();
    let active = 0;
    let expired = 0;

    for (const session of this.sessions.values()) {
      if (session.expiresAt > now) {
        active++;
      } else {
        expired++;
      }
    }

    return {
      total: this.sessions.size,
      active,
      expired,
    };
  }

  public cleanup(): void {
    if (this.sessionCleanupInterval) {
      clearInterval(this.sessionCleanupInterval);
    }
    this.sessions.clear();
  }
}

// Export singleton instance
export const authManager = new SimpleAuthManager();

// Helper functions for common auth operations
export const auth = {
  authenticate: (email: string, password?: string) => authManager.authenticateUser(email, password),
  createSession: (user: AuthUser) => authManager.createSession(user),
  validateSession: (sessionId: string) => authManager.validateSession(sessionId),
  requireAuth: (request: NextRequest) => authManager.requireAuth(request),
  requireAdmin: (request: NextRequest) => authManager.requireAdmin(request),
  getSessionFromRequest: (request: NextRequest) => authManager.getSessionFromRequest(request),
};

// Environment setup instructions for team authentication
export function getAuthSetupInstructions(): {
  platform: string;
  instructions: string[];
  environmentVariables: { key: string; description: string; example?: string }[];
} {
  const platform = environmentManager.getPlatform();
  
  return {
    platform,
    instructions: [
      'Set ENABLE_AUTH=true to enable authentication',
      'Configure ALLOWED_USERS with comma-separated email addresses',
      'Set ADMIN_USERS for users who need admin access',
      'For production, consider using OAuth providers like Google or GitHub',
      'Sessions are stored in memory - restart will require re-authentication',
    ],
    environmentVariables: [
      {
        key: 'ENABLE_AUTH',
        description: 'Enable or disable authentication',
        example: 'true'
      },
      {
        key: 'AUTH_PROVIDER',
        description: 'Authentication provider (simple, oauth)',
        example: 'simple'
      },
      {
        key: 'ALLOWED_USERS',
        description: 'Comma-separated list of allowed email addresses',
        example: 'user1@company.com,user2@company.com'
      },
      {
        key: 'ADMIN_USERS',
        description: 'Comma-separated list of admin email addresses',
        example: 'admin@company.com'
      }
    ]
  };
}