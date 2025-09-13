import { NextRequest, NextResponse } from 'next/server';
import { storageManager } from '@/lib/storage';
import { authManager } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Document Storage API
 * Handles document upload, retrieval, and management
 */

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = authManager.requireAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const sourceUrl = formData.get('sourceUrl') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Store document
    const result = await storageManager.storeDocument(
      buffer,
      file.name,
      file.type,
      {
        documentType,
        sourceUrl,
        userId: authResult.session?.userId,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    logger.info(`Document uploaded: ${file.name} by ${authResult.session?.email}`);

    return NextResponse.json({
      success: true,
      document: {
        id: result.document!.id,
        filename: result.document!.originalName,
        size: result.document!.size,
        createdAt: result.document!.createdAt,
        expiresAt: result.document!.expiresAt,
      },
    });

  } catch (error) {
    logger.error('Document upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = authManager.requireAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (documentId) {
      // Get specific document
      const result = await storageManager.getDocument(documentId);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 404 }
        );
      }

      // Return file download
      const response = new NextResponse(result.buffer as any);
      response.headers.set('Content-Type', result.document!.mimeType);
      response.headers.set('Content-Disposition', `attachment; filename="${result.document!.originalName}"`);
      response.headers.set('Content-Length', result.document!.size.toString());
      
      return response;
    } else {
      // List documents
      const userId = authResult.session?.role === 'admin' ? undefined : authResult.session?.userId;
      const documents = await storageManager.listDocuments(userId);
      
      return NextResponse.json({
        success: true,
        documents: documents.map(doc => ({
          id: doc.id,
          filename: doc.originalName,
          size: doc.size,
          createdAt: doc.createdAt,
          expiresAt: doc.expiresAt,
          metadata: doc.metadata,
        })),
      });
    }

  } catch (error) {
    logger.error('Document retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Retrieval failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResult = authManager.requireAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID required' },
        { status: 400 }
      );
    }

    // Check if user owns the document or is admin
    const documents = await storageManager.listDocuments();
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    if (authResult.session?.role !== 'admin' && document.metadata.userId !== authResult.session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const deleted = await storageManager.deleteDocument(documentId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Delete failed' },
        { status: 500 }
      );
    }

    logger.info(`Document deleted: ${document.originalName} by ${authResult.session?.email}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Document deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Deletion failed' },
      { status: 500 }
    );
  }
}