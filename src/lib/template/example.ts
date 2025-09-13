/**
 * Example usage of the MFEC Template and Asset Management System
 * 
 * This file demonstrates how to use the template system components
 * for loading MFEC templates and managing brand assets.
 */

import { MFECTemplateService, TemplateManager, BrandAssetManager } from './index';
import { TemplateError, AssetError } from '../../types';

/**
 * Example 1: Basic Template Service Usage
 */
export async function basicTemplateUsage() {
  const templateService = new MFECTemplateService();

  try {
    // Initialize the template system
    console.log('Initializing MFEC template system...');
    const validation = await templateService.initialize();
    
    if (validation.isValid) {
      console.log('✓ Template system initialized successfully');
    } else {
      console.warn('⚠ Template system has issues:', validation.errors);
    }

    // Load a system manual template
    const systemTemplate = await templateService.loadTemplate('system_manual');
    console.log('System manual template loaded:', {
      documentType: systemTemplate.documentType,
      templatePath: systemTemplate.templatePath,
      logoAssets: systemTemplate.logoAssets
    });

    // Load a user manual template
    const userTemplate = await templateService.loadTemplate('user_manual');
    console.log('User manual template loaded:', {
      documentType: userTemplate.documentType,
      styleSettings: userTemplate.styleSettings.logoPlacement
    });

  } catch (error) {
    if (error instanceof TemplateError) {
      console.error('Template error:', error.message, `(${error.code})`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 2: Asset Management
 */
export async function assetManagementExample() {
  const templateService = new MFECTemplateService();

  try {
    // Get all available brand assets
    const assets = await templateService.getBrandAssets();
    console.log(`Found ${assets.length} brand assets:`);
    
    assets.forEach(asset => {
      console.log(`- ${asset.name} (${asset.type}, ${asset.format})`);
    });

    // Get specific logo assets
    const logos = ['standard', 'white', 'ai'] as const;
    for (const logoType of logos) {
      try {
        const logo = await templateService.getLogoAsset(logoType);
        console.log(`${logoType} logo:`, {
          name: logo.name,
          path: logo.path,
          size: logo.size
        });
      } catch (error) {
        console.warn(`${logoType} logo not available:`, error instanceof Error ? error.message : error);
      }
    }

    // Get template document and brand guideline
    const templateDoc = await templateService.getTemplateDocument();
    const brandGuideline = await templateService.getBrandGuideline();
    
    console.log('Template document:', templateDoc.name);
    console.log('Brand guideline:', brandGuideline.name);

  } catch (error) {
    if (error instanceof AssetError) {
      console.error('Asset error:', error.message, `(${error.code})`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 3: Complete Template Configuration
 */
export async function completeConfigurationExample() {
  const templateService = new MFECTemplateService();

  try {
    // Create complete configuration for system manual
    console.log('Creating complete template configuration...');
    const config = await templateService.createTemplateConfiguration('system_manual');

    console.log('Template configuration created:');
    console.log('- Template type:', config.template.documentType);
    console.log('- Validation status:', config.validation.isValid ? 'Valid' : 'Invalid');
    console.log('- Available assets:', config.assets.length);
    
    // Display style settings
    const styles = config.template.styleSettings;
    console.log('Style settings:');
    console.log('- Primary colors:', styles.primaryColors);
    console.log('- Primary font:', styles.fonts.primaryFont);
    console.log('- Document logo:', styles.logoPlacement.documentLogo);
    console.log('- Margins:', styles.spacing.margins);

    // Display asset details
    console.log('Asset details:');
    config.assets.forEach(asset => {
      console.log(`- ${asset.name}: ${asset.type} (${asset.format})`);
    });

  } catch (error) {
    console.error('Configuration error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 4: Validation and Error Handling
 */
export async function validationExample() {
  const templateService = new MFECTemplateService();

  try {
    // Validate the entire system
    const validation = await templateService.validateSystem();
    
    console.log('System validation results:');
    console.log('- Overall valid:', validation.isValid);
    console.log('- Template exists:', validation.templateExists);
    console.log('- Assets exist:', validation.assetsExist);
    console.log('- Brand guideline exists:', validation.brandGuidelineExists);
    
    if (validation.errors.length > 0) {
      console.log('Errors:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('Warnings:');
      validation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    // Check individual assets
    const assetsToCheck = [
      'Logo MFEC.png',
      'Logo MFEC White.png', 
      'Logo MFEC More. 2023ai.ai',
      'MFEC_System&User_Manual_Template.docx',
      'ENG_MFEC Brand Guideline as of 11 Sep 23.pdf'
    ];

    console.log('Individual asset checks:');
    for (const assetName of assetsToCheck) {
      const exists = await templateService.assetExists(assetName);
      console.log(`- ${assetName}: ${exists ? 'EXISTS' : 'MISSING'}`);
      
      if (exists) {
        try {
          const size = await templateService.getAssetSize(assetName);
          console.log(`  Size: ${size} bytes`);
        } catch (error) {
          console.log(`  Size: Unable to determine`);
        }
      }
    }

  } catch (error) {
    console.error('Validation error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 5: Individual Manager Usage
 */
export async function individualManagerExample() {
  // Using TemplateManager directly
  const templateManager = new TemplateManager();
  
  console.log('Template paths:');
  console.log('- Template:', templateManager.getTemplatePath());
  console.log('- Brand guideline:', templateManager.getBrandGuidelinePath());
  
  // Using BrandAssetManager directly
  const assetManager = new BrandAssetManager();
  
  console.log('Asset paths:');
  console.log('- Base path:', assetManager.getAssetBasePath());
  console.log('- Logo path:', assetManager.getAssetPath('Logo MFEC.png'));
  
  // Validate individual components
  try {
    const templateValidation = await templateManager.validateTemplateAssets();
    console.log('Template validation:', templateValidation.isValid);
    
    const logoExists = await assetManager.validateAsset('Logo MFEC.png');
    console.log('Logo exists:', logoExists);
    
  } catch (error) {
    console.error('Individual manager error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 6: Cache Management
 */
export async function cacheManagementExample() {
  const templateService = new MFECTemplateService();

  try {
    // Load templates to populate cache
    console.log('Loading templates to populate cache...');
    await templateService.loadTemplate('system_manual');
    await templateService.loadTemplate('user_manual');
    await templateService.getBrandAssets();

    console.log('Templates loaded and cached');

    // Clear caches
    console.log('Clearing all caches...');
    templateService.clearCaches();
    
    console.log('Caches cleared');

    // Load again (should re-fetch from disk)
    console.log('Reloading templates after cache clear...');
    await templateService.loadTemplate('system_manual');
    
    console.log('Templates reloaded successfully');

  } catch (error) {
    console.error('Cache management error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('=== MFEC Template System Examples ===\n');

  console.log('1. Basic Template Usage:');
  await basicTemplateUsage();
  console.log('\n');

  console.log('2. Asset Management:');
  await assetManagementExample();
  console.log('\n');

  console.log('3. Complete Configuration:');
  await completeConfigurationExample();
  console.log('\n');

  console.log('4. Validation:');
  await validationExample();
  console.log('\n');

  console.log('5. Individual Managers:');
  await individualManagerExample();
  console.log('\n');

  console.log('6. Cache Management:');
  await cacheManagementExample();
  console.log('\n');

  console.log('=== Examples Complete ===');
}

// Individual examples are already exported above