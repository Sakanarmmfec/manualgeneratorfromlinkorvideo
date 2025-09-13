# Download and Export Interface Components

This directory contains components for handling document downloads and export functionality, implementing task 14 of the Thai Document Generator specification.

## Components

### DownloadInterface
Main component that orchestrates the entire download experience.

**Features:**
- Integrates all download-related components
- Manages download state and progress
- Handles success/error notifications
- Provides quick action buttons for common downloads

**Usage:**
```tsx
import { DownloadInterface } from '@/components/download/DownloadInterface';

<DownloadInterface
  document={generatedDocument}
  onDownloadComplete={(filename, format) => console.log('Downloaded:', filename)}
  onDownloadError={(error) => console.error('Download failed:', error)}
/>
```

### DownloadPanel
Comprehensive download configuration panel with format selection and options.

**Features:**
- PDF/DOCX format selection with visual indicators
- Automatic filename generation with source attribution
- Advanced options (compression, watermark, etc.)
- File naming conventions following MFEC standards
- Document information display

**Usage:**
```tsx
import { DownloadPanel } from '@/components/download/DownloadPanel';

<DownloadPanel
  document={document}
  onDownload={async (options) => {
    // Handle download with specified options
  }}
  isDownloading={false}
  downloadProgress={0}
/>
```

### DownloadProgress
Real-time progress tracking with stage indicators and time estimates.

**Features:**
- Multi-stage progress visualization
- Estimated time remaining
- Elapsed time tracking
- Error handling with retry options
- Cancel functionality
- Success/completion notifications

**Usage:**
```tsx
import { DownloadProgress } from '@/components/download/DownloadProgress';

<DownloadProgress
  progress={75}
  format="pdf"
  filename="document.pdf"
  status="generating"
  estimatedTimeRemaining={30}
  onCancel={() => cancelDownload()}
  onRetry={() => retryDownload()}
/>
```

### ExportHistory
Document management with export history and file organization.

**Features:**
- Export history tracking with metadata
- Search and filtering capabilities
- File status management (completed/expired/error)
- Re-download functionality for available files
- Storage lifecycle notifications
- Bulk operations support

**Usage:**
```tsx
import { ExportHistory } from '@/components/download/ExportHistory';

<ExportHistory documentId="doc-123" />
```

## File Naming Conventions

The download system implements intelligent file naming with source attribution:

### Format Pattern
```
{document-title}-{source-domain}-{date}.{extension}
```

### Examples
- `user-manual-example-com-2024-01-15.pdf`
- `product-guide-youtube-com-2024-01-15.docx`
- `installation-manual-github-io-2024-01-15.pdf`

### Rules
1. Document title is sanitized (special characters removed, spaces to hyphens)
2. Source domain excludes 'www.' prefix
3. Date format is YYYY-MM-DD
4. All lowercase for consistency
5. Thai characters are preserved in the title

## Download Options

### DownloadOptions Interface
```typescript
interface DownloadOptions {
  format: 'pdf' | 'docx';
  filename: string;
  includeSourceAttribution: boolean;
  includeGenerationDate: boolean;
  includeWatermark: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
}
```

### Default Settings
- **Source Attribution**: Enabled (requirement 8.1, 8.2)
- **Generation Date**: Enabled
- **Watermark**: Disabled
- **Compression**: Medium

## Progress Tracking

### Download Stages
1. **Preparing** (0-15%): Initial setup and validation
2. **Processing** (15-45%): Content processing and formatting
3. **Generating** (45-85%): Document generation and styling
4. **Finalizing** (85-100%): Final formatting and optimization

### Status Types
- `preparing`: Initial setup
- `processing`: Content processing
- `generating`: Document creation
- `finalizing`: Final touches
- `complete`: Successfully finished
- `error`: Failed with error message

## Export History Management

### Record Structure
```typescript
interface ExportRecord {
  id: string;
  documentId: string;
  filename: string;
  format: 'pdf' | 'docx';
  fileSize: number;
  downloadUrl?: string;
  exportedAt: Date;
  options: DownloadOptions;
  status: 'completed' | 'expired' | 'error';
}
```

### Features
- **Search**: Filter by filename
- **Format Filter**: PDF/DOCX/All
- **Status Filter**: Completed/Expired/All
- **Sorting**: Newest first by default
- **Pagination**: Show 3 initially, expand to show all
- **Actions**: Re-download, delete records

### Storage Lifecycle
- Files are stored for 7 days after generation
- Expired files show status but cannot be downloaded
- Users are notified about storage limitations
- Automatic cleanup of expired records

## Integration with MFEC Standards

### Brand Compliance
- Uses MFEC color scheme and typography
- Includes MFEC logo and branding elements
- Follows MFEC document formatting standards
- Maintains source attribution per requirements

### Localization
- All text in Thai language
- Thai date/time formatting
- Cultural considerations for file naming
- Appropriate terminology for technical concepts

## Error Handling

### Error Types
1. **Network Errors**: Connection issues during download
2. **Server Errors**: Backend processing failures
3. **Format Errors**: Unsupported format or corruption
4. **Storage Errors**: Insufficient space or permissions

### Recovery Options
- **Retry**: Attempt download again with same options
- **Cancel**: Abort current download
- **Alternative Format**: Try different format if one fails
- **Manual Download**: Fallback to basic download

## Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper tab order and focus management
- Screen reader compatible labels and descriptions

### Visual Indicators
- High contrast status indicators
- Progress visualization with multiple cues
- Clear error messaging with actionable steps
- Loading states with appropriate feedback

## Performance Considerations

### Optimization
- Lazy loading of export history
- Debounced search functionality
- Efficient progress updates (not every millisecond)
- Memory management for large file lists

### Scalability
- Pagination for large export histories
- Efficient filtering algorithms
- Minimal re-renders during progress updates
- Cleanup of completed download states

## Testing Strategy

### Unit Tests
- Component rendering with various props
- Download option validation
- Filename generation logic
- Progress calculation accuracy

### Integration Tests
- Complete download workflow
- Error handling scenarios
- Export history management
- File naming conventions

### User Experience Tests
- Download progress feedback
- Error recovery flows
- Mobile responsiveness
- Accessibility compliance

## Future Enhancements

### Planned Features
1. **Batch Downloads**: Multiple documents at once
2. **Cloud Storage**: Integration with Google Drive, Dropbox
3. **Email Delivery**: Send documents via email
4. **Template Customization**: User-defined export templates
5. **Analytics**: Download statistics and usage patterns

### Technical Improvements
1. **Background Downloads**: Non-blocking download process
2. **Resume Capability**: Resume interrupted downloads
3. **Compression Options**: More granular compression settings
4. **Format Extensions**: Additional export formats (HTML, EPUB)
5. **API Integration**: Real backend implementation