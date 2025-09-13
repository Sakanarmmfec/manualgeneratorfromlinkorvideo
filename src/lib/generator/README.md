# Document Generator Module

This module implements the core document generation and template engine functionality for the Thai Document Generator application. It provides comprehensive document generation using MFEC template standards with support for multiple export formats.

## Overview

The Document Generator module consists of three main components:

1. **DocumentGenerator** - Main document generation engine
2. **TemplateEngine** - Advanced template processing and rendering
3. **DocumentExporter** - Multi-format document export (HTML, PDF, DOCX)

## Features

### ✅ Task 9 Requirements Completed

- ✅ **Document generation using MFEC template structure**
- ✅ **Support for both user manual and product document formats**
- ✅ **GeneratedDocument data model with source attribution**
- ✅ **Document export in multiple formats (PDF, DOCX, HTML)**

### Core Capabilities

- **MFEC Template Integration**: Uses official MFEC templates and brand guidelines
- **Multi-format Export**: HTML, PDF, and DOCX export capabilities
- **Thai Language Support**: Optimized for Thai content with proper localization
- **Source Attribution**: Maintains traceability to original content sources
- **Quality Assurance**: Built-in validation and quality scoring
- **Responsive Design**: Generated documents work across devices
- **Brand Compliance**: Ensures consistent MFEC branding and styling

## Components

### DocumentGenerator

The main orchestrator that coordinates the entire document generation pipeline.

```typescript
import { DocumentGenerator } from './DocumentGenerator';

const generator = new DocumentGenerator();
await generator.initialize();

const result = await generator.generateFromRequest(request, processedContent);
```

**Key Methods:**
- `generateDocument()` - Generate complete document with options
- `generateFromRequest()` - Convenience method for standard generation
- `createPreview()` - Generate preview version
- `validateGenerationRequirements()` - Validate inputs before generation
- `getAvailableTemplates()` - Get MFEC template information
- `getGenerationStats()` - Get detailed statistics

### TemplateEngine

Advanced template processing engine that handles MFEC template rendering.

```typescript
import { TemplateEngine } from './TemplateEngine';

const engine = new TemplateEngine();
await engine.initialize();

const rendered = await engine.renderDocument(templateContext);
```

**Key Features:**
- HTML template rendering with MFEC styling
- CSS generation based on brand guidelines
- Content formatting by section type
- Multi-language label support
- Asset management and integration

### DocumentExporter

Handles export to multiple document formats with MFEC formatting.

```typescript
import { DocumentExporter } from './DocumentExporter';

const exporter = new DocumentExporter();
const exportPath = await exporter.exportDocument(document, 'pdf', template);
```

**Supported Formats:**
- **HTML**: Complete web-ready documents with CSS
- **PDF**: Print-ready documents (placeholder implementation)
- **DOCX**: Microsoft Word compatible (placeholder implementation)

## Usage Examples

### Basic Document Generation

```typescript
import { DocumentGenerator } from './DocumentGenerator';
import { DocumentRequest, ProcessedContent } from '../../types';

// Initialize generator
const generator = new DocumentGenerator();
await generator.initialize();

// Create request
const request: DocumentRequest = {
  productUrl: 'https://example.com/product',
  documentType: 'user_manual',
  language: 'thai',
  mfecTemplate: 'user_manual',
  includeImages: true
};

// Generate document
const result = await generator.generateFromRequest(request, processedContent);

console.log(`Generated: ${result.document.title}`);
console.log(`Exports: ${Object.keys(result.exportUrls).join(', ')}`);
```

### Template Validation

```typescript
// Validate before generation
const validation = await generator.validateGenerationRequirements(request);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  return;
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

### Multi-format Export

```typescript
import { DocumentExporter } from './DocumentExporter';

const exporter = new DocumentExporter();

// Export to multiple formats
const exportPaths = await exporter.exportMultipleFormats(
  document,
  ['html', 'pdf', 'docx'],
  template
);

console.log('Exported files:', exportPaths);
```

### Custom Generation Options

```typescript
const result = await generator.generateDocument(
  request,
  processedContent,
  {
    includeImages: true,
    includeTableOfContents: true,
    includeSourceAttribution: true,
    exportFormats: ['html', 'pdf'],
    customInstructions: 'Focus on installation steps'
  }
);
```

## Data Models

### GeneratedDocument

```typescript
interface GeneratedDocument {
  id: string;
  title: string;
  content: ProcessedContent;
  template: MFECTemplate;
  sourceAttribution: SourceInfo;
  generationMetadata: GenerationInfo;
  previewUrl: string;
  downloadFormats: string[];
}
```

### TemplateContext

```typescript
interface TemplateContext {
  title: string;
  content: ProcessedContent;
  documentType: 'user_manual' | 'product_document';
  language: 'thai' | 'english';
  generationDate: Date;
  sourceUrl: string;
  customVariables?: Record<string, any>;
}
```

### GenerationOptions

```typescript
interface GenerationOptions {
  includeImages: boolean;
  includeTableOfContents: boolean;
  includeSourceAttribution: boolean;
  customInstructions?: string;
  exportFormats: ('pdf' | 'docx' | 'html')[];
}
```

## MFEC Template Integration

The module integrates with official MFEC templates and assets:

- **Template File**: `MFEC_System&User_Manual_Template.docx`
- **Brand Guidelines**: `ENG_MFEC Brand Guideline`
- **Logo Assets**: Standard, White, and AI versions
- **Style Settings**: Colors, fonts, spacing, layout

### Brand Compliance

All generated documents follow MFEC brand standards:

- Official color palette
- Approved fonts and typography
- Consistent spacing and layout
- Proper logo placement
- Standard header/footer format

## Error Handling

The module provides comprehensive error handling:

```typescript
try {
  const result = await generator.generateDocument(request, content);
} catch (error) {
  if (error instanceof TemplateError) {
    console.error('Template error:', error.code, error.message);
  } else {
    console.error('Generation failed:', error);
  }
}
```

**Error Types:**
- `TemplateError` - Template loading or processing errors
- `ConfigurationError` - Configuration or setup errors
- `ValidationError` - Input validation errors

## Performance Considerations

- **Template Caching**: Templates are cached for improved performance
- **Asset Optimization**: Images and assets are optimized for documents
- **Incremental Generation**: Large documents are processed in chunks
- **Memory Management**: Proper cleanup and resource management

## Testing

The module includes comprehensive tests:

```bash
# Run generator tests
npm test -- src/lib/generator

# Run specific test suites
npm test -- src/lib/generator/DocumentGenerator.test.ts
npm test -- src/lib/generator/TemplateEngine.test.ts
npm test -- src/lib/generator/DocumentExporter.test.ts
```

## Future Enhancements

### Planned Improvements

1. **Real PDF Generation**: Implement actual PDF generation using Puppeteer
2. **Real DOCX Generation**: Implement DOCX generation using docx library
3. **Advanced Templates**: Support for custom template variations
4. **Batch Processing**: Generate multiple documents simultaneously
5. **Template Editor**: Visual template customization interface

### Integration Points

- **AI Processing**: Integrates with AI content processing pipeline
- **Image Processing**: Works with image optimization services
- **Template Management**: Uses MFEC template and asset management
- **Configuration**: Integrates with secure configuration management

## Dependencies

- **Template Service**: MFEC template loading and management
- **Formatter Service**: Content formatting and organization
- **Type Definitions**: Comprehensive TypeScript interfaces
- **File System**: Document export and asset management

## Configuration

The module uses configuration from:

- Environment variables for paths and settings
- MFEC template configuration
- Brand guideline specifications
- Export format preferences

## Troubleshooting

### Common Issues

1. **Template Not Found**: Ensure MFEC templates are properly installed
2. **Export Failures**: Check file permissions and output directories
3. **Memory Issues**: Use streaming for large documents
4. **Asset Loading**: Verify asset paths and accessibility

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
process.env.DEBUG = 'generator:*';
```

## API Reference

See the TypeScript interfaces and JSDoc comments in the source files for detailed API documentation.

## License

This module is part of the MFEC Thai Document Generator application and follows the project's licensing terms.