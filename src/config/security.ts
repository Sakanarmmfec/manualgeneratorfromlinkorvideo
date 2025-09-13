/**
 * Security Configuration for Free Tier Hosting
 * Handles HTTPS, authentication, and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { environmentManager } from './environment';

export interface SecurityConfig {
  https: {
    enforced: boolean;
    hstsMaxAge: number;
    includeSubdomains: boolean;
  };
  headers: {
    contentSecurityPolicy: string;
    xFrameOptions: string;
    xContentTypeOptions: string;
    referrerPolicy: string;
  };
  auth: {
    enabled: boolean;
    provider: string;
    sessionTimeout: number;
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
}

class SecurityManager {
  private config: SecurityConfig;

  constructor() {
    this.config = this.loadSecurityConfig();
  }

  private loadSecurityConfig(): SecurityConfig {
    const env = environmentManager.getConfig();
    const isProduction = environmentManager.isProduction();
    const isFreeTier = environmentManager.isFreeTier();

    return {
      https: {
        enforced: isProduction,
        hstsMaxAge: isProduction ? 31536000 : 0, // 1 year in production
        includeSubdomains: isProduction,
      },
      headers: {
        contentSecurityPolicy: this.buildCSP(isProduction),
        xFrameOptions: 'DENY',
        xContentTypeOptions: 'nosniff',
        referrerPolicy: 'strict-origin-when-cross-origin',
      },
      auth: {
        enabled: process.env.ENABLE_AUTH === 'true',
        provider: process.env.AUTH_PROVIDER || 'simple',
        sessionTimeout: isFreeTier ? 3600 : 86400, // 1 hour for free tier, 24 hours otherwise
      },
      rateLimit: {
        enabled: true,
        windowMs: 60 * 1000, // 1 minute
        maxRequests: isFreeTier ? 10 : 60, // Lower limits for free tier
      },
    };
  }

  private buildCSP(isProduction: boolean): string {
    const baseCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://gpt.mfec.co.th",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    if (!isProduction) {
      // Allow development tools
      baseCSP.push("connect-src 'self' ws: wss: https://gpt.mfec.co.th");
    }

    return baseCSP.join('; ');
  }

  public getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'X-Frame-Options': this.config.headers.xFrameOptions,
      'X-Content-Type-Options': this.config.headers.xContentTypeOptions,
      'Referrer-Policy': this.config.headers.referrerPolicy,
      'Content-Security-Policy': this.config.headers.contentSecurityPolicy,
    };

    // Add HSTS header if HTTPS is enforced
    if (this.config.https.enforced) {
      const hstsValue = `max-age=${this.config.https.hstsMaxAge}${
        this.config.https.includeSubdomains ? '; includeSubDomains' : ''
      }`;
      headers['Strict-Transport-Security'] = hstsValue;
    }

    return headers;
  }

  public enforceHTTPS(request: NextRequest): NextResponse | null {
    if (!this.config.https.enforced) {
      return null;
    }

    const url = request.nextUrl.clone();
    
    // Check if request is already HTTPS
    if (url.protocol === 'https:') {
      return null;
    }

    // Check for forwarded protocol headers (common in free hosting)
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedSSL = request.headers.get('x-forwarded-ssl');
    
    if (forwardedProto === 'https' || forwardedSSL === 'on') {
      return null;
    }

    // Redirect to HTTPS
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  public validateSecureConnection(request: NextRequest): boolean {
    // Free hosting platforms handle HTTPS automatically
    // Check for standard headers that indicate secure connection
    
    const isSecure = 
      request.nextUrl.protocol === 'https:' ||
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.headers.get('x-forwarded-ssl') === 'on' ||
      request.headers.get('x-forwarded-port') === '443';

    return isSecure;
  }

  public getConfig(): SecurityConfig {
    return this.config;
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();

// Middleware helper for applying security headers
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = securityManager.getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// HTTPS enforcement helper
export function enforceHTTPS(request: NextRequest): NextResponse | null {
  return securityManager.enforceHTTPS(request);
}

// Platform-specific HTTPS validation
export function validatePlatformHTTPS(): {
  platform: string;
  httpsSupported: boolean;
  autoRedirect: boolean;
  notes: string[];
} {
  const platform = environmentManager.getPlatform();
  
  const platformConfigs = {
    railway: {
      httpsSupported: true,
      autoRedirect: true,
      notes: [
        'Railway provides automatic HTTPS with Let\'s Encrypt certificates',
        'Custom domains require DNS configuration',
        'HTTPS is enforced by default on railway.app domains'
      ]
    },
    render: {
      httpsSupported: true,
      autoRedirect: true,
      notes: [
        'Render provides automatic HTTPS with Let\'s Encrypt certificates',
        'Free tier includes HTTPS for onrender.com subdomains',
        'Custom domains supported with automatic certificate provisioning'
      ]
    },
    vercel: {
      httpsSupported: true,
      autoRedirect: true,
      notes: [
        'Vercel provides automatic HTTPS for all deployments',
        'Edge network ensures global HTTPS coverage',
        'Custom domains include automatic certificate management'
      ]
    },
    local: {
      httpsSupported: false,
      autoRedirect: false,
      notes: [
        'Local development typically uses HTTP',
        'Use mkcert or similar tools for local HTTPS testing',
        'Production deployment will handle HTTPS automatically'
      ]
    }
  };

  const config = platformConfigs[platform as keyof typeof platformConfigs] || platformConfigs.local;
  
  return {
    platform,
    ...config
  };
}