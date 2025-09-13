// MFEC Template and Asset Management System
// Provides unified interface for managing MFEC templates, brand assets, and styling

export { TemplateManager } from './TemplateManager';
export { BrandAssetManager } from './BrandAssetManager';
export { MFECTemplateService } from './MFECTemplateService';

// Re-export relevant types for convenience
export type {
  MFECTemplate,
  BrandStyleSettings,
  FontSettings,
  SpacingSettings,
  HeaderFooterConfig,
  LogoPlacementConfig,
  TemplateValidationResult,
  BrandAsset,
  TemplateError,
  AssetError
} from '../../types';