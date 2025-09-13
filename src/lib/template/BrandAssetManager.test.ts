import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { BrandAssetManager } from './BrandAssetManager';
import { AssetError } from '../../types';

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

describe('BrandAssetManager', () => {
  let brandAssetManager: BrandAssetManager;

  beforeEach(() => {
    brandAssetManager = new BrandAssetManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    brandAssetManager.clearCache();
  });

  describe('getAllAssets', () => {
    it('should load all brand assets successfully', async () => {
      const mockFiles = [
        'Logo MFEC.png',
        'Logo MFEC White.png',
        'Logo MFEC More. 2023ai.ai',
        'MFEC_System&User_Manual_Template.docx',
        'ENG_MFEC Brand Guideline as of 11 Sep 23.pdf'
      ];

      mockFs.readdir.mockResolvedValue(mockFiles as any);
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01')
      });

      const assets = await brandAssetManager.getAllAssets();

      expect(assets).toHaveLength(5);
      expect(assets.map(a => a.name)).toEqual(mockFiles);
      expect(assets.find(a => a.name === 'Logo MFEC.png')?.type).toBe('logo');
      expect(assets.find(a => a.name === 'MFEC_System&User_Manual_Template.docx')?.type).toBe('template');
      expect(assets.find(a => a.name.includes('Brand Guideline'))?.type).toBe('guideline');
    });

    it('should throw AssetError when directory cannot be read', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));

      await expect(brandAssetManager.getAllAssets())
        .rejects.toThrow(AssetError);
    });

    it('should skip non-file entries', async () => {
      const mockFiles = ['Logo MFEC.png', 'subdirectory'];

      mockFs.readdir.mockResolvedValue(mockFiles as any);
      mockFs.stat.mockImplementation((path) => {
        if (path.toString().includes('subdirectory')) {
          return Promise.resolve({
            isFile: () => false,
            size: 0,
            mtime: new Date()
          });
        }
        return Promise.resolve({
          isFile: () => true,
          size: 1024,
          mtime: new Date('2023-01-01')
        });
      });

      const assets = await brandAssetManager.getAllAssets();

      expect(assets).toHaveLength(1);
      expect(assets[0].name).toBe('Logo MFEC.png');
    });
  });

  describe('getLogoAsset', () => {
    beforeEach(() => {
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01')
      });
    });

    it('should get standard logo asset', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const asset = await brandAssetManager.getLogoAsset('standard');

      expect(asset.name).toBe('Logo MFEC.png');
      expect(asset.type).toBe('logo');
      expect(asset.format).toBe('png');
    });

    it('should get white logo asset', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const asset = await brandAssetManager.getLogoAsset('white');

      expect(asset.name).toBe('Logo MFEC White.png');
      expect(asset.type).toBe('logo');
    });

    it('should get AI logo asset', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const asset = await brandAssetManager.getLogoAsset('ai');

      expect(asset.name).toBe('Logo MFEC More. 2023ai.ai');
      expect(asset.type).toBe('logo');
      expect(asset.format).toBe('ai');
    });

    it('should use cached asset on second request', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const asset1 = await brandAssetManager.getLogoAsset('standard');
      const asset2 = await brandAssetManager.getLogoAsset('standard');

      expect(asset1).toBe(asset2); // Should be same object from cache
      expect(mockFs.access).toHaveBeenCalledTimes(1);
    });

    it('should throw AssetError when logo not found', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));

      await expect(brandAssetManager.getLogoAsset('standard'))
        .rejects.toThrow(AssetError);
    });
  });

  describe('getTemplateAsset', () => {
    it('should get template document asset', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: 2048,
        mtime: new Date('2023-01-01')
      });

      const asset = await brandAssetManager.getTemplateAsset();

      expect(asset.name).toBe('MFEC_System&User_Manual_Template.docx');
      expect(asset.type).toBe('template');
      expect(asset.format).toBe('docx');
      expect(asset.size).toBe(2048);
    });

    it('should throw AssetError when template not found', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));

      await expect(brandAssetManager.getTemplateAsset())
        .rejects.toThrow(AssetError);
    });
  });

  describe('getBrandGuidelineAsset', () => {
    it('should get brand guideline asset', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: 5120,
        mtime: new Date('2023-01-01')
      });

      const asset = await brandAssetManager.getBrandGuidelineAsset();

      expect(asset.name).toBe('ENG_MFEC Brand Guideline as of 11 Sep 23.pdf');
      expect(asset.type).toBe('guideline');
      expect(asset.format).toBe('pdf');
    });

    it('should throw AssetError when guideline not found', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));

      await expect(brandAssetManager.getBrandGuidelineAsset())
        .rejects.toThrow(AssetError);
    });
  });

  describe('validateAsset', () => {
    it('should return true for existing asset', async () => {
      mockFs.access.mockResolvedValue(undefined);

      const exists = await brandAssetManager.validateAsset('Logo MFEC.png');

      expect(exists).toBe(true);
    });

    it('should return false for non-existing asset', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));

      const exists = await brandAssetManager.validateAsset('NonExistent.png');

      expect(exists).toBe(false);
    });
  });

  describe('getAssetPath', () => {
    it('should return correct asset path', () => {
      const path = brandAssetManager.getAssetPath('Logo MFEC.png');
      expect(path).toContain('.qodo/Template/Logo MFEC.png');
    });
  });

  describe('getAssetBasePath', () => {
    it('should return correct base path', () => {
      const path = brandAssetManager.getAssetBasePath();
      expect(path).toBe('.qodo/Template');
    });
  });

  describe('getAssetSize', () => {
    it('should return asset file size', async () => {
      mockFs.stat.mockResolvedValue({
        size: 1024
      });

      const size = await brandAssetManager.getAssetSize('Logo MFEC.png');

      expect(size).toBe(1024);
    });

    it('should throw AssetError when stat fails', async () => {
      mockFs.stat.mockRejectedValue(new Error('File not found'));

      await expect(brandAssetManager.getAssetSize('NonExistent.png'))
        .rejects.toThrow(AssetError);
    });
  });

  describe('clearCache', () => {
    it('should clear asset cache', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01')
      });

      // Load asset to populate cache
      await brandAssetManager.getLogoAsset('standard');
      
      // Clear cache
      brandAssetManager.clearCache();
      
      // Load again - should call access again
      await brandAssetManager.getLogoAsset('standard');
      
      expect(mockFs.access).toHaveBeenCalledTimes(2);
    });
  });
});