'use client';

import React, { useState } from 'react';
import { ApiKeyProvider, useApiKeyContext, withApiKeyRequired } from '@/contexts/ApiKeyContext';
import { ApiKeyManager } from './ApiKeyManager';
import { ApiKeyModal } from '@/components/error/ApiKeyModal';
import { Button } from '@/components/ui';
import { FileText, Key, AlertTriangle } from 'lucide-react';

// Example component that requires a valid API key
const DocumentGeneratorComponent = withApiKeyRequired(() => {
  const { keyState, handleApiKeyExhaustion } = useApiKeyContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate document generation that might exhaust API key
      console.log('Starting document generation...');
      
      // Simulate API call that might fail due to exhausted key
      const shouldSimulateExhaustion = Math.random() > 0.7;
      
      if (shouldSimulateExhaustion) {
        console.log('Simulating API key exhaustion...');
        await handleApiKeyExhaustion();
        return;
      }
      
      // Simulate successful generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Document generated successfully!');
      
    } catch (error) {
      console.error('Document generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Document Generator</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          This component requires a valid API key to function. 
          Current status: <span className="font-medium">{keyState.status}</span>
        </p>
        
        <Button
          onClick={handleGenerateDocument}
          disabled={isGenerating || keyState.status !== 'active'}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Document'}
        </Button>
      </div>
    </div>
  );
});

// Main integration example component
function ApiKeyIntegrationContent() {
  const { requiresUserKey, keyState } = useApiKeyContext();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Show modal when user key is required
  React.useEffect(() => {
    if (requiresUserKey) {
      setShowApiKeyModal(true);
    }
  }, [requiresUserKey]);

  const handleModalClose = () => {
    setShowApiKeyModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Key className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">API Key Integration Example</h1>
        </div>
        <p className="text-lg text-gray-600">
          This example shows how to integrate API key management with document generation
        </p>
      </div>

      {/* API Key Status Alert */}
      {keyState.status === 'exhausted' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">API Key Exhausted</h3>
              <p className="text-sm text-yellow-700 mt-1">
                The primary API key has been exhausted. Please provide your own API key to continue.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowApiKeyModal(true)}
                className="mt-2"
              >
                Add API Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Manager */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">API Key Management</h2>
        <ApiKeyManager
          onApiKeyUpdated={(hasValidKey) => {
            console.log('API key updated:', hasValidKey);
            if (hasValidKey) {
              setShowApiKeyModal(false);
            }
          }}
          showStatus={true}
        />
      </div>

      {/* Document Generator (requires valid API key) */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Generation</h2>
        <DocumentGeneratorComponent />
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={handleModalClose}
        title="API Key Required"
        description="Please provide your API key to continue using the document generation service."
        autoManage={true}
      />

      {/* Integration Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Notes</h2>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">1. Provider Setup</h3>
            <p>Wrap your app with <code className="bg-gray-100 px-1 rounded">ApiKeyProvider</code> to enable context-based API key management.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">2. Component Protection</h3>
            <p>Use <code className="bg-gray-100 px-1 rounded">withApiKeyRequired</code> HOC to protect components that need valid API keys.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">3. Manual Management</h3>
            <p>Use <code className="bg-gray-100 px-1 rounded">ApiKeyManager</code> component for manual API key management interfaces.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">4. Modal Integration</h3>
            <p>Use <code className="bg-gray-100 px-1 rounded">ApiKeyModal</code> for popup-style API key input when keys are exhausted.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">5. Error Handling</h3>
            <p>Handle API key exhaustion in your API calls using <code className="bg-gray-100 px-1 rounded">handleApiKeyExhaustion</code> from context.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with provider
export function ApiKeyIntegrationExample() {
  return (
    <ApiKeyProvider>
      <ApiKeyIntegrationContent />
    </ApiKeyProvider>
  );
}