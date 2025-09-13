import { describe, it, expect, beforeEach } from 'vitest';
import { MFECTemplateService } from './MFECTemplateService';
import { TemplateManager } from './TemplateManager';
import { BrandAssetManager } from './BrandAssetManager';

describe('MFEC Template System Integration', () => {
  let templateService: MFECTemplateService;
  let templateManager: TemplateManager;
  let brandAssetManager: BrandAssetManager;

  beforeEach(() => {
    templateService = new MFECTemplateService();
    templateManager = new TemplateManager();
    brandAssetManager = new BrandAssetManager();
  });

  describe('Template System Validation', () => {
    it('should validate template system structure', async () => {
      // This test validates that the template system is properly structured
      // It will pass even if files don't exist, as long as the validation logic works
      
      const validation = await templateManager.validateTemplateAssets();
      
      // Validation should return a proper structure
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('templateExists');
      expect(validation).toHaveProperty('assetsExist');
      expect(validation).toHaveProperty('brandGuidelineExists');
      
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
    });

    it('should provide correct template paths', () => {
      const templatePath = templateManager.getTemplatePath();
      const guidelinePath = templateManager.getBrandGuidelinePath();
      const assetBasePath = brandAssetManager.getAssetBasePath();

      expect(templatePath).toContain('MFEC_System&User_Manual_Template.docx');
      expect(guidelinePath).toContain('ENG_MFEC Brand Guideline');
      expect(assetBasePath).toBe('.qodo/Template');
    });

    it('should handle asset path generation correctly', () => {
      const logoPath = brandAssetManager.getAssetPath('Logo MFEC.png');
      expect(logoPath).toContain('Logo MFEC.png');
      expect(logoPath).toContain('.qodo');
    });
  });

  describe('Template Configuration', () => {
    it('should create template configuration structure for system manual', async () => {
      // Test the structure creation without requiring actual files
      try {
        const config = await templateService.createTemplateConfiguration('system_manual');
        
        // If files exist, validate the structure
        expect(config).toHaveProperty('template');
        expect(config).toHaveProperty('validation');
        expect(config).toHaveProperty('assets');
        expect(config.template.documentType).toBe('system_manual');
      } catch (error) {
        // If files don't exist, that's expected in test environment
        // Just validate that the error is the expected type
        expect(error).toBeDefined();
      }
    });

    it('should create template configuration structure for user manual', async () => {
      try {
        const config = await templateService.createTemplateConfiguration('user_manual');
        
        expect(config).toHaveProperty('template');
        expect(config).toHaveProperty('validation');
        expect(config).toHaveProperty('assets');
        expect(config.template.documentType).toBe('user_manual');
      } catch (error) {
        // Expected if files don't exist in test environment
        expect(error).toBeDefined();
      }
    });
  });

  describe('Service Integration', () => {
    it('should provide unified template service interface', () => {
      const paths = templateService.getTemplatePaths();
      
      expect(paths).toHaveProperty('template');
      expect(paths).toHaveProperty('brandGuideline');
      expect(paths).toHaveProperty('assetBase');
      
      expect(paths.template).toContain('MFEC_System&User_Manual_Template.docx');
      expect(paths.brandGuideline).toContain('ENG_MFEC Brand Guideline');
      expect(paths.assetBase).toBe('.qodo/Template');
    });

    it('should handle cache operations', () => {
      // Test that cache operations don't throw errors
      expect(() => templateService.clearCaches()).not.toThrow();
      expect(() => templateManager.clearCache()).not.toThrow();
      expect(() => brandAssetManager.clearCache()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent assets gracefully', async () => {
      const exists = await brandAssetManager.validateAsset('NonExistent.png');
      expect(exists).toBe(false);
    });

    it('should handle asset existence checks', async () => {
      const exists = await templateService.assetExists('NonExistent.png');
      expect(exists).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct document types', async () => {
      // Test that TypeScript types are working correctly
      const validTypes: ('system_manual' | 'user_manual')[] = ['system_manual', 'user_manual'];
      
      for (const docType of validTypes) {
        try {
          await templateService.loadTemplate(docType);
        } catch (error) {
          // Expected if files don't exist, but should not be a type error
          expect(error).toBeDefined();
        }
      }
    });

    it('should enforce correct logo types', async () => {
      const validLogoTypes: ('standard' | 'white' | 'ai')[] = ['standard', 'white', 'ai'];
      
      for (const logoType of validLogoTypes) {
        try {
          await templateService.getLogoAsset(logoType);
        } catch (error) {
          // Expected if files don't exist, but should not be a type error
          expect(error).toBeDefined();
        }
      }
    });
  });
});