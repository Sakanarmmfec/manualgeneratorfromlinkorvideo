/**
 * Example usage of the AI Processing Engine
 * 
 * This file demonstrates how to use the various components of the AI processing engine
 * to transform extracted content into structured Thai documentation.
 */

import { contentProcessor } from './ContentProcessor';
import { videoContentAnalyzer } from './VideoContentAnalyzer';
import { llmConnector } from './LLMConnector';
import { processedContentUtils } from './ProcessedContentModel';
import { ExtractedContent, VideoContent } from '@/types';

/**
 * Example 1: Process website content into Thai user manual
 */
export async function processWebsiteExample() {
  const websiteContent: ExtractedContent = {
    url: 'https://example.com/product-page',
    title: 'Amazing Software Product',
    contentType: 'website',
    textContent: `
      Amazing Software Product is a revolutionary tool that helps users manage their daily tasks efficiently.
      
      Key Features:
      - Task management with priority levels
      - Calendar integration
      - Team collaboration tools
      - Mobile app synchronization
      - Advanced reporting and analytics
      
      System Requirements:
      - Windows 10 or later / macOS 10.15 or later
      - 4GB RAM minimum, 8GB recommended
      - 2GB available disk space
      - Internet connection for synchronization
      
      Installation Process:
      1. Download the installer from our website
      2. Run the installer as administrator
      3. Follow the setup wizard instructions
      4. Enter your license key when prompted
      5. Complete the initial configuration
    `,
    images: [
      {
        url: 'https://example.com/product-screenshot.jpg',
        alt: 'Product main interface',
        caption: 'Main dashboard view'
      },
      {
        url: 'https://example.com/installation-screen.jpg',
        alt: 'Installation wizard',
        caption: 'Installation process'
      }
    ],
    metadata: {
      title: 'Amazing Software Product',
      description: 'Revolutionary task management software',
      language: 'en',
      tags: ['software', 'productivity', 'task-management']
    },
    extractionTimestamp: new Date()
  };

  try {
    console.log('Processing website content...');
    
    // Process the content into Thai user manual
    const processedContent = await contentProcessor.processContent(
      websiteContent,
      'user_manual',
      'Focus on practical usage instructions and include troubleshooting tips'
    );

    console.log('✅ Website content processed successfully');
    console.log(`Quality Score: ${processedContent.qualityScore}/100`);
    console.log(`Sections: ${processedContent.organizedSections.length}`);
    console.log(`Source: ${processedContent.sourceAttribution.attribution}`);

    // Enhance the content with additional features
    const enhancedContent = await contentProcessor.enhanceProcessedContent(processedContent, {
      addTableOfContents: true,
      improveTransitions: true,
      addConclusion: true,
      enhanceFormatting: true
    });

    console.log('✅ Content enhanced successfully');
    console.log(`Enhanced Quality Score: ${enhancedContent.qualityScore}/100`);

    return enhancedContent;

  } catch (error) {
    console.error('❌ Website processing failed:', error);
    throw error;
  }
}

/**
 * Example 2: Process YouTube video content with step extraction
 */
export async function processVideoExample() {
  const videoTranscript = `
    Welcome to this comprehensive tutorial on installing and configuring our software.
    In this video, I'll walk you through every step of the process.
    
    First, let's start by downloading the software from our official website.
    Make sure you're downloading from the correct URL to avoid any security issues.
    
    Once the download is complete, locate the installer file in your downloads folder.
    Right-click on the file and select "Run as administrator" to ensure proper installation.
    
    The installation wizard will now open. Click "Next" to proceed through the welcome screen.
    Read and accept the license agreement, then choose your installation directory.
    
    Now we'll configure the initial settings. Enter your license key in the provided field.
    Choose your preferred language and regional settings.
    
    The software will now install all necessary components. This may take a few minutes.
    Once installation is complete, you'll see a success message.
    
    Let's now test the installation by launching the application.
    You should see the main dashboard with all features available.
    
    That concludes our installation tutorial. Thank you for watching!
  `;

  const videoContent: ExtractedContent = {
    url: 'https://youtube.com/watch?v=example123',
    title: 'Software Installation Tutorial - Complete Guide',
    contentType: 'youtube_video',
    textContent: 'Complete step-by-step guide for installing and configuring the software',
    videoContent: {
      videoId: 'example123',
      duration: 480, // 8 minutes
      transcript: videoTranscript,
      keyMoments: [], // Will be populated by analyzer
      screenshots: [] // Will be populated by analyzer
    },
    images: [],
    metadata: {
      title: 'Software Installation Tutorial',
      description: 'Complete installation guide',
      language: 'en',
      tags: ['tutorial', 'installation', 'software', 'guide']
    },
    extractionTimestamp: new Date()
  };

  try {
    console.log('Analyzing video content...');
    
    // First, analyze the video to extract key moments and steps
    const analyzedVideo = await videoContentAnalyzer.analyzeVideoContent(
      videoContent.videoContent!.videoId,
      videoContent.videoContent!.transcript,
      videoContent.videoContent!.duration,
      videoContent.title
    );

    console.log('✅ Video analysis completed');
    console.log(`Key moments identified: ${analyzedVideo.keyMoments.length}`);
    console.log(`Screenshots recommended: ${analyzedVideo.screenshots.length}`);

    // Update the extracted content with analyzed video data
    const enhancedVideoContent = {
      ...videoContent,
      videoContent: analyzedVideo
    };

    // Process the video content into Thai documentation
    const processedContent = await contentProcessor.processVideoContent(
      enhancedVideoContent,
      'user_manual'
    );

    console.log('✅ Video content processed successfully');
    console.log(`Quality Score: ${processedContent.qualityScore}/100`);

    // Extract step-by-step instructions in Thai
    const thaiSteps = await videoContentAnalyzer.extractStepByStepInstructions(
      analyzedVideo,
      'thai'
    );

    console.log('✅ Step-by-step instructions extracted');
    console.log(`Steps extracted: ${thaiSteps.length}`);

    // Generate video summary
    const summary = await videoContentAnalyzer.summarizeVideoContent(
      analyzedVideo,
      300,
      'thai'
    );

    console.log('✅ Video summary generated');
    console.log(`Summary length: ${summary.length} characters`);

    return {
      processedContent,
      steps: thaiSteps,
      summary,
      keyMoments: analyzedVideo.keyMoments
    };

  } catch (error) {
    console.error('❌ Video processing failed:', error);
    throw error;
  }
}

/**
 * Example 3: Process multiple content sources and merge them
 */
export async function processMultipleSourcesExample() {
  const websiteContent: ExtractedContent = {
    url: 'https://example.com/product-specs',
    title: 'Product Specifications',
    contentType: 'website',
    textContent: 'Detailed technical specifications and system requirements for the product.',
    images: [],
    metadata: {
      title: 'Product Specs',
      language: 'en',
      tags: ['specifications', 'technical']
    },
    extractionTimestamp: new Date()
  };

  const videoContent: ExtractedContent = {
    url: 'https://youtube.com/watch?v=demo456',
    title: 'Product Demo Video',
    contentType: 'youtube_video',
    textContent: 'Live demonstration of product features and capabilities',
    videoContent: {
      videoId: 'demo456',
      duration: 300,
      transcript: 'This demo shows the key features of our product in action...',
      keyMoments: [],
      screenshots: []
    },
    images: [],
    metadata: {
      title: 'Product Demo',
      language: 'en',
      tags: ['demo', 'features']
    },
    extractionTimestamp: new Date()
  };

  try {
    console.log('Processing multiple content sources...');
    
    // Process multiple sources with prioritized merging strategy
    const mergedContent = await contentProcessor.processMultipleContents(
      [websiteContent, videoContent],
      'user_manual',
      'prioritize'
    );

    console.log('✅ Multiple sources processed and merged');
    console.log(`Final quality score: ${mergedContent.qualityScore}/100`);
    console.log(`Total sections: ${mergedContent.organizedSections.length}`);
    console.log(`Sources: ${mergedContent.sourceAttribution.originalUrl}`);

    return mergedContent;

  } catch (error) {
    console.error('❌ Multi-source processing failed:', error);
    throw error;
  }
}

/**
 * Example 4: Handle API key exhaustion with user fallback
 */
export async function handleAPIKeyExhaustionExample() {
  const sampleContent: ExtractedContent = {
    url: 'https://example.com/test',
    title: 'Test Content',
    contentType: 'website',
    textContent: 'Sample content for testing API key fallback',
    images: [],
    metadata: {
      title: 'Test',
      language: 'en',
      tags: ['test']
    },
    extractionTimestamp: new Date()
  };

  try {
    console.log('Processing content with potential API key issues...');
    
    const processedContent = await contentProcessor.processContent(sampleContent);
    
    console.log('✅ Content processed successfully');
    return processedContent;

  } catch (error: any) {
    if (error.code === 'TOKEN_EXHAUSTED_USER_KEY_REQUIRED') {
      console.log('⚠️ Primary API key exhausted, user key required');
      
      // In a real application, you would:
      // 1. Show UI to collect user's API key
      // 2. Store it temporarily in session
      // 3. Retry the processing
      
      console.log('Please provide your own API key to continue processing');
      throw new Error('User API key required - please configure in settings');
    }
    
    console.error('❌ Processing failed:', error);
    throw error;
  }
}

/**
 * Example 5: Test LLM connection and capabilities
 */
export async function testLLMConnectionExample() {
  try {
    console.log('Testing LLM connection...');
    
    // Test basic connection
    const connectionStatus = await llmConnector.testConnection();
    
    if (connectionStatus.isConnected) {
      console.log('✅ LLM connection successful');
      console.log(`Latency: ${connectionStatus.latency}ms`);
      console.log(`Available models: ${connectionStatus.availableModels.join(', ')}`);
    } else {
      console.log('❌ LLM connection failed');
      console.log(`Error: ${connectionStatus.error}`);
      return false;
    }

    // Test chat completion
    const chatResponse = await llmConnector.createChatCompletion([
      { role: 'system', content: 'You are a helpful assistant that responds in Thai.' },
      { role: 'user', content: 'Say hello in Thai' }
    ]);

    console.log('✅ Chat completion test successful');
    console.log(`Response: ${chatResponse.content}`);
    console.log(`Tokens used: ${chatResponse.usage.totalTokens}`);

    // Test embedding creation
    const embedding = await llmConnector.createEmbedding('Test text for embedding');
    
    console.log('✅ Embedding creation test successful');
    console.log(`Embedding dimensions: ${embedding.embedding.length}`);
    console.log(`Tokens used: ${embedding.usage.totalTokens}`);

    return true;

  } catch (error) {
    console.error('❌ LLM connection test failed:', error);
    return false;
  }
}

/**
 * Example 6: Use ProcessedContent utilities
 */
export function processedContentUtilitiesExample() {
  console.log('Demonstrating ProcessedContent utilities...');

  // Create sample processed content
  const content1 = processedContentUtils.create(
    'Thai translated content 1',
    [{
      id: 'intro1',
      title: 'บทนำ',
      content: 'เนื้อหาบทนำ',
      subsections: [],
      images: [],
      sectionType: 'introduction'
    }],
    'Refined Thai content 1',
    {
      originalUrl: 'https://example1.com',
      extractionDate: new Date(),
      contentType: 'website',
      attribution: 'แหล่งที่มา 1'
    },
    85
  );

  const content2 = processedContentUtils.create(
    'Thai translated content 2',
    [{
      id: 'features2',
      title: 'คุณสมบัติ',
      content: 'รายละเอียดคุณสมบัติ',
      subsections: [],
      images: [],
      sectionType: 'features'
    }],
    'Refined Thai content 2',
    {
      originalUrl: 'https://example2.com',
      extractionDate: new Date(),
      contentType: 'youtube_video',
      attribution: 'แหล่งที่มา 2'
    },
    75
  );

  // Merge contents
  const merged = processedContentUtils.merge([content1, content2], 'prioritize');
  console.log('✅ Contents merged successfully');
  console.log(`Merged sections: ${merged.organizedSections.length}`);
  console.log(`Average quality: ${merged.qualityScore}`);

  // Update quality score
  const enhanced = processedContentUtils.updateQualityScore(merged, {
    hasImages: true,
    hasProperStructure: true,
    languageQuality: 90,
    contentCompleteness: 95
  });

  console.log('✅ Quality score updated');
  console.log(`Enhanced quality: ${enhanced.qualityScore}`);

  // Extract summary
  const summary = processedContentUtils.extractSummary(enhanced, 150);
  console.log('✅ Summary extracted');
  console.log(`Summary: ${summary}`);

  return enhanced;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Starting AI Processing Engine Examples\n');

  try {
    // Test LLM connection first
    const connectionOk = await testLLMConnectionExample();
    if (!connectionOk) {
      console.log('❌ Cannot proceed without LLM connection');
      return;
    }

    console.log('\n' + '='.repeat(50));
    console.log('Example 1: Website Content Processing');
    console.log('='.repeat(50));
    await processWebsiteExample();

    console.log('\n' + '='.repeat(50));
    console.log('Example 2: Video Content Processing');
    console.log('='.repeat(50));
    await processVideoExample();

    console.log('\n' + '='.repeat(50));
    console.log('Example 3: Multi-Source Processing');
    console.log('='.repeat(50));
    await processMultipleSourcesExample();

    console.log('\n' + '='.repeat(50));
    console.log('Example 4: ProcessedContent Utilities');
    console.log('='.repeat(50));
    processedContentUtilitiesExample();

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Examples failed:', error);
  }
}

// All functions are already exported with their declarations above