import { promises as fs } from 'fs';
import path from 'path';
import { BrandAsset, AssetError } from '../../types';

/**
 * BrandAssetManager handles MFEC brand assets including logos and guidelines
 * Manages loading, validation, and access to MFEC brand resources
 */
export class BrandAssetManager {
  private static readonly ASSET_BASE_PATH = '.qodo/Template';
  private assetCache: Map<string, BrandAsset> = new Map();

  /**
   * Get all available MFEC brand assets
   */
  async getAllAssets(): Promise<BrandAsset[]> {
    try {
      const assetDir = BrandAssetManager.ASSET_BASE_PATH;
      const files = await fs.readdir(assetDir);
      const assets: BrandAsset[] = [];

      for (const file of files) {
        const filePath = path.join(assetDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          const asset = this.createAssetFromFile(file, filePath, stats);
          assets.push(asset);
          
          // Cache the asset
          this.assetCache.set(asset.name, asset);
        }
      }

      return assets;
    } catch (error) {
      throw new AssetError(
        `Failed to load brand assets: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ASSET_LOAD_FAILED',
        BrandAssetManager.ASSET_BASE_PATH
      );
    }
  }

  /**
   * Get specific logo asset by type
   */
  async getLogoAsset(logoType: 'standard' | 'white' | 'ai'): Promise<BrandAsset> {
    const logoFileMap = {
      standard: 'Logo MFEC.png',
      white: 'Logo MFEC White.png',
      ai: 'Logo MFEC More. 2023ai.ai'
    };

    const fileName = logoFileMap[logoType];
    const cacheKey = `logo_${logoType}`;

    // Check cache first
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey)!;
    }

    try {
      const filePath = path.join(BrandAssetManager.ASSET_BASE_PATH, fileName);
      await fs.access(filePath);
      
      const stats = await fs.stat(filePath);
      const asset = this.createAssetFromFile(fileName, filePath, stats);
      
      // Cache the asset
      this.assetCache.set(cacheKey, asset);
      
      return asset;
    } catch (error) {
      throw new AssetError(
        `Logo asset not found: ${fileName}`,
        'LOGO_NOT_FOUND',
        fileName
      );
    }
  }

  /**
   * Get template document asset
   */
  async getTemplateAsset(): Promise<BrandAsset> {
    const templateFile = 'MFEC_System&User_Manual_Template.docx';
    const cacheKey = 'template_document';

    // Check cache first
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey)!;
    }

    try {
      const filePath = path.join(BrandAssetManager.ASSET_BASE_PATH, templateFile);
      await fs.access(filePath);
      
      const stats = await fs.stat(filePath);
      const asset = this.createAssetFromFile(templateFile, filePath, stats);
      
      // Cache the asset
      this.assetCache.set(cacheKey, asset);
      
      return asset;
    } catch (error) {
      throw new AssetError(
        `Template document not found: ${templateFile}`,
        'TEMPLATE_NOT_FOUND',
        templateFile
      );
    }
  }

  /**
   * Get brand guideline asset
   */
  async getBrandGuidelineAsset(): Promise<BrandAsset> {
    const guidelineFile = 'ENG_MFEC Brand Guideline as of 11 Sep 23.pdf';
    const cacheKey = 'brand_guideline';

    // Check cache first
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey)!;
    }

    try {
      const filePath = path.join(BrandAssetManager.ASSET_BASE_PATH, guidelineFile);
      await fs.access(filePath);
      
      const stats = await fs.stat(filePath);
      const asset = this.createAssetFromFile(guidelineFile, filePath, stats);
      
      // Cache the asset
      this.assetCache.set(cacheKey, asset);
      
      return asset;
    } catch (error) {
      throw new AssetError(
        `Brand guideline not found: ${guidelineFile}`,
        'GUIDELINE_NOT_FOUND',
        guidelineFile
      );
    }
  }

  /**
   * Validate that a specific asset exists and is accessible
   */
  async validateAsset(assetName: string): Promise<boolean> {
    try {
      const filePath = path.join(BrandAssetManager.ASSET_BASE_PATH, assetName);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get asset file path
   */
  getAssetPath(assetName: string): string {
    return path.join(BrandAssetManager.ASSET_BASE_PATH, assetName);
  }

  /**
   * Get asset base directory path
   */
  getAssetBasePath(): string {
    return BrandAssetManager.ASSET_BASE_PATH;
  }

  /**
   * Clear asset cache
   */
  clearCache(): void {
    this.assetCache.clear();
  }

  /**
   * Get asset file size in bytes
   */
  async getAssetSize(assetName: string): Promise<number> {
    try {
      const filePath = path.join(BrandAssetManager.ASSET_BASE_PATH, assetName);
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      throw new AssetError(
        `Failed to get asset size: ${assetName}`,
        'ASSET_SIZE_FAILED',
        assetName
      );
    }
  }

  /**
   * Check if asset is a logo file
   */
  private isLogoAsset(fileName: string): boolean {
    const logoFiles = ['Logo MFEC.png', 'Logo MFEC White.png', 'Logo MFEC More. 2023ai.ai'];
    return logoFiles.includes(fileName);
  }

  /**
   * Check if asset is the template document
   */
  private isTemplateAsset(fileName: string): boolean {
    return fileName === 'MFEC_System&User_Manual_Template.docx';
  }

  /**
   * Check if asset is the brand guideline
   */
  private isGuidelineAsset(fileName: string): boolean {
    return fileName === 'ENG_MFEC Brand Guideline as of 11 Sep 23.pdf';
  }

  /**
   * Create BrandAsset object from file information
   */
  private createAssetFromFile(fileName: string, filePath: string, stats: any): BrandAsset {
    let assetType: 'logo' | 'template' | 'guideline';
    
    if (this.isLogoAsset(fileName)) {
      assetType = 'logo';
    } else if (this.isTemplateAsset(fileName)) {
      assetType = 'template';
    } else if (this.isGuidelineAsset(fileName)) {
      assetType = 'guideline';
    } else {
      assetType = 'template'; // Default fallback
    }

    const format = path.extname(fileName).toLowerCase().substring(1);

    return {
      name: fileName,
      path: filePath,
      type: assetType,
      format,
      size: stats.size,
      lastModified: stats.mtime
    };
  }
}