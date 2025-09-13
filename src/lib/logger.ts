/**
 * Free Tier Optimized Logger
 * Minimal logging configuration for free hosting platforms
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  platform?: string;
}

class FreeTierLogger {
  private logLevel: LogLevel;
  private platform: string;
  private maxLogSize: number;
  private logBuffer: LogEntry[] = [];

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.platform = this.detectPlatform();
    this.maxLogSize = 100; // Keep only last 100 log entries in memory
  }

  private detectPlatform(): string {
    if (process.env.RAILWAY_ENVIRONMENT) return 'railway';
    if (process.env.RENDER) return 'render';
    if (process.env.VERCEL) return 'vercel';
    return 'local';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable for free tier memory limits
    if (this.logBuffer.length > this.maxLogSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxLogSize);
    }
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog('error')) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data,
      platform: this.platform,
    };

    console.error(this.formatMessage('error', message, data));
    this.addToBuffer(entry);
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
      platform: this.platform,
    };

    console.warn(this.formatMessage('warn', message, data));
    this.addToBuffer(entry);
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
      platform: this.platform,
    };

    console.info(this.formatMessage('info', message, data));
    this.addToBuffer(entry);
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      data,
      platform: this.platform,
    };

    console.debug(this.formatMessage('debug', message, data));
    this.addToBuffer(entry);
  }

  // Get recent logs for debugging (useful for free tier troubleshooting)
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Clear logs to free memory
  clearLogs(): void {
    this.logBuffer = [];
  }

  // Get memory usage of logger
  getMemoryUsage(): { entries: number; estimatedSizeKB: number } {
    const estimatedSize = JSON.stringify(this.logBuffer).length;
    return {
      entries: this.logBuffer.length,
      estimatedSizeKB: Math.round(estimatedSize / 1024),
    };
  }
}

// Export singleton instance
export const logger = new FreeTierLogger();

// Export convenience functions
export const log = {
  error: (message: string, data?: any) => logger.error(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  debug: (message: string, data?: any) => logger.debug(message, data),
};