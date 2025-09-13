# Document Formatter Module

The Document Formatter module provides comprehensive document formatting capabilities following MFEC brand standards. It transforms raw content into professionally formatted documents with proper structure, styling, and Thai language support.

## Overview

This module consists of four main components:

1. **DocumentSection** - Data model and hierarchy management for document sections
2. **ContentOrganizer** - Intelligent content organization and section creation
3. **StyleApplicator** - MFEC brand-compliant styling and CSS generation
4. **MFECFormatter** - Main formatter that coordinates all components

## Features

- ✅ MFEC brand guideline compliance
- ✅ Thai language formatting support
- ✅ Intelligent content organization
- ✅ Hierarchical document structure
- ✅ Professional HTML/CSS generation
- ✅ Print-optimized styling
- ✅ Responsive design support
- ✅ Source attribution tracking
- ✅ Metadata calculation
- ✅ Table of contents generation

## Quick Start

```typescript
import { MFECFormatter } from '@/lib/formatter';

// Create formatter with options
const formatter = new MFECFormatter({
  documentType: 'user_manual',
  language: 'thai',
  includeTableOfContents: true,
  includeSourceAttribution: true
});

// Format content
const result = await formatter.formatDocument(
  rawContent,
  'Document Title',
  'https://source-url.com'
);

// Access formatted document
console.log(result.htmlContent); // Complete HTML document
console.log(result.cssStyles);   // CSS styles
console.log(result.sections);    // Structured sections
```

## Components

### DocumentSection

Manages document section data model and hierarchy:

```typescript
import { DocumentSectionManager, DocumentSection } from '@/lib/formatter';

// Create a section
const section = DocumentSectionManager.createSection(
  'Section Title',
  'Section content...',
  'introduction',
  1, // level
  0  // order
);

// Add subsection
const subsection = DocumentSectionManager.createSection(
  'Subsection Title',
  'Subsection content...',
  'usage',
  2,
  0
);

DocumentSectionManager.addSubsection(section, subsection);

// Validate hierarchy
const validation = DocumentSectionManager.validateHierarchy([section]);
console.log(validation.isValid); // true/false
```

### ContentOrganizer

Organizes raw content into structured sections:

```typescript
import { ContentOrganizer } from '@/lib/formatter';

const organizer = new ContentOrganizer({
  maxSectionLength: 1000,
  requireIntroduction: true,
  imageDistribution: 'content-based'
});

const sections = organizer.organizeContent(
  rawContent,
  'user_manual', // or 'product_document'
  images // optional image array
);
```

### StyleApplicator

Applies MFEC brand styling:

```typescript
import { StyleApplicator } from '@/lib/formatter';

const styleApplicator = new StyleApplicator();

// Generate CSS
const documentCSS = styleApplicator.generateDocumentStyles();
const printCSS = styleApplicator.generatePrintStyles();

// Get element styles
const headerStyles = styleApplicator.getElementStyles('header');

// Apply inline styles
const styledHTML = styleApplicator.applyInlineStyles(htmlContent);
```

### MFECFormatter

Main formatter class:

```typescript
import { MFECFormatter, FormattingOptions } from '@/lib/formatter';

const options: FormattingOptions = {
  documentType: 'user_manual', // or 'product_document'
  language: 'thai', // or 'english'
  includeTableOfContents: true,
  includeSourceAttribution: true,
  applyMFECBranding: true,
  organizationRules: {
    maxSectionLength: 1000,
    requireIntroduction: true
  },
  customStyles: {
    colors: { primary: '#0066CC' }
  }
};

const formatter = new MFECFormatter(options);
```

## Document Types

### User Manual
- Introduction
- Requirements
- Installation
- Configuration
- Usage
- Troubleshooting
- Maintenance

### Product Document
- Introduction
- Features
- Specifications
- Requirements
- Usage
- Troubleshooting

## Language Support

### Thai Language Features
- Proper Thai font selection (Sarabun, Prompt, Noto Sans Thai)
- Thai punctuation spacing
- Line break optimization for Thai text
- Thai language labels and UI text

### English Language Features
- Standard English typography
- Professional document formatting
- English language labels and UI text

## MFEC Brand Compliance

### Colors
- Primary: #0066CC (MFEC Blue)
- Secondary: #FF6B35 (MFEC Orange)
- Accent: #00A86B (MFEC Green)

### Typography
- Primary Font: Sarabun (Thai), Arial (fallback)
- Heading Font: Prompt (Thai), Arial (fallback)
- Code Font: Fira Code, SF Mono, Consolas

### Layout
- Maximum width: 1200px
- Container width: 800px
- Responsive design breakpoints
- Print-optimized layouts

## Content Organization

### Automatic Section Detection
- Heading-based section creation
- Content type recognition (lists, code, tables)
- Intelligent section type assignment
- Subsection hierarchy management

### Image Distribution
- **Even**: Distribute images evenly across sections
- **Content-based**: Match images to relevant content
- **Manual**: Use pre-assigned image placements

### Content Parsing
- Markdown-style headings (#, ##, ###)
- Lists (-, *, +, numbered)
- Code blocks (```)
- Tables and structured data

## Styling Features

### Document Styles
- Professional typography
- Consistent spacing and margins
- MFEC brand colors
- Responsive layout

### Print Styles
- A4 page optimization
- Page break management
- Print-friendly fonts and sizes
- Proper margins and spacing

### Element Styles
- Headers and footers
- Sidebars and callouts
- Tables and lists
- Images and captions

## Metadata and Attribution

### Generated Metadata
```typescript
interface DocumentMetadata {
  wordCount: number;
  sectionCount: number;
  imageCount: number;
  generatedAt: Date;
  documentType: string;
  language: string;
}
```

### Source Attribution
```typescript
interface SourceAttribution {
  originalUrl: string;
  extractedAt: Date;
  processedBy: string;
  documentVersion: string;
}
```

## Testing

The module includes comprehensive tests:

```bash
# Run all formatter tests
npm test src/lib/formatter

# Run specific test files
npm test DocumentSection.test.ts
npm test ContentOrganizer.test.ts
npm test StyleApplicator.test.ts
npm test MFECFormatter.test.ts
npm test integration.test.ts
```

## Examples

### Basic Usage

```typescript
import { MFECFormatter } from '@/lib/formatter';

const formatter = new MFECFormatter();

const content = `
# การแนะนำ
นี่คือคู่มือการใช้งาน

# คุณสมบัติ
- คุณสมบัติที่ 1
- คุณสมบัติที่ 2

# การใช้งาน
วิธีการใช้งานระบบ
`;

const result = await formatter.formatDocument(
  content,
  'คู่มือการใช้งาน',
  'https://example.com'
);
```

### Advanced Configuration

```typescript
const formatter = new MFECFormatter({
  documentType: 'product_document',
  language: 'english',
  includeTableOfContents: true,
  organizationRules: {
    maxSectionLength: 800,
    requireIntroduction: false,
    imageDistribution: 'content-based'
  },
  customStyles: {
    colors: {
      primary: '#0066CC',
      secondary: '#FF6B35'
    },
    fonts: {
      primaryFont: 'Sarabun, Arial, sans-serif',
      headingFont: 'Prompt, Arial, sans-serif'
    }
  }
});
```

### Working with Sections

```typescript
import { DocumentSectionManager } from '@/lib/formatter';

// Create and manage sections
const section = DocumentSectionManager.createSection(
  'Installation Guide',
  'Step-by-step installation instructions...',
  'installation'
);

// Add images
section.images.push({
  id: 'install-screenshot',
  imageUrl: '/images/install.png',
  caption: 'Installation wizard screenshot',
  position: 'after',
  alignment: 'center'
});

// Validate structure
const validation = DocumentSectionManager.validateHierarchy([section]);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

## Integration with Other Modules

### With Content Extraction
```typescript
import { ContentExtractor } from '@/lib/content';
import { MFECFormatter } from '@/lib/formatter';

const extractor = new ContentExtractor();
const formatter = new MFECFormatter();

const extractedContent = await extractor.extractFromUrl(url);
const formattedDoc = await formatter.formatDocument(
  extractedContent.content,
  extractedContent.title,
  url
);
```

### With Template System
```typescript
import { MFECTemplateService } from '@/lib/template';
import { MFECFormatter } from '@/lib/formatter';

const templateService = new MFECTemplateService();
const formatter = new MFECFormatter();

const template = await templateService.loadTemplate('user_manual');
const formattedDoc = await formatter.formatDocument(content, title, url);

// Apply template to formatted document
const finalDoc = await templateService.applyTemplate(template, formattedDoc);
```

## Performance Considerations

- Efficient content parsing with minimal regex operations
- Lazy loading of style generation
- Optimized DOM manipulation for large documents
- Memory-efficient section hierarchy management
- Caching of computed styles and layouts

## Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- CSS Grid and Flexbox support required
- Print media query support
- Web fonts loading support

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Proper heading hierarchy

## Future Enhancements

- [ ] PDF export functionality
- [ ] Advanced table formatting
- [ ] Interactive elements support
- [ ] Multi-column layouts
- [ ] Advanced image positioning
- [ ] Custom theme support
- [ ] Collaborative editing features
- [ ] Version control integration