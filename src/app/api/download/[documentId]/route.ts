import { NextRequest, NextResponse } from 'next/server';
import { DocumentGenerator } from '@/lib/generator';
import { DocumentExporter } from '@/lib/generator';
import { logger } from '@/lib/logger';
import { authManager } from '@/lib/auth';

/**
 * Document Download API Endpoint
 * Handles document export and download in various formats
 */

interface DownloadParams {
  params: {
    documentId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: DownloadParams
): Promise<NextResponse> {
  try {
    const { documentId } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';

    // Check authentication
    const session = authManager.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate format
    if (!['pdf', 'docx', 'html'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Supported formats: pdf, docx, html' },
        { status: 400 }
      );
    }

    logger.info(`Generating download for document: ${documentId}, format: ${format}`);

    const documentGenerator = new DocumentGenerator();
    const documentExporter = new DocumentExporter();

    const document = await documentGenerator.getDocument(documentId);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Export document in requested format
    const exportResult = await documentExporter.exportDocument(document, {
      format: format as 'pdf' | 'docx' | 'html',
      includeMFECBranding: true,
      optimizeForPrint: format === 'pdf',
      includeSourceAttribution: true
    });

    if (!exportResult.success || !exportResult.filePath) {
      return NextResponse.json(
        { success: false, error: 'Failed to export document' },
        { status: 500 }
      );
    }

    // Read the exported file
    const fs = require('fs');
    const path = require('path');
    
    const filePath = exportResult.filePath;
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `${document.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.${format}`;

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', exportResult.mimeType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Content-Length', fileBuffer.length.toString());

    logger.info(`Document download completed: ${documentId}, format: ${format}, size: ${fileBuffer.length} bytes`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    logger.error(`Download failed for document ${params.documentId}:`, error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to download document' },
      { status: 500 }
    );
  }
}