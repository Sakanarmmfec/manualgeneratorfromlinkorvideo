import { describe, it, expect, beforeEach } from 'vitest';
import { ImagePlacer } from './ImagePlacer';
import { ImageData, DocumentSection } from '../../types';

describe('ImagePlacer', () => {
  let imagePlacer: ImagePlacer;
  let sampleImages: ImageData[];
  let sampleSections: DocumentSection[];

  beforeEach(() => {
    imagePlacer = new ImagePlacer();
    
    sampleImages = [
      {
        url: 'https://example.com/feature1.jpg',
        altText: 'Product feature 1',
        title: 'Feature Image',
        width: 800,
        height: 600,
        format: 'jpg',
        size: 100000,
        relevanceScore: 0.9
      },
      {
        url: 'https://example.com/installation.jpg',
        altText: 'Installation step',
        title: 'Installation Guide',
        width: 600,
        height: 400,
        format: 'jpg',
        size: 80000,
        relevanceScore: 0.8
      },
      {
        url: 'https://example.com/usage.jpg',
        altText: 'Usage example',
        title: 'How to Use',
        width: 700,
        height: 500,
        format: 'jpg',
        size: 90000,
        relevanceScore: 0.7
      }
    ];

    sampleSections = [
      {
        id: 'features',
        title: 'Product Features',
        content: 'This section describes the main features of the product. '.repeat(50),
        subsections: [],
        images: [],
        sectionType: 'features'
      },
      {
        id: 'installation',
        title: 'Installation Guide',
        content: 'Follow these steps to install the product. '.repeat(30),
        subsections: [],
        images: [],
        sectionType: 'installation'
      },
      {
        id: 'usage',
        title: 'Usage Instructions',
        content: 'Learn how to use the product effectively. '.repeat(40),
        subsections: [],
        images: [],
        sectionType: 'usage'
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        content: 'Common issues and solutions. '.repeat(20),
        subsections: [],
        images: [],
        sectionType: 'troubleshooting'
      }
    ];
  });

  describe('determineOptimalPlacement', () => {
    it('should place images in appropriate sections', async () => {
      const result = await imagePlacer.determineOptimalPlacement(
        sampleImages,
        sampleSections
      );

      expect(result.placements).toHaveLength(3);
      expect(result.unplacedImages).toHaveLength(0);
      expect(result.placementScore).toBeGreaterThan(0);

      // Check that feature image is placed in features section
      const featurePlacement = result.placements.find(p => 
        p.imageId.includes('feature1') && p.sectionId === 'features'
      );
      expect(featurePlacement).toBeDefined();

      // Check that installation image is placed in installation section
      const installationPlacement = result.placements.find(p => 
        p.imageId.includes('installation') && p.sectionId === 'installation'
      );
      expect(installationPlacement).toBeDefined();
    });

    it('should respect maxImagesPerSection limit', async () => {
      const manyImages = Array(10).fill(null).map((_, i) => ({
        ...sampleImages[0],
        url: `https://example.com/image${i}.jpg`,
        relevanceScore: 0.5
      }));

      const result = await imagePlacer.determineOptimalPlacement(
        manyImages,
        sampleSections,
        { maxImagesPerSection: 2 }
      );

      // Check that no section has more than 2 images
      const sectionImageCounts = new Map<string, number>();
      result.placements.forEach(placement => {
        const count = sectionImageCounts.get(placement.sectionId) || 0;
        sectionImageCounts.set(placement.sectionId, count + 1);
      });

      sectionImageCounts.forEach(count => {
        expect(count).toBeLessThanOrEqual(2);
      });
    });

    it('should prioritize images by relevance when enabled', async () => {
      const imagesWithVaryingRelevance = [
        { ...sampleImages[0], relevanceScore: 0.3 },
        { ...sampleImages[1], relevanceScore: 0.9 },
        { ...sampleImages[2], relevanceScore: 0.6 }
      ];

      const result = await imagePlacer.determineOptimalPlacement(
        imagesWithVaryingRelevance,
        sampleSections,
        { prioritizeRelevance: true, maxImagesPerSection: 1 }
      );

      // The highest relevance image should be placed first
      expect(result.placements).toHaveLength(3);
      const highestRelevancePlacement = result.placements.find(p => 
        p.priority > result.placements.filter(other => other !== p)[0]?.priority
      );
      expect(highestRelevancePlacement).toBeDefined();
    });

    it('should handle sections with different content lengths', async () => {
      const sectionsWithVaryingLengths = [
        {
          ...sampleSections[0],
          content: 'Short content.'
        },
        {
          ...sampleSections[1],
          content: 'Very long content. '.repeat(100)
        }
      ];

      const result = await imagePlacer.determineOptimalPlacement(
        sampleImages.slice(0, 2),
        sectionsWithVaryingLengths
      );

      // Longer section should be preferred for image placement
      const longSectionPlacements = result.placements.filter(p => 
        p.sectionId === sectionsWithVaryingLengths[1].id
      );
      expect(longSectionPlacements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateFallbackPlacements', () => {
    it('should create fallback placements for all images', () => {
      const fallbackPlacements = imagePlacer.generateFallbackPlacements(
        sampleImages,
        sampleSections
      );

      expect(fallbackPlacements).toHaveLength(sampleImages.length);
      fallbackPlacements.forEach(placement => {
        expect(placement.position).toBe('middle');
        expect(placement.alignment).toBe('center');
        expect(placement.size).toBe('medium');
      });
    });

    it('should distribute images across sections', () => {
      const fallbackPlacements = imagePlacer.generateFallbackPlacements(
        sampleImages,
        sampleSections
      );

      const sectionIds = new Set(fallbackPlacements.map(p => p.sectionId));
      expect(sectionIds.size).toBeGreaterThan(1);
    });
  });

  describe('createPlaceholderPlacements', () => {
    it('should create placeholders for sections that need images', () => {
      const placeholders = imagePlacer.createPlaceholderPlacements(sampleSections);

      expect(placeholders.length).toBeGreaterThan(0);
      placeholders.forEach(placeholder => {
        expect(placeholder.imageId).toContain('placeholder_');
        expect(placeholder.caption).toContain('placeholder');
        expect(placeholder.priority).toBe(25);
      });
    });

    it('should not create placeholders for introduction sections', () => {
      const sectionsWithIntro = [
        {
          ...sampleSections[0],
          sectionType: 'introduction',
          content: 'Introduction content. '.repeat(30)
        },
        ...sampleSections.slice(1)
      ];

      const placeholders = imagePlacer.createPlaceholderPlacements(sectionsWithIntro);

      const introPlaceholders = placeholders.filter(p => 
        p.sectionId === sectionsWithIntro[0].id
      );
      expect(introPlaceholders).toHaveLength(0);
    });

    it('should not create placeholders for short sections', () => {
      const shortSections = sampleSections.map(section => ({
        ...section,
        content: 'Short content.'
      }));

      const placeholders = imagePlacer.createPlaceholderPlacements(shortSections);

      expect(placeholders).toHaveLength(0);
    });
  });

  describe('placement properties', () => {
    it('should set appropriate position based on section and image count', async () => {
      const result = await imagePlacer.determineOptimalPlacement(
        sampleImages,
        sampleSections,
        { preferredPosition: 'top' }
      );

      const firstPlacement = result.placements[0];
      expect(['top', 'middle', 'bottom']).toContain(firstPlacement.position);
    });

    it('should set alignment based on image aspect ratio', async () => {
      const wideImage: ImageData = {
        ...sampleImages[0],
        width: 1600,
        height: 400 // Very wide aspect ratio
      };

      const result = await imagePlacer.determineOptimalPlacement(
        [wideImage],
        sampleSections.slice(0, 1)
      );

      expect(result.placements[0].alignment).toBe('center');
    });

    it('should generate appropriate captions', async () => {
      const result = await imagePlacer.determineOptimalPlacement(
        sampleImages,
        sampleSections
      );

      result.placements.forEach(placement => {
        expect(placement.caption).toBeTruthy();
        expect(typeof placement.caption).toBe('string');
      });
    });

    it('should set size based on image and section characteristics', async () => {
      const largeSection = {
        ...sampleSections[0],
        content: 'Very long content. '.repeat(200)
      };

      const result = await imagePlacer.determineOptimalPlacement(
        [sampleImages[0]],
        [largeSection]
      );

      expect(['small', 'medium', 'large', 'full-width']).toContain(
        result.placements[0].size
      );
    });

    it('should calculate priority based on relevance and section type', async () => {
      const result = await imagePlacer.determineOptimalPlacement(
        sampleImages,
        sampleSections
      );

      result.placements.forEach(placement => {
        expect(placement.priority).toBeGreaterThan(0);
        expect(placement.priority).toBeLessThanOrEqual(200);
      });

      // Higher relevance should result in higher priority
      const sortedByRelevance = [...sampleImages].sort((a, b) => 
        (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );
      const highestRelevanceImage = sortedByRelevance[0];
      
      const highestRelevancePlacement = result.placements.find(p => 
        p.imageId.includes(highestRelevanceImage.url.split('/').pop()?.split('.')[0] || '')
      );
      
      if (highestRelevancePlacement) {
        expect(highestRelevancePlacement.priority).toBeGreaterThan(50);
      }
    });
  });
});