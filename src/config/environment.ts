/**
 * Environment Configuration Manager
 * Handles environment-specific settings for development, staging, and production
 */

export interface EnvironmentConfig {
  nodeEnv: string;
  appUrl: string;
  llm: {
    baseUrl: string;
    apiKey: string;
    chatModel: string;
    embeddingModel: string;
  };
  security: {
    encryptionKey: string;
    allowUserApiKeys: boolean;
  };
  features: {
    debugMode: boolean;
    logLevel: string;
    enableAnalytics: boolean;
    enablePerformanceMonitoring: boolean;
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  freeTier: {
    enabled: boolean;
    platform: string;
    memoryLimit: number;
    storageLimit: number;
    optimizations: {
      enableCompression: boolean;
      enableCaching: boolean;
      maxFileSize: number;
      cleanupInterval: number;
    };
  };
  monitoring: {
    enabled: boolean;
    metricsRetention: number;
    healthCheckInterval: number;
  };
  auth: {
    enabled: boolean;
    provider: string;
    sessionTimeout: number;
  };
}

class EnvironmentManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): EnvironmentConfig {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // Detect if running on free tier platform
    const isFreeTier = this.detectFreeTier();
    const platform = this.detectPlatform();
    
    return {
      nodeEnv,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      llm: {
        baseUrl: process.env.MFEC_LLM_BASE_URL || 'https://gpt.mfec.co.th/litellm',
        apiKey: process.env.MFEC_LLM_API_KEY || '',
        chatModel: process.env.MFEC_LLM_CHAT_MODEL || 'gpt-4o',
        embeddingModel: process.env.MFEC_LLM_EMBEDDING_MODEL || 'text-embedding-3-large',
      },
      security: {
        encryptionKey: process.env.ENCRYPTION_KEY || 'default_dev_key_32_characters_long',
        allowUserApiKeys: process.env.ALLOW_USER_API_KEYS === 'true',
      },
      features: {
        debugMode: process.env.DEBUG_MODE === 'true',
        logLevel: process.env.LOG_LEVEL || (isFreeTier ? 'info' : 'debug'),
        enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
        enablePerformanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
      },
      rateLimit: {
        requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || (isFreeTier ? '10' : '60')),
        requestsPerHour: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR || (isFreeTier ? '100' : '1000')),
      },
      freeTier: {
        enabled: isFreeTier,
        platform,
        memoryLimit: this.getPlatformMemoryLimit(platform),
        storageLimit: this.getPlatformStorageLimit(platform),
        optimizations: {
          enableCompression: isFreeTier,
          enableCaching: isFreeTier,
          maxFileSize: isFreeTier ? 10 : 50, // MB
          cleanupInterval: isFreeTier ? 3600 : 86400, // seconds (1 hour vs 24 hours)
        },
      },
      monitoring: {
        enabled: process.env.ENABLE_MONITORING !== 'false',
        metricsRetention: isFreeTier ? 1000 : 10000, // Number of metrics to keep
        healthCheckInterval: isFreeTier ? 30 : 10, // Seconds between health checks
      },
      auth: {
        enabled: process.env.ENABLE_AUTH === 'true',
        provider: process.env.AUTH_PROVIDER || 'simple',
        sessionTimeout: isFreeTier ? 3600 : 86400, // 1 hour for free tier, 24 hours otherwise
      },
    };
  }

  private detectFreeTier(): boolean {
    // Check for free tier indicators
    return !!(
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RENDER ||
      process.env.VERCEL ||
      process.env.FREE_TIER === 'true'
    );
  }

  private detectPlatform(): string {
    if (process.env.RAILWAY_ENVIRONMENT) return 'railway';
    if (process.env.RENDER) return 'render';
    if (process.env.VERCEL) return 'vercel';
    if (process.env.HEROKU_APP_NAME) return 'heroku';
    return 'local';
  }

  private getPlatformMemoryLimit(platform: string): number {
    const limits: Record<string, number> = {
      railway: 512,
      render: 512,
      vercel: 1024, // Serverless
      heroku: 512,
      local: 2048,
    };
    return limits[platform] || 512;
  }

  private getPlatformStorageLimit(platform: string): number {
    const limits: Record<string, number> = {
      railway: 1024,
      render: 1024,
      vercel: 1024,
      heroku: 1024,
      local: 10240,
    };
    return limits[platform] || 1024;
  }

  public getConfig(): EnvironmentConfig {
    return this.config;
  }

  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  public isStaging(): boolean {
    return this.config.nodeEnv === 'staging';
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  public isFreeTier(): boolean {
    return this.config.freeTier.enabled;
  }

  public getPlatform(): string {
    return this.config.freeTier.platform;
  }

  public getMemoryLimit(): number {
    return this.config.freeTier.memoryLimit;
  }

  public getStorageLimit(): number {
    return this.config.freeTier.storageLimit;
  }

  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required configuration
    if (!this.config.llm.apiKey && this.isProduction()) {
      errors.push('MFEC_LLM_API_KEY is required in production');
    }

    if (!this.config.security.encryptionKey || this.config.security.encryptionKey.length < 32) {
      errors.push('ENCRYPTION_KEY must be at least 32 characters long');
    }

    if (!this.config.appUrl) {
      errors.push('NEXT_PUBLIC_APP_URL is required');
    }

    // Validate production-specific requirements
    if (this.isProduction()) {
      if (this.config.security.encryptionKey.includes('dev') || 
          this.config.security.encryptionKey.includes('default')) {
        errors.push('Production encryption key must not contain default or dev values');
      }

      if (this.config.features.debugMode) {
        errors.push('Debug mode should be disabled in production');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const environmentManager = new EnvironmentManager();
export const config = environmentManager.getConfig();