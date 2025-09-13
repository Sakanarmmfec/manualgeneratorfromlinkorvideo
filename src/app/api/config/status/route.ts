import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/config/status
 * Returns the current configuration and API key status
 */
export async function GET(request: NextRequest) {
  try {
    // Lazy load configuration managers
    const { secureConfigManager, apiKeyManager, ConfigValidator } = await import('@/lib/config');
    
    // Initialize configuration if not already done
    try {
      await secureConfigManager.initialize();
    } catch (error) {
      // Configuration may already be initialized
      console.debug('Configuration already initialized or failed:', error);
    }

    // Get configuration health
    const configHealth = ConfigValidator.getConfigurationHealth();
    
    // Get API key status
    const keyStatus = apiKeyManager.getKeyStatus();
    
    // Test current configuration
    const configTest = await apiKeyManager.testConfiguration();

    return NextResponse.json({
      status: configHealth.status,
      message: configHealth.message,
      details: configHealth.details,
      keyStatus,
      configTest,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Configuration status check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check configuration status',
      details: {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/config/status
 * Refresh configuration status
 */
export async function POST(request: NextRequest) {
  try {
    // Lazy load configuration managers
    const { secureConfigManager } = await import('@/lib/config');
    
    // Force re-initialization
    secureConfigManager.reset();
    await secureConfigManager.initialize();

    // Re-check everything
    return GET(request);

  } catch (error) {
    console.error('Configuration refresh failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to refresh configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}