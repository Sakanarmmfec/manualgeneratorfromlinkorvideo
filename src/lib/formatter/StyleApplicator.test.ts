/**
 * Tests for StyleApplicator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StyleApplicator, MFECStyleSettings } from './StyleApplicator';

describe('StyleApplicator', () => {
  let styleApplicator: StyleApplicator;

  beforeEach(() => {
    styleApplicator = new StyleApplicator();
  });

  describe('generateDocumentStyles', () => {
    it('should generate valid CSS styles', () => {
      const css = styleApplicator.generateDocumentStyles();

      expect(css).toContain('body {');
      expect(css).toContain('font-family:');
      expect(css).toContain('h1 {');
      expect(css).toContain('h2 {');
      expect(css).toContain('.document-container {');
    });

    it('should include MFEC brand colors', () => {
      const css = styleApplicator.generateDocumentStyles();

      expect(css).toContain('#0066CC'); // MFEC Blue
      expect(css).toContain('#FF6B35'); // MFEC Orange
      expect(css).toContain('#00A86B'); // MFEC Green
    });

    it('should include Thai font families', () => {
      const css = styleApplicator.generateDocumentStyles();

      expect(css).toContain('Sarabun');
      expect(css).toContain('Noto Sans Thai');
      expect(css).toContain('Prompt');
    });

    it('should include proper spacing and layout', () => {
      const css = styleApplicator.generateDocumentStyles();

      expect(css).toContain('line-height:');
      expect(css).toContain('margin:');
      expect(css).toContain('padding:');
      expect(css).toContain('max-width:');
    });
  });

  describe('generatePrintStyles', () => {
    it('should generate print-specific CSS', () => {
      const printCSS = styleApplicator.generatePrintStyles();

      expect(printCSS).toContain('@page');
      expect(printCSS).toContain('@media print');
      expect(printCSS).toContain('page-break');
      expect(printCSS).toContain('size: A4');
    });

    it('should include print-optimized font sizes', () => {
      const printCSS = styleApplicator.generatePrintStyles();

      expect(printCSS).toContain('12pt');
      expect(printCSS).toContain('18pt');
    });

    it('should prevent page breaks in inappropriate places', () => {
      const printCSS = styleApplicator.generatePrintStyles();

      expect(printCSS).toContain('page-break-after: avoid');
      expect(printCSS).toContain('page-break-inside: avoid');
    });
  });

  describe('applyInlineStyles', () => {
    it('should add inline styles to HTML elements', () => {
      const html = '<h1>Title</h1><p>Content</p>';
      const styledHTML = styleApplicator.applyInlineStyles(html);

      expect(styledHTML).toContain('<h1 style=');
      expect(styledHTML).toContain('<p style=');
      expect(styledHTML).toContain('font-family:');
      expect(styledHTML).toContain('font-size:');
    });

    it('should not override existing inline styles', () => {
      const html = '<h1 style="color: red;">Title</h1>';
      const styledHTML = styleApplicator.applyInlineStyles(html);

      // Should not add style attribute if one already exists
      expect(styledHTML).toBe(html);
    });

    it('should handle body tag styling', () => {
      const html = '<body><h1>Title</h1></body>';
      const styledHTML = styleApplicator.applyInlineStyles(html);

      expect(styledHTML).toContain('<body style=');
      expect(styledHTML).toContain('Sarabun');
    });
  });

  describe('getElementStyles', () => {
    it('should return header styles', () => {
      const headerStyles = styleApplicator.getElementStyles('header');

      expect(headerStyles).toHaveProperty('backgroundColor');
      expect(headerStyles).toHaveProperty('color');
      expect(headerStyles).toHaveProperty('padding');
      expect(headerStyles.backgroundColor).toBe('#0066CC');
    });

    it('should return footer styles', () => {
      const footerStyles = styleApplicator.getElementStyles('footer');

      expect(footerStyles).toHaveProperty('backgroundColor');
      expect(footerStyles).toHaveProperty('borderTop');
      expect(footerStyles).toHaveProperty('textAlign');
    });

    it('should return sidebar styles', () => {
      const sidebarStyles = styleApplicator.getElementStyles('sidebar');

      expect(sidebarStyles).toHaveProperty('backgroundColor');
      expect(sidebarStyles).toHaveProperty('borderLeft');
      expect(sidebarStyles).toHaveProperty('padding');
    });

    it('should return callout styles', () => {
      const calloutStyles = styleApplicator.getElementStyles('callout');

      expect(calloutStyles).toHaveProperty('backgroundColor');
      expect(calloutStyles).toHaveProperty('border');
      expect(calloutStyles).toHaveProperty('borderRadius');
    });

    it('should return empty object for unknown elements', () => {
      const unknownStyles = styleApplicator.getElementStyles('unknown');
      expect(unknownStyles).toEqual({});
    });
  });

  describe('updateStyles', () => {
    it('should update font settings', () => {
      const newFontSettings = {
        fonts: {
          primaryFont: 'Custom Font, Arial, sans-serif',
          sizes: { body: 18 }
        }
      };

      styleApplicator.updateStyles(newFontSettings as Partial<MFECStyleSettings>);
      const css = styleApplicator.generateDocumentStyles();

      expect(css).toContain('Custom Font');
      expect(css).toContain('18px');
    });

    it('should update color settings', () => {
      const newColorSettings = {
        colors: {
          primary: '#FF0000',
          text: { primary: '#333333' }
        }
      };

      styleApplicator.updateStyles(newColorSettings as Partial<MFECStyleSettings>);
      const css = styleApplicator.generateDocumentStyles();

      expect(css).toContain('#FF0000');
      expect(css).toContain('#333333');
    });

    it('should update spacing settings', () => {
      const newSpacingSettings = {
        spacing: {
          margins: { section: 50 },
          lineHeight: { normal: 2.0 }
        }
      };

      styleApplicator.updateStyles(newSpacingSettings as Partial<MFECStyleSettings>);
      const css = styleApplicator.generateDocumentStyles();

      expect(css).toContain('50px');
      expect(css).toContain('line-height: 2');
    });
  });

  describe('getStyles', () => {
    it('should return current style settings', () => {
      const styles = styleApplicator.getStyles();

      expect(styles).toHaveProperty('fonts');
      expect(styles).toHaveProperty('colors');
      expect(styles).toHaveProperty('spacing');
      expect(styles).toHaveProperty('layout');
    });

    it('should return a copy of styles (not reference)', () => {
      const styles1 = styleApplicator.getStyles();
      const styles2 = styleApplicator.getStyles();

      expect(styles1).not.toBe(styles2);
      expect(styles1).toEqual(styles2);
    });
  });

  describe('CSS generation utilities', () => {
    it('should convert camelCase to kebab-case', () => {
      const css = styleApplicator.generateDocumentStyles();

      // Should convert backgroundColor to background-color
      expect(css).toContain('background-color:');
      expect(css).not.toContain('backgroundColor:');

      // Should convert fontSize to font-size
      expect(css).toContain('font-size:');
      expect(css).not.toContain('fontSize:');
    });

    it('should add px units to numeric values appropriately', () => {
      const css = styleApplicator.generateDocumentStyles();

      // Should add px to size values
      expect(css).toMatch(/font-size:\s*\d+px/);
      expect(css).toMatch(/margin:\s*\d+px/);

      // Should not add px to unitless values like font-weight
      expect(css).toMatch(/font-weight:\s*\d+;/);
      expect(css).not.toMatch(/font-weight:\s*\d+px/);
    });

    it('should handle media queries correctly', () => {
      const printCSS = styleApplicator.generatePrintStyles();

      expect(printCSS).toContain('@media print {');
      expect(printCSS).toContain('}');
    });
  });

  describe('MFEC brand compliance', () => {
    it('should use official MFEC colors', () => {
      const styles = styleApplicator.getStyles();

      expect(styles.colors.primary).toBe('#0066CC');
      expect(styles.colors.secondary).toBe('#FF6B35');
      expect(styles.colors.accent).toBe('#00A86B');
    });

    it('should use Thai-compatible fonts', () => {
      const styles = styleApplicator.getStyles();

      expect(styles.fonts.primaryFont).toContain('Sarabun');
      expect(styles.fonts.primaryFont).toContain('Noto Sans Thai');
      expect(styles.fonts.headingFont).toContain('Prompt');
    });

    it('should use appropriate layout dimensions', () => {
      const styles = styleApplicator.getStyles();

      expect(styles.layout.maxWidth).toBe(1200);
      expect(styles.layout.containerWidth).toBe(800);
      expect(styles.layout.sidebarWidth).toBe(300);
    });
  });
});