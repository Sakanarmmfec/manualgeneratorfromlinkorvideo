import { NextRequest, NextResponse } from 'next/server';
import { DocumentGenerator } from '@/lib/generator';
import { logger } from '@/lib/logger';
import { authManager } from '@/lib/auth';

/**
 * Document Preview API Endpoint
 * Provides preview functionality for generated documents
 */

interface PreviewParams {
  params: {
    documentId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: PreviewParams
): Promise<NextResponse> {
  try {
    const { documentId } = params;

    // Check authentication
    const session = authManager.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    logger.info(`Retrieving preview for document: ${documentId}`);

    const documentGenerator = new DocumentGenerator();
    const document = await documentGenerator.getDocument(documentId);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Generate HTML preview
    const previewResult = await documentGenerator.generatePreview(documentId);
    
    if (!previewResult.success) {
      return NextResponse.json(
        { success: false, error: previewResult.error || 'Preview generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documentId,
      previewUrl: previewResult.previewUrl,
      metadata: {
        title: document.title,
        sourceUrl: document.sourceAttribution.originalUrl,
        generatedAt: document.generationMetadata.generatedAt,
        documentType: document.template.documentType
      }
    });

  } catch (error) {
    logger.error(`Preview generation failed for document ${params.documentId}:`, error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}