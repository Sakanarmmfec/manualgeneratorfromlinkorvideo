import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MFECTemplateService } from './MFECTemplateService';
import { TemplateManager } from './TemplateManager';
import { BrandAssetManager } from './BrandAssetManager';
import { TemplateError, AssetError } from '../../types';

// Mock the manager classes
vi.mock('./TemplateManager');
vi.mock('./BrandAssetManager');

const MockTemplateManager = vi.mocked(TemplateManager);
const MockBrandAssetManager = vi.mocked(BrandAssetManager);

describe('MFECTemplateService', () => {
  let service: MFECTemplateService;
  let mockTemplateManager: any;
  let mockBrandAssetManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock instances
    mockTemplateManager = {
      validateTemplateAssets: vi.fn(),
      loadTemplate: vi.fn(),
      getTemplatePath: vi.fn(),
      getBrandGuidelinePath: vi.fn(),
      clearCache: vi.fn()
    };
    
    mockBrandAssetManager = {
      getAllAssets: vi.fn(),
      getLogoAsset: vi.fn(),
      getTemplateAsset: vi.fn(),
      getBrandGuidelineAsset: vi.fn(),
      validateAsset: vi.fn(),
      getAssetSize: vi.fn(),
      getAssetBasePath: vi.fn(),
      clearCache: vi.fn()
    };

    // Mock constructors to return our mock instances
    MockTemplateManager.mockImplementation(() => mockTemplateManager);
    MockBrandAssetManager.mockImplementation(() => mockBrandAssetManager);

    service = new MFECTemplateService();
  });

  describe('initialize', () => {
    it('should initialize successfully with valid templates and assets', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        templateExists: true,
        assetsExist: true,
        brandGuidelineExists: true
      };

      mockTemplateManager.validateTemplateAssets.mockResolvedValue(mockValidation);
      mockBrandAssetManager.getAllAssets.mockResolvedValue([]);

      const result = await service.initialize();

      expect(result).toEqual(mockValidation);
      expect(mockTemplateManager.validateTemplateAssets).toHaveBeenCalled();
      expect(mockBrandAssetManager.getAllAssets).toHaveBeenCalled();
    });

    it('should throw TemplateError when validation fails', async () => {
      const mockValidation = {
        isValid: false,
        errors: ['Template file not found'],
        warnings: [],
        templateExists: false,
        assetsExist: true,
        brandGuidelineExists: true
      };

      mockTemplateManager.validateTemplateAssets.mockResolvedValue(mockValidation);

      await expect(service.initialize())
        .rejects.toThrow(TemplateError);
    });

    it('should throw TemplateError when asset loading fails', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        templateExists: true,
        assetsExist: true,
        brandGuidelineExists: true
      };

      mockTemplateManager.validateTemplateAssets.mockResolvedValue(mockValidation);
      mockBrandAssetManager.getAllAssets.mockRejectedValue(new Error('Asset loading failed'));

      await expect(service.initialize())
        .rejects.toThrow(TemplateError);
    });
  });

  describe('loadTemplate', () => {
    it('should load system manual template successfully', async () => {
      const mockTemplate = {
        templatePath: 'path/to/template.docx',
        brandGuidelinePath: 'path/to/guideline.pdf',
        logoAssets: {
          standard: 'path/to/standard.png',
          white: 'path/to/white.png',
          ai: 'path/to/ai.ai'
        },
        documentType: 'system_manual' as const,
        styleSettings: {} as any
      };

      mockTemplateManager.loadTemplate.mockResolvedValue(mockTemplate);

      const result = await service.loadTemplate('system_manual');

      expect(result).toEqual(mockTemplate);
      expect(mockTemplateManager.loadTemplate).toHaveBeenCalledWith('system_manual');
    });

    it('should throw TemplateError when template loading fails', async () => {
      mockTemplateManager.loadTemplate.mockRejectedValue(new Error('Template loading failed'));

      await expect(service.loadTemplate('user_manual'))
        .rejects.toThrow(TemplateError);
    });
  });

  describe('getBrandAssets', () => {
    it('should get all brand assets successfully', async () => {
      const mockAssets = [
        { name: 'Logo MFEC.png', path: 'path/to/logo.png', type: 'logo' as const, format: 'png' }
      ];

      mockBrandAssetManager.getAllAssets.mockResolvedValue(mockAssets);

      const result = await service.getBrandAssets();

      expect(result).toEqual(mockAssets);
      expect(mockBrandAssetManager.getAllAssets).toHaveBeenCalled();
    });

    it('should throw AssetError when asset loading fails', async () => {
      mockBrandAssetManager.getAllAssets.mockRejectedValue(new Error('Asset loading failed'));

      await expect(service.getBrandAssets())
        .rejects.toThrow(AssetError);
    });
  });

  describe('getLogoAsset', () => {
    it('should get specific logo asset successfully', async () => {
      const mockAsset = {
        name: 'Logo MFEC.png',
        path: 'path/to/logo.png',
        type: 'logo' as const,
        format: 'png'
      };

      mockBrandAssetManager.getLogoAsset.mockResolvedValue(mockAsset);

      const result = await service.getLogoAsset('standard');

      expect(result).toEqual(mockAsset);
      expect(mockBrandAssetManager.getLogoAsset).toHaveBeenCalledWith('standard');
    });

    it('should throw AssetError when logo asset loading fails', async () => {
      mockBrandAssetManager.getLogoAsset.mockRejectedValue(new Error('Logo not found'));

      await expect(service.getLogoAsset('standard'))
        .rejects.toThrow(AssetError);
    });
  });

  describe('getTemplateDocument', () => {
    it('should get template document successfully', async () => {
      const mockAsset = {
        name: 'template.docx',
        path: 'path/to/template.docx',
        type: 'template' as const,
        format: 'docx'
      };

      mockBrandAssetManager.getTemplateAsset.mockResolvedValue(mockAsset);

      const result = await service.getTemplateDocument();

      expect(result).toEqual(mockAsset);
      expect(mockBrandAssetManager.getTemplateAsset).toHaveBeenCalled();
    });
  });

  describe('getBrandGuideline', () => {
    it('should get brand guideline successfully', async () => {
      const mockAsset = {
        name: 'guideline.pdf',
        path: 'path/to/guideline.pdf',
        type: 'guideline' as const,
        format: 'pdf'
      };

      mockBrandAssetManager.getBrandGuidelineAsset.mockResolvedValue(mockAsset);

      const result = await service.getBrandGuideline();

      expect(result).toEqual(mockAsset);
      expect(mockBrandAssetManager.getBrandGuidelineAsset).toHaveBeenCalled();
    });
  });

  describe('validateSystem', () => {
    it('should validate system successfully', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        templateExists: true,
        assetsExist: true,
        brandGuidelineExists: true
      };

      mockTemplateManager.validateTemplateAssets.mockResolvedValue(mockValidation);
      mockBrandAssetManager.getLogoAsset.mockResolvedValue({} as any);

      const result = await service.validateSystem();

      expect(result.isValid).toBe(true);
      expect(mockBrandAssetManager.getLogoAsset).toHaveBeenCalledTimes(3); // standard, white, ai
    });

    it('should add warnings for missing logo assets', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        templateExists: true,
        assetsExist: true,
        brandGuidelineExists: true
      };

      mockTemplateManager.validateTemplateAssets.mockResolvedValue(mockValidation);
      mockBrandAssetManager.getLogoAsset.mockRejectedValue(new Error('Logo not found'));

      const result = await service.validateSystem();

      expect(result.warnings).toHaveLength(3); // One for each logo type
      expect(result.warnings[0]).toContain('Logo asset standard validation failed');
    });
  });

  describe('getTemplatePaths', () => {
    it('should return all template paths', () => {
      mockTemplateManager.getTemplatePath.mockReturnValue('path/to/template.docx');
      mockTemplateManager.getBrandGuidelinePath.mockReturnValue('path/to/guideline.pdf');
      mockBrandAssetManager.getAssetBasePath.mockReturnValue('path/to/assets');

      const paths = service.getTemplatePaths();

      expect(paths).toEqual({
        template: 'path/to/template.docx',
        brandGuideline: 'path/to/guideline.pdf',
        assetBase: 'path/to/assets'
      });
    });
  });

  describe('clearCaches', () => {
    it('should clear all caches', () => {
      service.clearCaches();

      expect(mockTemplateManager.clearCache).toHaveBeenCalled();
      expect(mockBrandAssetManager.clearCache).toHaveBeenCalled();
    });
  });

  describe('assetExists', () => {
    it('should check if asset exists', async () => {
      mockBrandAssetManager.validateAsset.mockResolvedValue(true);

      const exists = await service.assetExists('Logo MFEC.png');

      expect(exists).toBe(true);
      expect(mockBrandAssetManager.validateAsset).toHaveBeenCalledWith('Logo MFEC.png');
    });
  });

  describe('getAssetSize', () => {
    it('should get asset size', async () => {
      mockBrandAssetManager.getAssetSize.mockResolvedValue(1024);

      const size = await service.getAssetSize('Logo MFEC.png');

      expect(size).toBe(1024);
      expect(mockBrandAssetManager.getAssetSize).toHaveBeenCalledWith('Logo MFEC.png');
    });
  });

  describe('createTemplateConfiguration', () => {
    it('should create complete template configuration successfully', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        templateExists: true,
        assetsExist: true,
        brandGuidelineExists: true
      };

      const mockTemplate = {
        templatePath: 'path/to/template.docx',
        documentType: 'system_manual' as const
      } as any;

      const mockAssets = [
        { name: 'Logo MFEC.png', type: 'logo' as const }
      ] as any;

      mockTemplateManager.validateTemplateAssets.mockResolvedValue(mockValidation);
      mockBrandAssetManager.getLogoAsset.mockResolvedValue({} as any);
      mockTemplateManager.loadTemplate.mockResolvedValue(mockTemplate);
      mockBrandAssetManager.getAllAssets.mockResolvedValue(mockAssets);

      const result = await service.createTemplateConfiguration('system_manual');

      expect(result.template).toEqual(mockTemplate);
      expect(result.validation).toEqual(mockValidation);
      expect(result.assets).toEqual(mockAssets);
    });

    it('should throw TemplateError when validation fails', async () => {
      const mockValidation = {
        isValid: false,
        errors: ['Template not found'],
        warnings: [],
        templateExists: false,
        assetsExist: true,
        brandGuidelineExists: true
      };

      mockTemplateManager.validateTemplateAssets.mockResolvedValue(mockValidation);
      mockBrandAssetManager.getLogoAsset.mockResolvedValue({} as any);

      await expect(service.createTemplateConfiguration('system_manual'))
        .rejects.toThrow(TemplateError);
    });
  });
});