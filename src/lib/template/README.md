# MFEC Template and Asset Management System

This module provides a comprehensive system for managing MFEC document templates, brand assets, and styling guidelines. It handles loading, validation, and access to MFEC brand resources for the Thai Document Generator.

## Overview

The template management system consists of three main components:

1. **TemplateManager** - Manages MFEC document templates and styling
2. **BrandAssetManager** - Handles MFEC brand assets (logos, guidelines)
3. **MFECTemplateService** - Unified service interface combining both managers

## Components

### TemplateManager

Handles loading and managing MFEC document templates with brand-compliant styling.

```typescript
import { TemplateManager } from './TemplateManager';

const templateManager = new TemplateManager();

// Load template for specific document type
const template = await templateManager.loadTemplate('system_manual');

// Validate all template assets
const validation = await templateManager.validateTemplateAssets();

// Get template file paths
const templatePath = templateManager.getTemplatePath();
const guidelinePath = templateManager.getBrandGuidelinePath();
```

### BrandAssetManager

Manages MFEC brand assets including logos and brand guidelines.

```typescript
import { BrandAssetManager } from './BrandAssetManager';

const assetManager = new BrandAssetManager();

// Get all available assets
const assets = await assetManager.getAllAssets();

// Get specific logo asset
const standardLogo = await assetManager.getLogoAsset('standard');
const whiteLogo = await assetManager.getLogoAsset('white');
const aiLogo = await assetManager.getLogoAsset('ai');

// Get template document
const templateDoc = await assetManager.getTemplateAsset();

// Get brand guideline
const guideline = await assetManager.getBrandGuidelineAsset();
```

### MFECTemplateService

Unified service interface that combines both managers for easy use.

```typescript
import { MFECTemplateService } from './MFECTemplateService';

const templateService = new MFECTemplateService();

// Initialize and validate the system
const validation = await templateService.initialize();

// Create complete template configuration
const config = await templateService.createTemplateConfiguration('user_manual');

// Get template and assets
const template = await templateService.loadTemplate('system_manual');
const assets = await templateService.getBrandAssets();
const logo = await templateService.getLogoAsset('standard');
```

## Asset Structure

The system expects MFEC assets to be located in `.qodo/Template/` directory:

```
.qodo/Template/
├── MFEC_System&User_Manual_Template.docx    # Main template document
├── ENG_MFEC Brand Guideline as of 11 Sep 23.pdf  # Brand guidelines
├── Logo MFEC.png                            # Standard logo
├── Logo MFEC White.png                      # White logo variant
└── Logo MFEC More. 2023ai.ai                # AI logo variant
```

## Template Types

### System Manual Template
- Uses AI logo variant for document branding
- Optimized for technical system documentation
- Includes comprehensive styling for technical content

### User Manual Template  
- Uses standard logo for document branding
- Optimized for end-user documentation
- Includes user-friendly styling and layout

## Brand Style Settings

The system provides comprehensive brand-compliant styling:

```typescript
interface BrandStyleSettings {
  primaryColors: string[];        // MFEC blue palette
  fonts: FontSettings;           // Tahoma-based font hierarchy
  spacing: SpacingSettings;      // Standard margins and padding
  headerFooterSettings: HeaderFooterConfig;  // Header/footer layout
  logoPlacement: LogoPlacementConfig;        // Logo positioning
}
```

### Default Style Configuration

- **Primary Font**: Tahoma
- **Color Palette**: MFEC blue variants (#0066CC, #003366, #666666)
- **Margins**: 2.5cm on all sides
- **Line Height**: 1.15
- **Header/Footer**: Included with logo positioning

## Error Handling

The system provides comprehensive error handling with specific error types:

- **TemplateError** - Template loading and validation errors
- **AssetError** - Asset access and management errors

```typescript
try {
  const template = await templateService.loadTemplate('system_manual');
} catch (error) {
  if (error instanceof TemplateError) {
    console.error('Template error:', error.message, error.code);
  } else if (error instanceof AssetError) {
    console.error('Asset error:', error.message, error.code);
  }
}
```

## Validation

The system provides comprehensive validation for all assets:

```typescript
const validation = await templateService.validateSystem();

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Validation warnings:', validation.warnings);
}

// Check individual components
console.log('Template exists:', validation.templateExists);
console.log('Assets exist:', validation.assetsExist);
console.log('Brand guideline exists:', validation.brandGuidelineExists);
```

## Caching

The system implements intelligent caching for performance:

- Templates are cached by document type
- Assets are cached by name and type
- Cache can be cleared manually when needed

```typescript
// Clear all caches
templateService.clearCaches();

// Clear individual caches
templateManager.clearCache();
assetManager.clearCache();
```

## Usage Examples

### Basic Template Loading

```typescript
import { MFECTemplateService } from './template';

const service = new MFECTemplateService();

// Initialize system
await service.initialize();

// Load user manual template
const template = await service.loadTemplate('user_manual');

console.log('Template path:', template.templatePath);
console.log('Logo assets:', template.logoAssets);
console.log('Style settings:', template.styleSettings);
```

### Asset Management

```typescript
// Get all available assets
const assets = await service.getBrandAssets();

// Filter by type
const logos = assets.filter(asset => asset.type === 'logo');
const templates = assets.filter(asset => asset.type === 'template');
const guidelines = assets.filter(asset => asset.type === 'guideline');

// Check asset existence
const logoExists = await service.assetExists('Logo MFEC.png');
const logoSize = await service.getAssetSize('Logo MFEC.png');
```

### Complete Configuration

```typescript
// Create complete template configuration
const config = await service.createTemplateConfiguration('system_manual');

const {
  template,      // MFECTemplate with all settings
  validation,    // Validation results
  assets        // Available brand assets
} = config;

// Use template for document generation
console.log('Document type:', template.documentType);
console.log('Style settings:', template.styleSettings);
console.log('Available assets:', assets.length);
```

## Integration

This template system integrates with other parts of the Thai Document Generator:

- **Document Generation**: Provides templates and styling for document creation
- **Content Processing**: Supplies brand guidelines for content formatting
- **UI Components**: Provides asset paths for logo display
- **Configuration**: Validates template availability during system setup

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **3.1**: MFEC format standards and brand consistency
- **3.2**: Template hierarchy and styling
- **3.4**: MFEC branding and visual elements
- **8.2**: Source attribution and professional presentation

## Testing

The system includes comprehensive testing:

- **Unit Tests**: Individual component testing (with mocks)
- **Integration Tests**: End-to-end system validation
- **Type Safety**: TypeScript type enforcement

Run tests:
```bash
npm test -- src/lib/template --run
```

## Future Enhancements

Potential future improvements:

1. **Dynamic Template Loading**: Support for multiple template versions
2. **Custom Styling**: User-configurable style overrides
3. **Asset Optimization**: Automatic image optimization for different formats
4. **Template Validation**: Advanced template structure validation
5. **Brand Compliance**: Automated brand guideline compliance checking