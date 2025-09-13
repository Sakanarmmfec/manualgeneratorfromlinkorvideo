/**
 * Free Tier Document Storage Manager
 * Handles document storage using free cloud storage services
 */

import { environmentManager } from '@/config/environment';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';

export interface StorageConfig {
  provider: 'local' | 'google-drive' | 'dropbox';
  maxFileSize: number; // MB
  maxStorageSize: number; // MB
  retentionDays: number;
  cleanupEnabled: boolean;
}

export interface StoredDocument {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  expiresAt?: Date;
  downloadUrl?: string;
  metadata: {
    sourceUrl?: string;
    documentType?: string;
    userId?: string;
  };
}

class FreeTierStorageManager {
  private config: StorageConfig;
  private documentsIndex: Map<string, StoredDocument> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = this.loadStorageConfig();
    this.loadDocumentsIndex();
    this.startCleanupScheduler();
  }

  private loadStorageConfig(): StorageConfig {
    const isFreeTier = environmentManager.isFreeTier();
    const platform = environmentManager.getPlatform();

    return {
      provider: (process.env.STORAGE_PROVIDER as 'local' | 'google-drive' | 'dropbox') || 'local',
      maxFileSize: isFreeTier ? 10 : 50, // MB
      maxStorageSize: isFreeTier ? 100 : 1000, // MB
      retentionDays: isFreeTier ? 7 : 30, // Keep documents for 7 days on free tier
      cleanupEnabled: true,
    };
  }

  private getStorageDirectory(): string {
    return path.join(process.cwd(), 'exports');
  }

  private getIndexFilePath(): string {
    return path.join(this.getStorageDirectory(), '.storage-index.json');
  }

  private loadDocumentsIndex(): void {
    try {
      const indexPath = this.getIndexFilePath();
      if (fs.existsSync(indexPath)) {
        const indexData = fs.readFileSync(indexPath, 'utf-8');
        const documents = JSON.parse(indexData);
        
        // Convert dates back from JSON
        for (const doc of documents) {
          doc.createdAt = new Date(doc.createdAt);
          if (doc.expiresAt) {
            doc.expiresAt = new Date(doc.expiresAt);
          }
          this.documentsIndex.set(doc.id, doc);
        }
        
        logger.info(`Loaded ${documents.length} documents from storage index`);
      }
    } catch (error) {
      logger.error('Failed to load documents index:', error);
    }
  }

  private saveDocumentsIndex(): void {
    try {
      const storageDir = this.getStorageDirectory();
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      const documents = Array.from(this.documentsIndex.values());
      const indexPath = this.getIndexFilePath();
      fs.writeFileSync(indexPath, JSON.stringify(documents, null, 2));
    } catch (error) {
      logger.error('Failed to save documents index:', error);
    }
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private startCleanupScheduler(): void {
    if (!this.config.cleanupEnabled) return;

    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredDocuments();
    }, 60 * 60 * 1000);

    // Run initial cleanup
    setTimeout(() => this.cleanupExpiredDocuments(), 5000);
  }

  private async cleanupExpiredDocuments(): Promise<void> {
    try {
      const now = new Date();
      let cleanedCount = 0;
      let freedSpace = 0;

      for (const [id, doc] of this.documentsIndex.entries()) {
        const shouldDelete = 
          (doc.expiresAt && doc.expiresAt < now) ||
          (this.config.retentionDays > 0 && 
           (now.getTime() - doc.createdAt.getTime()) > (this.config.retentionDays * 24 * 60 * 60 * 1000));

        if (shouldDelete) {
          const deleted = await this.deleteDocument(id);
          if (deleted) {
            cleanedCount++;
            freedSpace += doc.size;
          }
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleanup completed: ${cleanedCount} documents deleted, ${Math.round(freedSpace / 1024 / 1024)}MB freed`);
      }
    } catch (error) {
      logger.error('Document cleanup failed:', error);
    }
  }

  public async storeDocument(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    metadata: StoredDocument['metadata'] = {}
  ): Promise<{ success: boolean; document?: StoredDocument; error?: string }> {
    try {
      // Check file size
      const fileSizeMB = fileBuffer.length / 1024 / 1024;
      if (fileSizeMB > this.config.maxFileSize) {
        return {
          success: false,
          error: `File size (${Math.round(fileSizeMB)}MB) exceeds limit (${this.config.maxFileSize}MB)`
        };
      }

      // Check total storage usage
      const currentUsage = await this.getStorageUsage();
      if (currentUsage.totalSizeMB + fileSizeMB > this.config.maxStorageSize) {
        return {
          success: false,
          error: `Storage limit exceeded. Current: ${Math.round(currentUsage.totalSizeMB)}MB, Limit: ${this.config.maxStorageSize}MB`
        };
      }

      const documentId = this.generateDocumentId();
      const filename = `${documentId}_${originalName}`;
      const filePath = path.join(this.getStorageDirectory(), filename);

      // Ensure storage directory exists
      const storageDir = this.getStorageDirectory();
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(filePath, fileBuffer);

      // Create document record
      const document: StoredDocument = {
        id: documentId,
        filename,
        originalName,
        size: fileBuffer.length,
        mimeType,
        createdAt: new Date(),
        expiresAt: this.config.retentionDays > 0 
          ? new Date(Date.now() + this.config.retentionDays * 24 * 60 * 60 * 1000)
          : undefined,
        metadata,
      };

      // Add to index
      this.documentsIndex.set(documentId, document);
      this.saveDocumentsIndex();

      logger.info(`Document stored: ${originalName} (${Math.round(fileSizeMB)}MB)`);
      return { success: true, document };

    } catch (error) {
      logger.error('Failed to store document:', error);
      return { success: false, error: 'Storage operation failed' };
    }
  }

  public async getDocument(documentId: string): Promise<{ success: boolean; document?: StoredDocument; buffer?: Buffer; error?: string }> {
    try {
      const document = this.documentsIndex.get(documentId);
      if (!document) {
        return { success: false, error: 'Document not found' };
      }

      // Check if document has expired
      if (document.expiresAt && document.expiresAt < new Date()) {
        await this.deleteDocument(documentId);
        return { success: false, error: 'Document has expired' };
      }

      const filePath = path.join(this.getStorageDirectory(), document.filename);
      if (!fs.existsSync(filePath)) {
        // File missing, remove from index
        this.documentsIndex.delete(documentId);
        this.saveDocumentsIndex();
        return { success: false, error: 'Document file not found' };
      }

      const buffer = fs.readFileSync(filePath);
      return { success: true, document, buffer };

    } catch (error) {
      logger.error('Failed to retrieve document:', error);
      return { success: false, error: 'Retrieval operation failed' };
    }
  }

  public async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const document = this.documentsIndex.get(documentId);
      if (!document) {
        return false;
      }

      const filePath = path.join(this.getStorageDirectory(), document.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      this.documentsIndex.delete(documentId);
      this.saveDocumentsIndex();

      logger.info(`Document deleted: ${document.originalName}`);
      return true;

    } catch (error) {
      logger.error('Failed to delete document:', error);
      return false;
    }
  }

  public async listDocuments(userId?: string): Promise<StoredDocument[]> {
    const documents = Array.from(this.documentsIndex.values());
    
    if (userId) {
      return documents.filter(doc => doc.metadata.userId === userId);
    }
    
    return documents;
  }

  public async getStorageUsage(): Promise<{
    totalDocuments: number;
    totalSizeMB: number;
    usagePercentage: number;
    oldestDocument?: Date;
    newestDocument?: Date;
  }> {
    const documents = Array.from(this.documentsIndex.values());
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const totalSizeMB = totalSize / 1024 / 1024;

    const dates = documents.map(doc => doc.createdAt).sort();
    
    return {
      totalDocuments: documents.length,
      totalSizeMB,
      usagePercentage: (totalSizeMB / this.config.maxStorageSize) * 100,
      oldestDocument: dates[0],
      newestDocument: dates[dates.length - 1],
    };
  }

  public getConfig(): StorageConfig {
    return this.config;
  }

  public cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton instance
export const storageManager = new FreeTierStorageManager();

// Helper functions
export const storage = {
  store: (buffer: Buffer, name: string, mimeType: string, metadata?: StoredDocument['metadata']) =>
    storageManager.storeDocument(buffer, name, mimeType, metadata),
  get: (id: string) => storageManager.getDocument(id),
  delete: (id: string) => storageManager.deleteDocument(id),
  list: (userId?: string) => storageManager.listDocuments(userId),
  usage: () => storageManager.getStorageUsage(),
};

// Google Drive integration setup instructions
export function getGoogleDriveSetupInstructions(): {
  steps: string[];
  environmentVariables: { key: string; description: string }[];
  limitations: string[];
} {
  return {
    steps: [
      '1. Go to Google Cloud Console (console.cloud.google.com)',
      '2. Create a new project or select existing project',
      '3. Enable Google Drive API',
      '4. Create credentials (Service Account)',
      '5. Download the service account key JSON file',
      '6. Set GOOGLE_DRIVE_CREDENTIALS environment variable with the JSON content',
      '7. Create a shared folder in Google Drive',
      '8. Share the folder with the service account email',
      '9. Set GOOGLE_DRIVE_FOLDER_ID with the folder ID',
    ],
    environmentVariables: [
      {
        key: 'STORAGE_PROVIDER',
        description: 'Set to "google-drive" to enable Google Drive storage'
      },
      {
        key: 'GOOGLE_DRIVE_CREDENTIALS',
        description: 'Service account credentials JSON (base64 encoded for security)'
      },
      {
        key: 'GOOGLE_DRIVE_FOLDER_ID',
        description: 'ID of the Google Drive folder for document storage'
      }
    ],
    limitations: [
      'Google Drive API has daily quotas (free tier: 1 billion queries/day)',
      'File upload size limit: 5TB (but free tier storage is 15GB total)',
      'Rate limiting: 1000 requests per 100 seconds per user',
      'Service account requires folder sharing permissions',
    ]
  };
}