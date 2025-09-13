import { NextRequest, NextResponse } from 'next/server';
import { UserApiKeyInput } from '@/types';

/**
 * POST /api/config/user-key
 * Set user-provided API key for fallback
 */
export async function POST(request: NextRequest) {
  try {
    // Lazy load configuration managers
    const { secureConfigManager, apiKeyManager, ConfigValidator } = await import('@/lib/config');
    
    const body: UserApiKeyInput = await request.json();
    
    if (!body.apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 400 });
    }

    // Validate API key format
    const validation = ConfigValidator.validateApiKey(body.apiKey);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format',
        details: validation.errors
      }, { status: 400 });
    }

    // Check if user API keys are allowed
    if (!secureConfigManager.isUserApiKeyAllowed()) {
      return NextResponse.json({
        success: false,
        error: 'User-provided API keys are not allowed in this environment'
      }, { status: 403 });
    }

    // Set the fallback key
    apiKeyManager.setFallbackKey(body.apiKey);

    // Validate the key by making a test request
    const isValid = await apiKeyManager.validateKey(body.apiKey);
    
    if (!isValid) {
      // Clear the invalid key
      apiKeyManager.clearFallbackKey();
      
      return NextResponse.json({
        success: false,
        error: 'API key validation failed. Please check your key and try again.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'API key set successfully',
      keyStatus: apiKeyManager.getKeyStatus(),
      isTemporary: body.isTemporary
    });

  } catch (error) {
    console.error('Failed to set user API key:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set API key'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/config/user-key
 * Clear user-provided API key
 */
export async function DELETE(request: NextRequest) {
  try {
    // Lazy load configuration managers
    const { apiKeyManager } = await import('@/lib/config');
    
    apiKeyManager.clearFallbackKey();
    
    return NextResponse.json({
      success: true,
      message: 'User API key cleared successfully',
      keyStatus: apiKeyManager.getKeyStatus()
    });

  } catch (error) {
    console.error('Failed to clear user API key:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear API key'
    }, { status: 500 });
  }
}

/**
 * GET /api/config/user-key
 * Get current user API key status
 */
export async function GET(request: NextRequest) {
  try {
    // Lazy load configuration managers
    const { secureConfigManager, apiKeyManager } = await import('@/lib/config');
    
    const keyStatus = apiKeyManager.getKeyStatus();
    
    return NextResponse.json({
      keyStatus,
      canUseFallback: secureConfigManager.isUserApiKeyAllowed(),
      environment: secureConfigManager.getEnvironment()
    });

  } catch (error) {
    console.error('Failed to get user API key status:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to get key status'
    }, { status: 500 });
  }
}