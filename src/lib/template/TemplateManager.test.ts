import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { TemplateManager } from './TemplateManager';
import { TemplateError } from '../../types';

// Mock fs module
vi.mock('fs', () => ({
  default: {},
  promises: {
    access: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn()
  }
}));

const mockFs = vi.mocked(fs);

describe('TemplateManager', () => {
  let templateManager: TemplateManager;

  beforeEach(() => {
    templateManager = new TemplateManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    templateManager.clearCache();
  });

  describe('loadTemplate', () => {
    it('should load system manual template successfully', async () => {
      // Mock file access to succeed
      mockFs.access.mockResolvedValue(undefined);

      const template = await templateManager.loadTemplate('system_manual');

      expect(template).toBeDefined();
      expect(template.documentType).toBe('system_manual');
      expect(template.templatePath).toContain('MFEC_System&User_Manual_Template.docx');
      expect(template.brandGuidelinePath).toContain('ENG_MFEC Brand Guideline');
      expect(template.logoAssets.standard).toContain('Logo MFEC.png');
      expect(template.logoAssets.white).toContain('Logo MFEC White.png');
      expect(template.logoAssets.ai).toContain('Logo MFEC More. 2023ai.ai');
    });

    it('should load user manual template successfully', async () => {
      // Mock file access to succeed
      mockFs.access.mockResolvedValue(undefined);

      const template = await templateManager.loadTemplate('user_manual');

      expect(template).toBeDefined();
      expect(template.documentType).toBe('user_manual');
      expect(template.styleSettings.logoPlacement.documentLogo).toBe('standard');
    });

    it('should use cached template on second load', async () => {
      // Mock file access to succeed
      mockFs.access.mockResolvedValue(undefined);

      const template1 = await templateManager.loadTemplate('system_manual');
      const template2 = await templateManager.loadTemplate('system_manual');

      expect(template1).toBe(template2); // Should be same object from cache
      expect(mockFs.access).toHaveBeenCalledTimes(3); // Only called once for validation
    });

    it('should throw TemplateError when validation fails', async () => {
      // Mock file access to fail
      mockFs.access.mockRejectedValue(new Error('File not found'));

      await expect(templateManager.loadTemplate('system_manual'))
        .rejects.toThrow(TemplateError);
    });
  });

  describe('validateTemplateAssets', () => {
    it('should validate all assets successfully', async () => {
      // Mock all file access to succeed
      mockFs.access.mockResolvedValue(undefined);

      const validation = await templateManager.validateTemplateAssets();

      expect(validation.isValid).toBe(true);
      expect(validation.templateExists).toBe(true);
      expect(validation.assetsExist).toBe(true);
      expect(validation.brandGuidelineExists).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should report missing template file', async () => {
      // Mock template file access to fail, others succeed
      mockFs.access.mockImplementation((path) => {
        if (path.toString().includes('MFEC_System&User_Manual_Template.docx')) {
          return Promise.reject(new Error('File not found'));
        }
        return Promise.resolve(undefined);
      });

      const validation = await templateManager.validateTemplateAssets();

      expect(validation.isValid).toBe(false);
      expect(validation.templateExists).toBe(false);
      expect(validation.errors).toContain('Template file not found: MFEC_System&User_Manual_Template.docx');
    });

    it('should report missing brand guideline', async () => {
      // Mock brand guideline access to fail, others succeed
      mockFs.access.mockImplementation((path) => {
        if (path.toString().includes('ENG_MFEC Brand Guideline')) {
          return Promise.reject(new Error('File not found'));
        }
        return Promise.resolve(undefined);
      });

      const validation = await templateManager.validateTemplateAssets();

      expect(validation.isValid).toBe(false);
      expect(validation.brandGuidelineExists).toBe(false);
      expect(validation.errors).toContain('Brand guideline not found: ENG_MFEC Brand Guideline as of 11 Sep 23.pdf');
    });

    it('should report missing logo assets as warnings', async () => {
      // Mock logo file access to fail, others succeed
      mockFs.access.mockImplementation((path) => {
        if (path.toString().includes('Logo MFEC.png')) {
          return Promise.reject(new Error('File not found'));
        }
        return Promise.resolve(undefined);
      });

      const validation = await templateManager.validateTemplateAssets();

      expect(validation.isValid).toBe(true); // Still valid with some logos missing
      expect(validation.assetsExist).toBe(false);
      expect(validation.warnings).toContain('Logo asset not found: Logo MFEC.png');
    });

    it('should fail validation when no logo assets exist', async () => {
      // Mock all logo file access to fail, template and guideline succeed
      mockFs.access.mockImplementation((path) => {
        if (path.toString().includes('Logo MFEC')) {
          return Promise.reject(new Error('File not found'));
        }
        return Promise.resolve(undefined);
      });

      const validation = await templateManager.validateTemplateAssets();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('No logo assets found');
    });
  });

  describe('getTemplatePath', () => {
    it('should return correct template path', () => {
      const path = templateManager.getTemplatePath();
      expect(path).toContain('.qodo/Template/MFEC_System&User_Manual_Template.docx');
    });
  });

  describe('getBrandGuidelinePath', () => {
    it('should return correct brand guideline path', () => {
      const path = templateManager.getBrandGuidelinePath();
      expect(path).toContain('.qodo/Template/ENG_MFEC Brand Guideline as of 11 Sep 23.pdf');
    });
  });

  describe('clearCache', () => {
    it('should clear template cache', async () => {
      // Mock file access to succeed
      mockFs.access.mockResolvedValue(undefined);

      // Load template to populate cache
      await templateManager.loadTemplate('system_manual');
      
      // Clear cache
      templateManager.clearCache();
      
      // Load again - should call validation again
      await templateManager.loadTemplate('system_manual');
      
      expect(mockFs.access).toHaveBeenCalledTimes(6); // 3 calls for each load
    });
  });

  describe('style settings', () => {
    it('should provide correct default style settings for system manual', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const template = await templateManager.loadTemplate('system_manual');

      expect(template.styleSettings.fonts.primaryFont).toBe('Tahoma');
      expect(template.styleSettings.primaryColors).toContain('#0066CC');
      expect(template.styleSettings.logoPlacement.documentLogo).toBe('ai');
      expect(template.styleSettings.headerFooterSettings.includeHeader).toBe(true);
    });

    it('should provide correct default style settings for user manual', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const template = await templateManager.loadTemplate('user_manual');

      expect(template.styleSettings.logoPlacement.documentLogo).toBe('standard');
      expect(template.styleSettings.spacing.margins.top).toBe(2.5);
      expect(template.styleSettings.fonts.sizes.h1).toBe(18);
    });
  });
});