/**
 * StyleApplicator for fonts, spacing, and visual elements
 * Applies MFEC brand guidelines to document formatting
 */

export interface FontSettings {
  primaryFont: string;
  secondaryFont: string;
  headingFont: string;
  codeFont: string;
  sizes: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    body: number;
    caption: number;
  };
  weights: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
}

export interface SpacingSettings {
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  margins: {
    section: number;
    paragraph: number;
    list: number;
    image: number;
  };
  padding: {
    container: number;
    content: number;
    sidebar: number;
  };
}

export interface ColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  background: {
    primary: string;
    secondary: string;
    accent: string;
  };
  border: {
    light: string;
    medium: string;
    dark: string;
  };
}

export interface MFECStyleSettings {
  fonts: FontSettings;
  spacing: SpacingSettings;
  colors: ColorSettings;
  layout: {
    maxWidth: number;
    containerWidth: number;
    sidebarWidth: number;
  };
}

export interface StyleRule {
  selector: string;
  properties: Record<string, string | number>;
  mediaQuery?: string;
}

export class StyleApplicator {
  private mfecStyles: MFECStyleSettings;

  constructor() {
    this.mfecStyles = this.getDefaultMFECStyles();
  }

  /**
   * Gets default MFEC style settings based on brand guidelines
   */
  private getDefaultMFECStyles(): MFECStyleSettings {
    return {
      fonts: {
        primaryFont: 'Sarabun, "Noto Sans Thai", Arial, sans-serif',
        secondaryFont: 'Prompt, "Noto Sans Thai", Arial, sans-serif',
        headingFont: 'Prompt, "Noto Sans Thai", Arial, sans-serif',
        codeFont: 'Fira Code, "SF Mono", Consolas, monospace',
        sizes: {
          h1: 32,
          h2: 24,
          h3: 20,
          h4: 18,
          body: 16,
          caption: 14
        },
        weights: {
          light: 300,
          regular: 400,
          medium: 500,
          bold: 700
        }
      },
      spacing: {
        lineHeight: {
          tight: 1.2,
          normal: 1.5,
          relaxed: 1.8
        },
        margins: {
          section: 32,
          paragraph: 16,
          list: 12,
          image: 20
        },
        padding: {
          container: 24,
          content: 16,
          sidebar: 12
        }
      },
      colors: {
        primary: '#0066CC', // MFEC Blue
        secondary: '#FF6B35', // MFEC Orange
        accent: '#00A86B', // MFEC Green
        text: {
          primary: '#1A1A1A',
          secondary: '#4A4A4A',
          muted: '#8A8A8A'
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#F8F9FA',
          accent: '#E8F4FD'
        },
        border: {
          light: '#E5E5E5',
          medium: '#CCCCCC',
          dark: '#999999'
        }
      },
      layout: {
        maxWidth: 1200,
        containerWidth: 800,
        sidebarWidth: 300
      }
    };
  }

  /**
   * Generates CSS styles for document formatting
   */
  generateDocumentStyles(): string {
    const rules: StyleRule[] = [
      // Base styles
      {
        selector: 'body',
        properties: {
          fontFamily: this.mfecStyles.fonts.primaryFont,
          fontSize: `${this.mfecStyles.fonts.sizes.body}px`,
          lineHeight: this.mfecStyles.spacing.lineHeight.normal,
          color: this.mfecStyles.colors.text.primary,
          backgroundColor: this.mfecStyles.colors.background.primary,
          margin: 0,
          padding: 0
        }
      },
      
      // Container styles
      {
        selector: '.document-container',
        properties: {
          maxWidth: `${this.mfecStyles.layout.containerWidth}px`,
          margin: '0 auto',
          padding: `${this.mfecStyles.spacing.padding.container}px`,
          backgroundColor: this.mfecStyles.colors.background.primary
        }
      },

      // Heading styles
      {
        selector: 'h1',
        properties: {
          fontFamily: this.mfecStyles.fonts.headingFont,
          fontSize: `${this.mfecStyles.fonts.sizes.h1}px`,
          fontWeight: this.mfecStyles.fonts.weights.bold,
          color: this.mfecStyles.colors.primary,
          marginTop: `${this.mfecStyles.spacing.margins.section}px`,
          marginBottom: `${this.mfecStyles.spacing.margins.paragraph}px`,
          lineHeight: this.mfecStyles.spacing.lineHeight.tight
        }
      },

      {
        selector: 'h2',
        properties: {
          fontFamily: this.mfecStyles.fonts.headingFont,
          fontSize: `${this.mfecStyles.fonts.sizes.h2}px`,
          fontWeight: this.mfecStyles.fonts.weights.medium,
          color: this.mfecStyles.colors.primary,
          marginTop: `${this.mfecStyles.spacing.margins.section * 0.75}px`,
          marginBottom: `${this.mfecStyles.spacing.margins.paragraph}px`,
          lineHeight: this.mfecStyles.spacing.lineHeight.tight
        }
      },

      {
        selector: 'h3',
        properties: {
          fontFamily: this.mfecStyles.fonts.headingFont,
          fontSize: `${this.mfecStyles.fonts.sizes.h3}px`,
          fontWeight: this.mfecStyles.fonts.weights.medium,
          color: this.mfecStyles.colors.text.primary,
          marginTop: `${this.mfecStyles.spacing.margins.section * 0.5}px`,
          marginBottom: `${this.mfecStyles.spacing.margins.paragraph}px`,
          lineHeight: this.mfecStyles.spacing.lineHeight.tight
        }
      },

      // Paragraph styles
      {
        selector: 'p',
        properties: {
          marginBottom: `${this.mfecStyles.spacing.margins.paragraph}px`,
          lineHeight: this.mfecStyles.spacing.lineHeight.normal,
          textAlign: 'justify'
        }
      },

      // List styles
      {
        selector: 'ul, ol',
        properties: {
          marginBottom: `${this.mfecStyles.spacing.margins.list}px`,
          paddingLeft: '24px'
        }
      },

      {
        selector: 'li',
        properties: {
          marginBottom: `${this.mfecStyles.spacing.margins.list * 0.5}px`,
          lineHeight: this.mfecStyles.spacing.lineHeight.normal
        }
      },

      // Image styles
      {
        selector: '.document-image',
        properties: {
          maxWidth: '100%',
          height: 'auto',
          margin: `${this.mfecStyles.spacing.margins.image}px 0`,
          border: `1px solid ${this.mfecStyles.colors.border.light}`,
          borderRadius: '4px'
        }
      },

      {
        selector: '.image-caption',
        properties: {
          fontSize: `${this.mfecStyles.fonts.sizes.caption}px`,
          color: this.mfecStyles.colors.text.secondary,
          textAlign: 'center',
          marginTop: '8px',
          fontStyle: 'italic'
        }
      },

      // Section styles
      {
        selector: '.document-section',
        properties: {
          marginBottom: `${this.mfecStyles.spacing.margins.section}px`,
          padding: `${this.mfecStyles.spacing.padding.content}px`,
          borderLeft: `4px solid ${this.mfecStyles.colors.primary}`,
          backgroundColor: this.mfecStyles.colors.background.secondary
        }
      },

      // Sidebar styles (uses secondary color)
      {
        selector: '.sidebar',
        properties: {
          borderLeft: `4px solid ${this.mfecStyles.colors.secondary}`,
          backgroundColor: this.mfecStyles.colors.background.accent
        }
      },

      // Accent elements (uses accent color)
      {
        selector: '.accent-border',
        properties: {
          borderColor: this.mfecStyles.colors.accent
        }
      },

      // Code styles
      {
        selector: 'code',
        properties: {
          fontFamily: this.mfecStyles.fonts.codeFont,
          fontSize: `${this.mfecStyles.fonts.sizes.body * 0.9}px`,
          backgroundColor: this.mfecStyles.colors.background.accent,
          padding: '2px 4px',
          borderRadius: '3px',
          border: `1px solid ${this.mfecStyles.colors.border.light}`
        }
      },

      {
        selector: 'pre',
        properties: {
          fontFamily: this.mfecStyles.fonts.codeFont,
          fontSize: `${this.mfecStyles.fonts.sizes.body * 0.9}px`,
          backgroundColor: this.mfecStyles.colors.background.accent,
          padding: `${this.mfecStyles.spacing.padding.content}px`,
          borderRadius: '6px',
          border: `1px solid ${this.mfecStyles.colors.border.medium}`,
          overflow: 'auto',
          marginBottom: `${this.mfecStyles.spacing.margins.paragraph}px`
        }
      },

      // Table styles
      {
        selector: 'table',
        properties: {
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: `${this.mfecStyles.spacing.margins.paragraph}px`,
          border: `1px solid ${this.mfecStyles.colors.border.medium}`
        }
      },

      {
        selector: 'th, td',
        properties: {
          padding: '12px',
          textAlign: 'left',
          borderBottom: `1px solid ${this.mfecStyles.colors.border.light}`
        }
      },

      {
        selector: 'th',
        properties: {
          backgroundColor: this.mfecStyles.colors.background.accent,
          fontWeight: this.mfecStyles.fonts.weights.medium,
          color: this.mfecStyles.colors.primary
        }
      }
    ];

    return this.rulesToCSS(rules);
  }

  /**
   * Generates print-specific styles for document export
   */
  generatePrintStyles(): string {
    const printRules: StyleRule[] = [
      {
        selector: '@page',
        properties: {
          margin: '2cm',
          size: 'A4'
        }
      },
      {
        selector: 'body',
        properties: {
          fontSize: '12pt',
          lineHeight: 1.4
        },
        mediaQuery: 'print'
      },
      {
        selector: 'h1',
        properties: {
          fontSize: '18pt',
          pageBreakAfter: 'avoid'
        },
        mediaQuery: 'print'
      },
      {
        selector: 'h2, h3',
        properties: {
          pageBreakAfter: 'avoid'
        },
        mediaQuery: 'print'
      },
      {
        selector: '.document-section',
        properties: {
          pageBreakInside: 'avoid'
        },
        mediaQuery: 'print'
      }
    ];

    return this.rulesToCSS(printRules);
  }

  /**
   * Applies inline styles to HTML content
   */
  applyInlineStyles(htmlContent: string): string {
    // Apply basic inline styles for better email/document compatibility
    const styleMap = {
      'h1': `style="font-family: ${this.mfecStyles.fonts.headingFont}; font-size: ${this.mfecStyles.fonts.sizes.h1}px; color: ${this.mfecStyles.colors.primary}; margin: ${this.mfecStyles.spacing.margins.section}px 0 ${this.mfecStyles.spacing.margins.paragraph}px 0;"`,
      'h2': `style="font-family: ${this.mfecStyles.fonts.headingFont}; font-size: ${this.mfecStyles.fonts.sizes.h2}px; color: ${this.mfecStyles.colors.primary}; margin: ${this.mfecStyles.spacing.margins.section * 0.75}px 0 ${this.mfecStyles.spacing.margins.paragraph}px 0;"`,
      'h3': `style="font-family: ${this.mfecStyles.fonts.headingFont}; font-size: ${this.mfecStyles.fonts.sizes.h3}px; color: ${this.mfecStyles.colors.text.primary}; margin: ${this.mfecStyles.spacing.margins.section * 0.5}px 0 ${this.mfecStyles.spacing.margins.paragraph}px 0;"`,
      'p': `style="font-family: ${this.mfecStyles.fonts.primaryFont}; font-size: ${this.mfecStyles.fonts.sizes.body}px; line-height: ${this.mfecStyles.spacing.lineHeight.normal}; margin-bottom: ${this.mfecStyles.spacing.margins.paragraph}px; text-align: justify;"`,
      'body': `style="font-family: ${this.mfecStyles.fonts.primaryFont}; font-size: ${this.mfecStyles.fonts.sizes.body}px; color: ${this.mfecStyles.colors.text.primary}; background-color: ${this.mfecStyles.colors.background.primary}; margin: 0; padding: 0;"`
    };

    let styledContent = htmlContent;
    
    Object.entries(styleMap).forEach(([tag, style]) => {
      const regex = new RegExp(`<${tag}(?![^>]*style=)`, 'gi');
      styledContent = styledContent.replace(regex, `<${tag} ${style}`);
    });

    return styledContent;
  }

  /**
   * Gets style settings for specific document elements
   */
  getElementStyles(element: string): Record<string, string | number> {
    const elementStyles: Record<string, Record<string, string | number>> = {
      header: {
        backgroundColor: this.mfecStyles.colors.primary,
        color: this.mfecStyles.colors.background.primary,
        padding: `${this.mfecStyles.spacing.padding.content}px`,
        textAlign: 'center',
        fontWeight: this.mfecStyles.fonts.weights.bold
      },
      footer: {
        backgroundColor: this.mfecStyles.colors.background.secondary,
        color: this.mfecStyles.colors.text.secondary,
        padding: `${this.mfecStyles.spacing.padding.content}px`,
        textAlign: 'center',
        fontSize: `${this.mfecStyles.fonts.sizes.caption}px`,
        borderTop: `1px solid ${this.mfecStyles.colors.border.light}`
      },
      sidebar: {
        backgroundColor: this.mfecStyles.colors.background.accent,
        padding: `${this.mfecStyles.spacing.padding.sidebar}px`,
        borderLeft: `4px solid ${this.mfecStyles.colors.secondary}`,
        fontSize: `${this.mfecStyles.fonts.sizes.body * 0.9}px`
      },
      callout: {
        backgroundColor: this.mfecStyles.colors.background.accent,
        border: `2px solid ${this.mfecStyles.colors.accent}`,
        borderRadius: '6px',
        padding: `${this.mfecStyles.spacing.padding.content}px`,
        margin: `${this.mfecStyles.spacing.margins.paragraph}px 0`
      }
    };

    return elementStyles[element] || {};
  }

  /**
   * Converts style rules to CSS string
   */
  private rulesToCSS(rules: StyleRule[]): string {
    return rules.map(rule => {
      const properties = Object.entries(rule.properties)
        .map(([prop, value]) => `  ${this.camelToKebab(prop)}: ${value}${typeof value === 'number' && prop !== 'fontWeight' ? 'px' : ''};`)
        .join('\n');
      
      const css = `${rule.selector} {\n${properties}\n}`;
      
      if (rule.mediaQuery) {
        return `@media ${rule.mediaQuery} {\n  ${css.replace(/\n/g, '\n  ')}\n}`;
      }
      
      return css;
    }).join('\n\n');
  }

  /**
   * Converts camelCase to kebab-case for CSS properties
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Updates MFEC style settings
   */
  updateStyles(newStyles: Partial<MFECStyleSettings>): void {
    this.mfecStyles = {
      ...this.mfecStyles,
      fonts: { ...this.mfecStyles.fonts, ...newStyles.fonts },
      colors: { ...this.mfecStyles.colors, ...newStyles.colors },
      spacing: { ...this.mfecStyles.spacing, ...newStyles.spacing },
      layout: { ...this.mfecStyles.layout, ...newStyles.layout }
    };
  }

  /**
   * Gets current MFEC style settings
   */
  getStyles(): MFECStyleSettings {
    return { ...this.mfecStyles };
  }
}