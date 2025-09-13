/**
 * Tests for ContentOrganizer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContentOrganizer, OrganizationRules } from './ContentOrganizer';
import { ImagePlacement } from './DocumentSection';

describe('ContentOrganizer', () => {
  let organizer: ContentOrganizer;

  beforeEach(() => {
    organizer = new ContentOrganizer();
  });

  describe('organizeContent', () => {
    it('should organize simple content into sections', () => {
      const content = `
# Introduction
This is the introduction section.

# Features
- Feature 1
- Feature 2

# Usage
How to use the product.
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      expect(sections.length).toBeGreaterThan(0);
      expect(sections[0].sectionType).toBe('introduction');
      
      // Find sections by title (order may vary)
      const introSection = sections.find(s => s.title === 'Introduction');
      const featuresSection = sections.find(s => s.title === 'Features');
      const usageSection = sections.find(s => s.title === 'Usage');
      
      expect(introSection).toBeDefined();
      expect(featuresSection).toBeDefined();
      expect(usageSection).toBeDefined();
    });

    it('should handle content without headings', () => {
      const content = `
This is some content without headings.
It should still be organized properly.

Another paragraph of content.
`;

      const sections = organizer.organizeContent(content, 'product_document');

      expect(sections.length).toBeGreaterThan(0);
      expect(sections[0].sectionType).toBe('introduction');
    });

    it('should create subsections from nested headings', () => {
      const content = `
# Main Section
This is the main section content.

## Subsection 1
This is subsection content.

## Subsection 2
More subsection content.

# Another Section
Another main section.
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      const mainSection = sections.find(s => s.title === 'Main Section');
      expect(mainSection).toBeDefined();
      expect(mainSection?.subsections).toHaveLength(2);
      expect(mainSection?.subsections[0].title).toBe('Subsection 1');
      expect(mainSection?.subsections[1].title).toBe('Subsection 2');
    });

    it('should handle lists correctly', () => {
      const content = `
# Features
- First feature
- Second feature
- Third feature

# Numbered Steps
1. First step
2. Second step
3. Third step
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      const featuresSection = sections.find(s => s.title === 'Features');
      expect(featuresSection?.content).toContain('- First feature');
      
      const stepsSection = sections.find(s => s.title === 'Numbered Steps');
      expect(stepsSection?.content).toContain('1. First step');
    });

    it('should handle code blocks', () => {
      const content = `
# Installation
Install the package:

\`\`\`bash
npm install package-name
\`\`\`

Then configure it.
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      const installSection = sections.find(s => s.title === 'Installation');
      expect(installSection?.content).toContain('npm install package-name');
    });
  });

  describe('section type determination', () => {
    it('should correctly identify introduction sections', () => {
      const content = `
# Overview
This is an overview of the product.

# Introduction to the System
This introduces the system.
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      const overviewSection = sections.find(s => s.title === 'Overview');
      expect(overviewSection?.sectionType).toBe('introduction');

      const introSection = sections.find(s => s.title === 'Introduction to the System');
      expect(introSection?.sectionType).toBe('introduction');
    });

    it('should correctly identify feature sections', () => {
      const content = `
# Key Features
List of features.

# Product Capabilities
What the product can do.
`;

      const sections = organizer.organizeContent(content, 'product_document');

      const featuresSection = sections.find(s => s.title === 'Key Features');
      expect(featuresSection?.sectionType).toBe('features');

      const capabilitiesSection = sections.find(s => s.title === 'Product Capabilities');
      expect(capabilitiesSection?.sectionType).toBe('features');
    });

    it('should correctly identify installation sections', () => {
      const content = `
# Installation Guide
How to install.

# Setup Instructions
Setup steps.
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      const installSection = sections.find(s => s.title === 'Installation Guide');
      expect(installSection?.sectionType).toBe('installation');

      const setupSection = sections.find(s => s.title === 'Setup Instructions');
      expect(setupSection?.sectionType).toBe('installation');
    });

    it('should correctly identify troubleshooting sections', () => {
      const content = `
# Troubleshooting Guide
Common problems and solutions.

# Known Issues
List of issues.
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      const troubleshootSection = sections.find(s => s.title === 'Troubleshooting Guide');
      expect(troubleshootSection?.sectionType).toBe('troubleshooting');

      const issuesSection = sections.find(s => s.title === 'Known Issues');
      expect(issuesSection?.sectionType).toBe('troubleshooting');
    });
  });

  describe('image distribution', () => {
    let images: ImagePlacement[];

    beforeEach(() => {
      images = [
        {
          id: 'img1',
          imageUrl: '/img1.jpg',
          caption: 'Installation screenshot',
          position: 'after',
          alignment: 'center'
        },
        {
          id: 'img2',
          imageUrl: '/img2.jpg',
          caption: 'Usage example',
          position: 'after',
          alignment: 'center'
        },
        {
          id: 'img3',
          imageUrl: '/img3.jpg',
          caption: 'Feature demonstration',
          position: 'after',
          alignment: 'center'
        }
      ];
    });

    it('should distribute images evenly when configured', () => {
      const evenOrganizer = new ContentOrganizer({ imageDistribution: 'even' });
      
      const content = `
# Section 1
Content 1

# Section 2
Content 2
`;

      const sections = evenOrganizer.organizeContent(content, 'user_manual', images);

      // Should distribute images across sections
      const totalImages = sections.reduce((sum, section) => sum + section.images.length, 0);
      expect(totalImages).toBe(images.length);
    });

    it('should distribute images based on content relevance', () => {
      const contentOrganizer = new ContentOrganizer({ imageDistribution: 'content-based' });
      
      const content = `
# Installation
How to install the software.

# Usage Examples
How to use the features.
`;

      const sections = contentOrganizer.organizeContent(content, 'user_manual', images);

      const installSection = sections.find(s => s.title === 'Installation');
      const usageSection = sections.find(s => s.title === 'Usage Examples');

      // Installation section should get installation-related image
      expect(installSection?.images.some(img => img.caption.includes('Installation'))).toBe(true);
      
      // Usage section should get usage-related image
      expect(usageSection?.images.some(img => img.caption.includes('Usage'))).toBe(true);
    });
  });

  describe('custom organization rules', () => {
    it('should respect custom max section length', () => {
      const shortOrganizer = new ContentOrganizer({ maxSectionLength: 50 });
      
      const longContent = 'This is a very long piece of content that should be split into multiple sections because it exceeds the maximum section length that we have configured for this test.';
      
      const content = `
# Long Section
${longContent}
`;

      const sections = shortOrganizer.organizeContent(content, 'user_manual');

      const longSection = sections.find(s => s.title === 'Long Section');
      
      // Should have been split into subsections
      expect(longSection?.subsections.length).toBeGreaterThan(0);
    });

    it('should handle custom preferred section types', () => {
      const customOrganizer = new ContentOrganizer({
        preferredSectionTypes: ['specifications', 'requirements']
      });

      const content = `
# Technical Specifications
Spec details.

# System Requirements
Requirements list.
`;

      const sections = customOrganizer.organizeContent(content, 'product_document');

      expect(sections.some(s => s.sectionType === 'specifications')).toBe(true);
      expect(sections.some(s => s.sectionType === 'requirements')).toBe(true);
    });

    it('should optionally skip introduction when configured', () => {
      const noIntroOrganizer = new ContentOrganizer({ requireIntroduction: false });
      
      const content = `
# Features
List of features.

# Usage
How to use.
`;

      const sections = noIntroOrganizer.organizeContent(content, 'user_manual');

      // Should not have auto-generated introduction
      expect(sections.every(s => s.sectionType !== 'introduction' || s.title !== 'Introduction')).toBe(true);
    });
  });

  describe('content parsing', () => {
    it('should parse mixed content types correctly', () => {
      const content = `
# Mixed Content Section

This is a paragraph of text.

- List item 1
- List item 2

\`\`\`javascript
console.log('code example');
\`\`\`

Another paragraph after code.

1. Numbered item 1
2. Numbered item 2
`;

      const sections = organizer.organizeContent(content, 'user_manual');

      const mixedSection = sections.find(s => s.title === 'Mixed Content Section');
      expect(mixedSection?.content).toContain('This is a paragraph');
      expect(mixedSection?.content).toContain('- List item 1');
      expect(mixedSection?.content).toContain('console.log');
      expect(mixedSection?.content).toContain('1. Numbered item 1');
    });

    it('should handle empty lines and whitespace', () => {
      const content = `

# Section with Spacing


This has extra spacing.


Another paragraph.

`;

      const sections = organizer.organizeContent(content, 'user_manual');

      const section = sections.find(s => s.title === 'Section with Spacing');
      expect(section?.content).toBeTruthy();
      expect(section?.content).not.toMatch(/^\s+|\s+$/); // Should be trimmed
    });
  });
});