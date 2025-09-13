import { promises as fs } from 'fs';
import path from 'path';
import { 
  MFECTemplate, 
  BrandStyleSettings, 
  TemplateValidationResult, 
  TemplateError,
  FontSettings,
  SpacingSettings,
  HeaderFooterConfig,
  LogoPlacementConfig
} from '../../types';

/**
 * TemplateManager handles loading and managing MFEC document templates
 * Loads MFEC_System&User_Manual_Template.docx and applies brand guidelines
 */
export class TemplateManager {
  private static readonly TEMPLATE_BASE_PATH = '.qodo/Template';
  private static readonly TEMPLATE_FILE = 'MFEC_System&User_Manual_Template.docx';
  private static readonly BRAND_GUIDELINE_FILE = 'ENG_MFEC Brand Guideline as of 11 Sep 23.pdf';
  
  private templateCache: Map<string, MFECTemplate> = new Map();

  /**
   * Load MFEC template with specified document type
   */
  async loadTemplate(documentType: 'system_manual' | 'user_manual'): Promise<MFECTemplate> {
    const cacheKey = `mfec_${documentType}`;
    
    // Check cache first
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    try {
      // Validate template files exist
      const validation = await this.validateTemplateAssets();
      if (!validation.isValid) {
        throw new TemplateError(
          `Template validation failed: ${validation.errors.join(', ')}`,
          'TEMPLATE_VALIDATION_FAILED'
        );
      }

      // Create template configuration
      const template: MFECTemplate = {
        templatePath: path.join(TemplateManager.TEMPLATE_BASE_PATH, TemplateManager.TEMPLATE_FILE),
        brandGuidelinePath: path.join(TemplateManager.TEMPLATE_BASE_PATH, TemplateManager.BRAND_GUIDELINE_FILE),
        logoAssets: {
          standard: path.join(TemplateManager.TEMPLATE_BASE_PATH, 'Logo MFEC.png'),
          white: path.join(TemplateManager.TEMPLATE_BASE_PATH, 'Logo MFEC White.png'),
          ai: path.join(TemplateManager.TEMPLATE_BASE_PATH, 'Logo MFEC More. 2023ai.ai')
        },
        documentType,
        styleSettings: this.getDefaultStyleSettings(documentType)
      };

      // Cache the template
      this.templateCache.set(cacheKey, template);
      
      return template;
    } catch (error) {
      if (error instanceof TemplateError) {
        throw error;
      }
      throw new TemplateError(
        `Failed to load MFEC template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_LOAD_FAILED'
      );
    }
  }

  /**
   * Validate that all required template assets exist
   */
  async validateTemplateAssets(): Promise<TemplateValidationResult> {
    const result: TemplateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      templateExists: false,
      assetsExist: false,
      brandGuidelineExists: false
    };

    try {
      // Check template file
      const templatePath = path.join(TemplateManager.TEMPLATE_BASE_PATH, TemplateManager.TEMPLATE_FILE);
      await fs.access(templatePath);
      result.templateExists = true;
    } catch {
      result.errors.push(`Template file not found: ${TemplateManager.TEMPLATE_FILE}`);
      result.isValid = false;
    }

    try {
      // Check brand guideline
      const guidelinePath = path.join(TemplateManager.TEMPLATE_BASE_PATH, TemplateManager.BRAND_GUIDELINE_FILE);
      await fs.access(guidelinePath);
      result.brandGuidelineExists = true;
    } catch {
      result.errors.push(`Brand guideline not found: ${TemplateManager.BRAND_GUIDELINE_FILE}`);
      result.isValid = false;
    }

    // Check logo assets
    const logoFiles = ['Logo MFEC.png', 'Logo MFEC White.png', 'Logo MFEC More. 2023ai.ai'];
    let assetsFound = 0;

    for (const logoFile of logoFiles) {
      try {
        const logoPath = path.join(TemplateManager.TEMPLATE_BASE_PATH, logoFile);
        await fs.access(logoPath);
        assetsFound++;
      } catch {
        result.warnings.push(`Logo asset not found: ${logoFile}`);
      }
    }

    result.assetsExist = assetsFound === logoFiles.length;
    if (assetsFound === 0) {
      result.errors.push('No logo assets found');
      result.isValid = false;
    } else if (assetsFound < logoFiles.length) {
      result.warnings.push(`Only ${assetsFound}/${logoFiles.length} logo assets found`);
    }

    return result;
  }

  /**
   * Get template file path
   */
  getTemplatePath(): string {
    return path.join(TemplateManager.TEMPLATE_BASE_PATH, TemplateManager.TEMPLATE_FILE);
  }

  /**
   * Get brand guideline file path
   */
  getBrandGuidelinePath(): string {
    return path.join(TemplateManager.TEMPLATE_BASE_PATH, TemplateManager.BRAND_GUIDELINE_FILE);
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get default style settings based on MFEC brand guidelines
   */
  private getDefaultStyleSettings(documentType: 'system_manual' | 'user_manual'): BrandStyleSettings {
    const fontSettings: FontSettings = {
      primaryFont: 'Tahoma',
      secondaryFont: 'Arial',
      headerFont: 'Tahoma',
      bodyFont: 'Tahoma',
      sizes: {
        h1: 18,
        h2: 16,
        h3: 14,
        body: 12,
        caption: 10
      }
    };

    const spacingSettings: SpacingSettings = {
      margins: {
        top: 2.5, // cm
        bottom: 2.5,
        left: 2.5,
        right: 2.5
      },
      padding: {
        section: 12, // pt
        paragraph: 6
      },
      lineHeight: 1.15
    };

    const headerFooterSettings: HeaderFooterConfig = {
      includeHeader: true,
      includeFooter: true,
      headerHeight: 1.5, // cm
      footerHeight: 1.0,
      logoPosition: 'left'
    };

    const logoPlacementSettings: LogoPlacementConfig = {
      headerLogo: 'standard',
      footerLogo: 'standard',
      documentLogo: documentType === 'system_manual' ? 'ai' : 'standard',
      maxWidth: 150, // px
      maxHeight: 50
    };

    return {
      primaryColors: ['#0066CC', '#003366', '#666666'], // MFEC blue palette
      fonts: fontSettings,
      spacing: spacingSettings,
      headerFooterSettings: headerFooterSettings,
      logoPlacement: logoPlacementSettings
    };
  }
}