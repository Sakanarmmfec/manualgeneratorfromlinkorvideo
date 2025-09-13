// Core application types based on the design document

export interface DocumentRequest {
  productUrl: string;
  documentType: 'user_manual' | 'product_document';
  language: 'thai';
  mfecTemplate: string;
  includeImages: boolean;
  customInstructions?: string;
}

export interface ExtractedContent {
  url: string;
  title: string;
  contentType: 'website' | 'youtube_video';
  textContent: string;
  videoContent?: VideoContent;
  images: ImageData[];
  metadata: ContentMetadata;
  extractionTimestamp: Date;
}

export interface VideoContent {
  videoId: string;
  duration: number;
  transcript: string;
  keyMoments: VideoMoment[];
  screenshots: VideoScreenshot[];
  audioAnalysis?: AudioAnalysis;
}

export interface VideoMoment {
  timestamp: number;
  description: string;
  importance: 'high' | 'medium' | 'low';
  actionType: 'step' | 'explanation' | 'demonstration' | 'result';
  screenshot?: string;
}

export interface VideoScreenshot {
  timestamp: number;
  imageUrl: string;
  caption: string;
  relevanceScore: number;
  associatedStep?: string;
}

export interface ProcessedContent {
  translatedContent: string;
  organizedSections: DocumentSection[];
  refinedContent: string;
  sourceAttribution: SourceInfo;
  qualityScore: number;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  level?: number; // Section hierarchy level (1, 2, 3, etc.)
  subsections: DocumentSection[];
  images: ImagePlacement[];
  sectionType: 'introduction' | 'features' | 'installation' | 'usage' | 'troubleshooting' | 'specifications';
}

export interface ImageData {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ImagePlacement {
  imageId: string;
  position: 'top' | 'bottom' | 'inline';
  caption: string;
  size: 'small' | 'medium' | 'large';
}

export interface ContentMetadata {
  title: string;
  description?: string;
  author?: string;
  publishDate?: Date;
  language: string;
  tags: string[];
}

export interface SourceInfo {
  originalUrl: string;
  extractionDate: Date;
  contentType: string;
  attribution: string;
}

export interface AudioAnalysis {
  duration: number;
  language: string;
  quality: 'high' | 'medium' | 'low';
  hasMusic: boolean;
  speechSegments: SpeechSegment[];
}

export interface SpeechSegment {
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

export interface GenerationInfo {
  generatedAt: Date;
  processingTime: number;
  aiModel: string;
  version: string;
}

// Configuration and Security Types
export interface LLMConfiguration {
  baseUrl: string; // https://gpt.mfec.co.th/litellm
  apiKeyRef: string; // Reference to secure storage, not the actual key
  chatModel: string; // gpt-4o for content generation and chatbot
  embeddingModel: string; // text-embedding-3-large for RAG system
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface SecureConfig {
  llmApiKey: string; // Stored securely, never in code
  userApiKey?: string; // Optional user-provided API key for fallback
  encryptionKey: string;
  environment: 'development' | 'staging' | 'production';
  allowUserApiKeys: boolean;
}

export interface APIKeyManager {
  primaryKey: string; // Main MFEC API key
  fallbackKey?: string; // User-provided key when primary is exhausted
  keyStatus: 'active' | 'exhausted' | 'invalid' | 'testing';
  validateKey(key: string): Promise<boolean>;
  switchToFallback(): void;
  resetToPrimary(): void;
  getCurrentKey(): string | null;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UserApiKeyInput {
  apiKey: string;
  isTemporary: boolean; // Session-based storage only
}

// Error types for configuration management
export class ConfigurationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class APIKeyError extends Error {
  constructor(message: string, public code: string, public isRecoverable: boolean = true) {
    super(message);
    this.name = 'APIKeyError';
  }
}

// MFEC Template and Asset Management Types
export interface MFECTemplate {
  templatePath: string; // Path to MFEC_System&User_Manual_Template.docx
  brandGuidelinePath: string; // Path to ENG_MFEC Brand Guideline
  logoAssets: {
    standard: string; // Logo MFEC.png
    white: string; // Logo MFEC White.png
    ai: string; // Logo MFEC More. 2023ai.ai
  };
  documentType: 'system_manual' | 'user_manual';
  styleSettings: BrandStyleSettings;
}

export interface BrandStyleSettings {
  primaryColors: string[];
  fonts: FontSettings;
  spacing: SpacingSettings;
  headerFooterSettings: HeaderFooterConfig;
  logoPlacement: LogoPlacementConfig;
}

export interface FontSettings {
  primaryFont: string;
  secondaryFont: string;
  headerFont: string;
  bodyFont: string;
  sizes: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
  };
}

export interface SpacingSettings {
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  padding: {
    section: number;
    paragraph: number;
  };
  lineHeight: number;
}

export interface HeaderFooterConfig {
  includeHeader: boolean;
  includeFooter: boolean;
  headerHeight: number;
  footerHeight: number;
  logoPosition: 'left' | 'center' | 'right';
}

export interface LogoPlacementConfig {
  headerLogo: 'standard' | 'white' | 'ai';
  footerLogo: 'standard' | 'white' | 'ai';
  documentLogo: 'standard' | 'white' | 'ai';
  maxWidth: number;
  maxHeight: number;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  templateExists: boolean;
  assetsExist: boolean;
  brandGuidelineExists: boolean;
}

export interface BrandAsset {
  name: string;
  path: string;
  type: 'logo' | 'template' | 'guideline';
  format: string;
  size?: number;
  lastModified?: Date;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  content: ProcessedContent;
  template: MFECTemplate;
  sourceAttribution: SourceInfo;
  generationMetadata: GenerationInfo;
  previewUrl: string;
  downloadFormats: string[];
}

// Template and Asset Management Errors
export class TemplateError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TemplateError';
  }
}

export class AssetError extends Error {
  constructor(message: string, public code: string, public assetPath?: string) {
    super(message);
    this.name = 'AssetError';
  }
}