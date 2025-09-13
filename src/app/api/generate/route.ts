import { NextRequest, NextResponse } from 'next/server';
import { DocumentGenerator } from '@/lib/generator';
import { ContentExtractor } from '@/lib/content/ContentExtractor';
import { YouTubeProcessor } from '@/lib/content/YouTubeProcessor';
import { ContentProcessor } from '@/lib/ai/ContentProcessor';
import { MFECFormatter } from '@/lib/formatter/MFECFormatter';
import { TemplateManager } from '@/lib/template/TemplateManager';
import { logger } from '@/lib/logger';
import { authManager } from '@/lib/auth';

/**
 * Document Generation API Endpoint
 * Main endpoint for generating Thai documents from URLs and YouTube videos
 */

interface GenerateRequest {
  url: string;
  documentType: 'user_manual' | 'product_document';
  includeImages?: boolean;
  customInstructions?: string;
  userApiKey?: string;
}

interface GenerateResponse {
  success: boolean;
  documentId?: string;
  previewUrl?: string;
  downloadUrl?: string;
  error?: string;
  progress?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = authManager.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: GenerateRequest = await request.json();
    const { url, documentType, includeImages = true, customInstructions, userApiKey } = body;

    // Validate input
    if (!url || !documentType) {
      return NextResponse.json(
        { success: false, error: 'URL and document type are required' },
        { status: 400 }
      );
    }

    if (!['user_manual', 'product_document'].includes(documentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      );
    }

    logger.info(`Starting document generation for URL: ${url}, type: ${documentType}`);

    // Initialize services
    const templateManager = new TemplateManager();
    const contentExtractor = new ContentExtractor();
    const youtubeProcessor = new YouTubeProcessor();
    const contentProcessor = new ContentProcessor({ userApiKey });
    const mfecFormatter = new MFECFormatter();
    const documentGenerator = new DocumentGenerator();

    // Step 1: Extract content based on URL type
    let extractedContent;
    const isYouTubeUrl = url.includes('youtube.com') || url.includes('youtu.be');

    if (isYouTubeUrl) {
      logger.info('Processing YouTube video content');
      extractedContent = await youtubeProcessor.processYouTubeVideo(url, {
        includeTranscript: true,
        includeScreenshots: includeImages,
        maxScreenshots: 10
      });
    } else {
      logger.info('Processing website content');
      const extractionResult = await contentExtractor.extractWebsiteContent(url, {
        includeImages,
        maxImages: 10
      });
      extractedContent = extractionResult.content;
    }

    if (!extractedContent) {
      return NextResponse.json(
        { success: false, error: 'Failed to extract content from URL' },
        { status: 400 }
      );
    }

    // Step 2: Process content with AI
    logger.info('Processing content with AI');
    const processedContent = await contentProcessor.processContent(extractedContent, {
      targetLanguage: 'thai',
      documentType,
      customInstructions,
      organizeContent: true,
      refineContent: true
    });

    // Step 3: Apply MFEC formatting
    logger.info('Applying MFEC formatting');
    const formattedContent = await mfecFormatter.formatDocument(
      processedContent?.textContent || '',
      processedContent?.title || 'Document',
      url,
      processedContent?.images || []
    );

    // Step 4: Load MFEC template
    logger.info('Loading MFEC template');
    const template = await templateManager.loadTemplate(
      documentType === 'user_manual' ? 'user_manual' : 'system_manual'
    );

    // Step 5: Generate document
    logger.info('Generating final document');
    // Create DocumentRequest
    const documentRequest = {
      documentType,
      language: targetLanguage,
      sourceUrl: url,
      customInstructions
    };

    // Create ProcessedContent
    const processedContentObj = {
      refinedContent: formattedContent.htmlContent,
      organizedSections: formattedContent.sections,
      sourceAttribution: formattedContent.sourceAttribution,
      extractionMetadata: {
        extractedAt: new Date(),
        processingTime: 0,
        contentLength: formattedContent.htmlContent.length
      }
    };

    const generationResult = await documentGenerator.generateDocument(
      documentRequest,
      processedContentObj,
      {
        includeImages,
        includeTableOfContents: true,
        includeSourceAttribution: true,
        exportFormats: ['html', 'pdf']
      }
    );

    logger.info(`Document generation completed: ${generationResult.document.id}`);

    return NextResponse.json({
      success: true,
      documentId: generationResult.document.id,
      previewUrl: `/api/preview/${generationResult.document.id}`,
      downloadUrl: `/api/download/${generationResult.document.id}`,
      progress: 100
    });

  } catch (error) {
    logger.error('Document generation failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Progress tracking endpoint
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const session = authManager.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get generation progress (this would typically come from a job queue or database)
    // For now, return a simple response
    return NextResponse.json({
      success: true,
      documentId,
      progress: 100,
      status: 'completed'
    });

  } catch (error) {
    logger.error('Progress check failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check progress' },
      { status: 500 }
    );
  }
}