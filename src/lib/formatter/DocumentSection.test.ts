/**
 * Tests for DocumentSection data model and hierarchy management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentSection, DocumentSectionManager, SectionType } from './DocumentSection';

describe('DocumentSectionManager', () => {
  describe('createSection', () => {
    it('should create a section with proper structure', () => {
      const section = DocumentSectionManager.createSection(
        'Test Section',
        'This is test content.',
        'introduction',
        1,
        0
      );

      expect(section.title).toBe('Test Section');
      expect(section.content).toBe('This is test content.');
      expect(section.sectionType).toBe('introduction');
      expect(section.level).toBe(1);
      expect(section.order).toBe(0);
      expect(section.subsections).toEqual([]);
      expect(section.images).toEqual([]);
      expect(section.metadata).toBeDefined();
      expect(section.metadata?.wordCount).toBe(4);
    });

    it('should generate unique IDs for sections', () => {
      const section1 = DocumentSectionManager.createSection('Test', 'Content', 'features');
      const section2 = DocumentSectionManager.createSection('Test', 'Content', 'features');

      expect(section1.id).not.toBe(section2.id);
      expect(section1.id).toMatch(/^section-1-test-\d+-[a-z0-9]+$/);
    });

    it('should calculate word count correctly', () => {
      const section = DocumentSectionManager.createSection(
        'Test',
        'This is a longer piece of content with multiple words.',
        'usage'
      );

      expect(section.metadata?.wordCount).toBe(10);
    });

    it('should calculate estimated read time', () => {
      const longContent = 'word '.repeat(200); // 200 words
      const section = DocumentSectionManager.createSection(
        'Test',
        longContent,
        'usage'
      );

      expect(section.metadata?.estimatedReadTime).toBe(1); // 200 words / 200 wpm = 1 minute
    });
  });

  describe('addSubsection', () => {
    it('should add subsection with correct hierarchy', () => {
      const parent = DocumentSectionManager.createSection('Parent', 'Parent content', 'introduction', 1);
      const child = DocumentSectionManager.createSection('Child', 'Child content', 'features', 1);

      DocumentSectionManager.addSubsection(parent, child);

      expect(parent.subsections).toHaveLength(1);
      expect(parent.subsections[0]).toBe(child);
      expect(child.level).toBe(2);
      expect(child.order).toBe(0);
    });

    it('should handle multiple subsections with correct ordering', () => {
      const parent = DocumentSectionManager.createSection('Parent', 'Content', 'introduction', 1);
      const child1 = DocumentSectionManager.createSection('Child 1', 'Content 1', 'features', 1);
      const child2 = DocumentSectionManager.createSection('Child 2', 'Content 2', 'usage', 1);

      DocumentSectionManager.addSubsection(parent, child1);
      DocumentSectionManager.addSubsection(parent, child2);

      expect(parent.subsections).toHaveLength(2);
      expect(child1.order).toBe(0);
      expect(child2.order).toBe(1);
      expect(child1.level).toBe(2);
      expect(child2.level).toBe(2);
    });
  });

  describe('findSectionById', () => {
    let sections: DocumentSection[];

    beforeEach(() => {
      const section1 = DocumentSectionManager.createSection('Section 1', 'Content 1', 'introduction', 1);
      const section2 = DocumentSectionManager.createSection('Section 2', 'Content 2', 'features', 1);
      const subsection = DocumentSectionManager.createSection('Subsection', 'Sub content', 'usage', 2);
      
      DocumentSectionManager.addSubsection(section1, subsection);
      sections = [section1, section2];
    });

    it('should find top-level section by ID', () => {
      const found = DocumentSectionManager.findSectionById(sections, sections[0].id);
      expect(found).toBe(sections[0]);
    });

    it('should find nested subsection by ID', () => {
      const subsectionId = sections[0].subsections[0].id;
      const found = DocumentSectionManager.findSectionById(sections, subsectionId);
      expect(found).toBe(sections[0].subsections[0]);
    });

    it('should return null for non-existent ID', () => {
      const found = DocumentSectionManager.findSectionById(sections, 'non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('flattenSections', () => {
    it('should flatten nested sections correctly', () => {
      const section1 = DocumentSectionManager.createSection('Section 1', 'Content 1', 'introduction', 1);
      const section2 = DocumentSectionManager.createSection('Section 2', 'Content 2', 'features', 1);
      const subsection1 = DocumentSectionManager.createSection('Subsection 1', 'Sub content 1', 'usage', 2);
      const subsection2 = DocumentSectionManager.createSection('Subsection 2', 'Sub content 2', 'troubleshooting', 2);
      
      DocumentSectionManager.addSubsection(section1, subsection1);
      DocumentSectionManager.addSubsection(section1, subsection2);
      
      const sections = [section1, section2];
      const flattened = DocumentSectionManager.flattenSections(sections);

      expect(flattened).toHaveLength(4);
      expect(flattened[0]).toBe(section1);
      expect(flattened[1]).toBe(subsection1);
      expect(flattened[2]).toBe(subsection2);
      expect(flattened[3]).toBe(section2);
    });

    it('should handle empty sections array', () => {
      const flattened = DocumentSectionManager.flattenSections([]);
      expect(flattened).toEqual([]);
    });
  });

  describe('reorderSections', () => {
    it('should reorder sections by order property', () => {
      const section1 = DocumentSectionManager.createSection('Section 1', 'Content 1', 'introduction', 1, 2);
      const section2 = DocumentSectionManager.createSection('Section 2', 'Content 2', 'features', 1, 0);
      const section3 = DocumentSectionManager.createSection('Section 3', 'Content 3', 'usage', 1, 1);
      
      const sections = [section1, section2, section3];
      const reordered = DocumentSectionManager.reorderSections(sections);

      expect(reordered[0].order).toBe(0); // section2
      expect(reordered[1].order).toBe(1); // section3
      expect(reordered[2].order).toBe(2); // section1
    });

    it('should reorder subsections recursively', () => {
      const parent = DocumentSectionManager.createSection('Parent', 'Content', 'introduction', 1);
      const child1 = DocumentSectionManager.createSection('Child 1', 'Content 1', 'features', 2, 1);
      const child2 = DocumentSectionManager.createSection('Child 2', 'Content 2', 'usage', 2, 0);
      
      parent.subsections = [child1, child2];
      
      const reordered = DocumentSectionManager.reorderSections([parent]);
      
      expect(reordered[0].subsections[0].order).toBe(0); // child2
      expect(reordered[0].subsections[1].order).toBe(1); // child1
    });
  });

  describe('validateHierarchy', () => {
    it('should validate correct hierarchy', () => {
      const section1 = DocumentSectionManager.createSection('Section 1', 'Content 1', 'introduction', 1);
      const subsection = DocumentSectionManager.createSection('Subsection', 'Sub content', 'usage', 2);
      
      DocumentSectionManager.addSubsection(section1, subsection);
      
      const validation = DocumentSectionManager.validateHierarchy([section1]);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect incorrect level hierarchy', () => {
      const section = DocumentSectionManager.createSection('Section', 'Content', 'introduction', 1);
      const invalidSubsection = DocumentSectionManager.createSection('Invalid', 'Content', 'usage', 3); // Should be level 2
      
      section.subsections = [invalidSubsection];
      
      const validation = DocumentSectionManager.validateHierarchy([section]);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Section "Invalid" has incorrect level 3, expected 2');
    });

    it('should detect empty content', () => {
      const section = DocumentSectionManager.createSection('Section', '   ', 'introduction', 1);
      
      const validation = DocumentSectionManager.validateHierarchy([section]);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Section "Section" has empty content');
    });
  });
});