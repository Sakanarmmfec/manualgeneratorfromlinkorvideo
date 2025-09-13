import { TemplateManager } from './TemplateManager';
import { BrandAssetManager } from './BrandAssetManager';
import { 
  MFECTemplate, 
  TemplateValidationResult, 
  BrandAsset, 
  TemplateError,
  AssetError
} from '../../types';

/**
 * MFECTemplateService provides a unified interface for MFEC template and asset management
 * Combines TemplateManager and BrandAssetManager functionality
 */
export class MFECTemplateService {
  private templateManager: TemplateManager;
  private brandAssetManager: BrandAssetManager;

  constructor() {
    this.templateManager = new TemplateManager();
    this.brandAssetManager = new BrandAssetManager();
  }

  /**
   * Initialize and validate the MFEC template system
   */
  async initialize(): Promise<TemplateValidationResult> {
    try {
      // Validate template assets first
      const validation = await this.templateManager.validateTemplateAssets();
      
      if (!validation.isValid) {
        throw new TemplateError(
          `MFEC template system validation failed: ${validation.errors.join(', ')}`,
          'TEMPLATE_SYSTEM_INVALID'
        );
      }

      // Load and validate brand assets
      await this.brandAssetManager.getAllAssets();
      
      return validation;
    } catch (error) {
      if (error instanceof TemplateError || error instanceof AssetError) {
        throw error;
      }
      throw new TemplateError(
        `Failed to initialize MFEC template system: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_SYSTEM_INIT_FAILED'
      );
    }
  }

  /**
   * Load MFEC template for specified document type
   */
  async loadTemplate(documentType: 'system_manual' | 'user_manual'): Promise<MFECTemplate> {
    try {
      return await this.templateManager.loadTemplate(documentType);
    } catch (error) {
      throw new TemplateError(
        `Failed to load MFEC template for ${documentType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_LOAD_FAILED'
      );
    }
  }

  /**
   * Get all available brand assets
   */
  async getBrandAssets(): Promise<BrandAsset[]> {
    try {
      return await this.brandAssetManager.getAllAssets();
    } catch (error) {
      throw new AssetError(
        `Failed to load brand assets: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BRAND_ASSETS_LOAD_FAILED'
      );
    }
  }

  /**
   * Get specific logo asset
   */
  async getLogoAsset(logoType: 'standard' | 'white' | 'ai'): Promise<BrandAsset> {
    try {
      return await this.brandAssetManager.getLogoAsset(logoType);
    } catch (error) {
      throw new AssetError(
        `Failed to load logo asset ${logoType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LOGO_ASSET_LOAD_FAILED',
        logoType
      );
    }
  }

  /**
   * Get template document asset
   */
  async getTemplateDocument(): Promise<BrandAsset> {
    try {
      return await this.brandAssetManager.getTemplateAsset();
    } catch (error) {
      throw new AssetError(
        `Failed to load template document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_DOCUMENT_LOAD_FAILED'
      );
    }
  }

  /**
   * Get brand guideline asset
   */
  async getBrandGuideline(): Promise<BrandAsset> {
    try {
      return await this.brandAssetManager.getBrandGuidelineAsset();
    } catch (error) {
      throw new AssetError(
        `Failed to load brand guideline: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BRAND_GUIDELINE_LOAD_FAILED'
      );
    }
  }

  /**
   * Validate template and assets
   */
  async validateSystem(): Promise<TemplateValidationResult> {
    try {
      const validation = await this.templateManager.validateTemplateAssets();
      
      // Additional validation for brand assets
      const logoTypes: ('standard' | 'white' | 'ai')[] = ['standard', 'white', 'ai'];
      for (const logoType of logoTypes) {
        try {
          await this.brandAssetManager.getLogoAsset(logoType);
        } catch (error) {
          validation.warnings.push(`Logo asset ${logoType} validation failed`);
        }
      }

      return validation;
    } catch (error) {
      throw new TemplateError(
        `Template system validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_SYSTEM_VALIDATION_FAILED'
      );
    }
  }

  /**
   * Get template file paths
   */
  getTemplatePaths(): {
    template: string;
    brandGuideline: string;
    assetBase: string;
  } {
    return {
      template: this.templateManager.getTemplatePath(),
      brandGuideline: this.templateManager.getBrandGuidelinePath(),
      assetBase: this.brandAssetManager.getAssetBasePath()
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.templateManager.clearCache();
    this.brandAssetManager.clearCache();
  }

  /**
   * Check if specific asset exists
   */
  async assetExists(assetName: string): Promise<boolean> {
    return await this.brandAssetManager.validateAsset(assetName);
  }

  /**
   * Get asset file size
   */
  async getAssetSize(assetName: string): Promise<number> {
    return await this.brandAssetManager.getAssetSize(assetName);
  }

  /**
   * Create a complete template configuration with validation
   */
  async createTemplateConfiguration(documentType: 'system_manual' | 'user_manual'): Promise<{
    template: MFECTemplate;
    validation: TemplateValidationResult;
    assets: BrandAsset[];
  }> {
    try {
      // Validate system first
      const validation = await this.validateSystem();
      
      if (!validation.isValid) {
        throw new TemplateError(
          `Cannot create template configuration: ${validation.errors.join(', ')}`,
          'TEMPLATE_CONFIG_INVALID'
        );
      }

      // Load template and assets
      const [template, assets] = await Promise.all([
        this.loadTemplate(documentType),
        this.getBrandAssets()
      ]);

      return {
        template,
        validation,
        assets
      };
    } catch (error) {
      if (error instanceof TemplateError || error instanceof AssetError) {
        throw error;
      }
      throw new TemplateError(
        `Failed to create template configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_CONFIG_CREATION_FAILED'
      );
    }
  }
}