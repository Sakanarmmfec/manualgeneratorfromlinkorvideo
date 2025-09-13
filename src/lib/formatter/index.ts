/**
 * Document Formatter Module
 * Exports all formatter components for MFEC document generation
 */

// Export classes and functions
export { DocumentSectionManager } from './DocumentSection';
export { ContentOrganizer } from './ContentOrganizer';
export { StyleApplicator } from './StyleApplicator';
export { MFECFormatter } from './MFECFormatter';

// Export types
export type { DocumentSection, ImagePlacement, SectionType } from './DocumentSection';
export type { ContentBlock, OrganizationRules } from './ContentOrganizer';
export type { 
  FontSettings, 
  SpacingSettings, 
  ColorSettings, 
  MFECStyleSettings,
  StyleRule 
} from './StyleApplicator';
export type { 
  FormattingOptions, 
  SourceAttribution, 
  FormattedDocument 
} from './MFECFormatter';

// Re-export commonly used types
export type { DocumentSection as IDocumentSection } from './DocumentSection';
export type { FormattedDocument as IFormattedDocument } from './MFECFormatter';