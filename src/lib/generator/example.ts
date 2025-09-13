/**
 * Example usage of the Document Generator and Template Engine
 * Demonstrates complete document generation pipeline
 */

import { DocumentGenerator } from './DocumentGenerator';
import { DocumentRequest, ProcessedContent, DocumentSection, SourceInfo } from '../../types';

/**
 * Example: Generate a complete Thai user manual
 */
export async function generateExampleUserManual(): Promise<void> {
  try {
    // Initialize the document generator
    const generator = new DocumentGenerator();
    await generator.initialize();

    // Create a sample document request
    const request: DocumentRequest = {
      productUrl: 'https://example.com/smartphone-x1',
      documentType: 'user_manual',
      language: 'thai',
      mfecTemplate: 'user_manual',
      includeImages: true,
      customInstructions: 'Include detailed setup instructions and troubleshooting guide'
    };

    // Create sample processed content (normally this would come from AI processing)
    const processedContent: ProcessedContent = {
      translatedContent: 'เนื้อหาที่แปลและปรับปรุงแล้วสำหรับคู่มือผู้ใช้สมาร์ทโฟน X1',
      organizedSections: [
        {
          id: 'introduction',
          title: 'บทนำ',
          content: 'ยินดีต้อนรับสู่สมาร์ทโฟน X1 ผลิตภัณฑ์ล่าสุดที่จะเปลี่ยนประสบการณ์การใช้งานของคุณ',
          level: 1,
          subsections: [],
          images: [
            {
              imageId: 'phone-overview.jpg',
              position: 'top',
              caption: 'ภาพรวมของสมาร์ทโฟน X1',
              size: 'medium'
            }
          ],
          sectionType: 'introduction'
        },
        {
          id: 'features',
          title: 'คุณสมบัติหลัก',
          content: 'สมาร์ทโฟน X1 มาพร้อมกับคุณสมบัติที่ทันสมัย:\n• หน้าจอ OLED ขนาด 6.5 นิ้ว\n• กล้องหลัก 108MP\n• แบตเตอรี่ 5000mAh\n• ชิปประมวลผล A15 Bionic',
          level: 1,
          subsections: [
            {
              id: 'camera-features',
              title: 'คุณสมบัติกล้อง',
              content: 'กล้องของ X1 มีความสามารถในการถ่ายภาพที่ยอดเยี่ยม พร้อมโหมดถ่ายภาพกลางคืนและการซูมออปติคอล 3 เท่า',
              level: 2,
              subsections: [],
              images: [],
              sectionType: 'features'
            }
          ],
          images: [],
          sectionType: 'features'
        },
        {
          id: 'installation',
          title: 'การติดตั้งและการตั้งค่าเริ่มต้น',
          content: 'ขั้นตอนการติดตั้งและตั้งค่าเริ่มต้น:\n1. เปิดกล่องและตรวจสอบอุปกรณ์\n2. ใส่ซิมการ์ดและเปิดเครื่อง\n3. เชื่อมต่อ Wi-Fi\n4. ลงชื่อเข้าใช้บัญชี Google\n5. ตั้งค่าความปลอดภัย',
          level: 1,
          subsections: [],
          images: [
            {
              imageId: 'setup-steps.jpg',
              position: 'inline',
              caption: 'ขั้นตอนการตั้งค่าเริ่มต้น',
              size: 'large'
            }
          ],
          sectionType: 'installation'
        },
        {
          id: 'usage',
          title: 'การใช้งานพื้นฐาน',
          content: 'คู่มือการใช้งานพื้นฐานของสมาร์ทโฟน X1 รวมถึงการใช้งานแอปพลิเคชัน การจัดการไฟล์ และการตั้งค่าต่างๆ',
          level: 1,
          subsections: [],
          images: [],
          sectionType: 'usage'
        },
        {
          id: 'troubleshooting',
          title: 'การแก้ไขปัญหา',
          content: 'ปัญหา: เครื่องเปิดไม่ติด\nวิธีแก้: ตรวจสอบแบตเตอรี่และกดปุ่มเปิด-ปิดค้างไว้ 10 วินาที\n\nปัญหา: เชื่อมต่อ Wi-Fi ไม่ได้\nวิธีแก้: ตรวจสอบรหัสผ่านและรีสตาร์ทเราเตอร์',
          level: 1,
          subsections: [],
          images: [],
          sectionType: 'troubleshooting'
        },
        {
          id: 'specifications',
          title: 'ข้อมูลจำเพาะ',
          content: 'หน้าจอ: OLED 6.5 นิ้ว 2400x1080\nหน่วยประมวลผล: A15 Bionic\nหน่วยความจำ: 8GB RAM\nพื้นที่เก็บข้อมูล: 256GB\nกล้อง: หลัง 108MP, หน้า 32MP\nแบตเตอรี่: 5000mAh\nระบบปฏิบัติการ: Android 14',
          level: 1,
          subsections: [],
          images: [],
          sectionType: 'specifications'
        }
      ],
      refinedContent: 'เนื้อหาที่ได้รับการปรับปรุงและจัดระเบียบแล้วสำหรับคู่มือผู้ใช้สมาร์ทโฟน X1 ครอบคลุมทุกด้านตั้งแต่การแนะนำผลิตภัณฑ์ คุณสมบัติ การติดตั้ง การใช้งาน การแก้ไขปัญหา และข้อมูลจำเพาะ',
      sourceAttribution: {
        originalUrl: 'https://example.com/smartphone-x1',
        extractionDate: new Date('2024-01-01'),
        contentType: 'website',
        attribution: 'Generated from official product page'
      },
      qualityScore: 0.95
    };

    // Generate the document
    console.log('🚀 Starting document generation...');
    const result = await generator.generateFromRequest(request, processedContent);

    // Display results
    console.log('✅ Document generated successfully!');
    console.log(`📄 Document ID: ${result.document.id}`);
    console.log(`📝 Title: ${result.document.title}`);
    console.log(`⏱️  Generation time: ${result.generationTime}ms`);
    console.log(`📊 Quality score: ${result.document.content.qualityScore}`);
    console.log(`🔗 Preview URL: ${result.document.previewUrl}`);
    
    // Show export formats
    console.log('\n📦 Available exports:');
    Object.entries(result.exportUrls).forEach(([format, url]) => {
      console.log(`  ${format.toUpperCase()}: ${url}`);
    });

    // Show generation statistics
    const stats = generator.getGenerationStats(result.document);
    console.log('\n📈 Generation Statistics:');
    console.log(`  Word count: ${stats.contentStats.wordCount}`);
    console.log(`  Section count: ${stats.contentStats.sectionCount}`);
    console.log(`  Image count: ${stats.contentStats.imageCount}`);
    console.log(`  Template type: ${stats.templateInfo.templateType}`);
    console.log(`  AI model: ${stats.processingInfo.aiModel}`);

    // Show warnings if any
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return;

  } catch (error) {
    console.error('❌ Document generation failed:', error);
    throw error;
  }
}

/**
 * Example: Generate a product document
 */
export async function generateExampleProductDocument(): Promise<void> {
  try {
    const generator = new DocumentGenerator();
    await generator.initialize();

    const request: DocumentRequest = {
      productUrl: 'https://example.com/laptop-pro',
      documentType: 'product_document',
      language: 'thai',
      mfecTemplate: 'system_manual',
      includeImages: true,
      customInstructions: 'Focus on technical specifications and enterprise features'
    };

    const processedContent: ProcessedContent = {
      translatedContent: 'เอกสารผลิตภัณฑ์แล็ปท็อป Pro สำหรับองค์กร',
      organizedSections: [
        {
          id: 'overview',
          title: 'ภาพรวมผลิตภัณฑ์',
          content: 'แล็ปท็อป Pro เป็นโซลูชันคอมพิวเตอร์สำหรับองค์กรที่ต้องการประสิทธิภาพสูง',
          level: 1,
          subsections: [],
          images: [],
          sectionType: 'introduction'
        },
        {
          id: 'specifications',
          title: 'ข้อมูลจำเพาะทางเทคนิค',
          content: 'CPU: Intel Core i9-13900H\nRAM: 32GB DDR5\nStorage: 1TB NVMe SSD\nGPU: NVIDIA RTX 4070\nDisplay: 16" 4K OLED\nOS: Windows 11 Pro',
          level: 1,
          subsections: [],
          images: [],
          sectionType: 'specifications'
        }
      ],
      refinedContent: 'เอกสารผลิตภัณฑ์ที่ครอบคลุมข้อมูลทางเทคนิคและคุณสมบัติสำหรับองค์กร',
      sourceAttribution: {
        originalUrl: 'https://example.com/laptop-pro',
        extractionDate: new Date('2024-01-01'),
        contentType: 'website',
        attribution: 'Generated from product specifications'
      },
      qualityScore: 0.92
    };

    const result = await generator.generateFromRequest(request, processedContent);

    console.log('✅ Product document generated successfully!');
    console.log(`📄 Document ID: ${result.document.id}`);
    console.log(`📝 Title: ${result.document.title}`);
    console.log(`📦 Template: ${result.document.template.documentType}`);

    return;

  } catch (error) {
    console.error('❌ Product document generation failed:', error);
    throw error;
  }
}

/**
 * Example: Validate generation requirements
 */
export async function validateGenerationExample(): Promise<void> {
  try {
    const generator = new DocumentGenerator();
    await generator.initialize();

    const request: DocumentRequest = {
      productUrl: 'https://example.com/product',
      documentType: 'user_manual',
      language: 'thai',
      mfecTemplate: 'user_manual',
      includeImages: true
    };

    const validation = await generator.validateGenerationRequirements(request);

    console.log('🔍 Validation Results:');
    console.log(`  Valid: ${validation.isValid}`);
    
    if (validation.errors.length > 0) {
      console.log('  Errors:');
      validation.errors.forEach(error => console.log(`    - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('  Warnings:');
      validation.warnings.forEach(warning => console.log(`    - ${warning}`));
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

/**
 * Example: Get available templates
 */
export async function showAvailableTemplates(): Promise<void> {
  try {
    const generator = new DocumentGenerator();
    await generator.initialize();

    const templates = await generator.getAvailableTemplates();

    console.log('📋 Available MFEC Templates:');
    console.log(`  User Manual: ${templates.userManual.templatePath}`);
    console.log(`  System Manual: ${templates.systemManual.templatePath}`);
    console.log(`  Brand Guideline: ${templates.userManual.brandGuidelinePath}`);
    
    console.log('\n🎨 Logo Assets:');
    Object.entries(templates.userManual.logoAssets).forEach(([type, path]) => {
      console.log(`  ${type}: ${path}`);
    });

  } catch (error) {
    console.error('❌ Failed to get templates:', error);
  }
}

// Export all examples for easy testing
export const examples = {
  generateExampleUserManual,
  generateExampleProductDocument,
  validateGenerationExample,
  showAvailableTemplates
};