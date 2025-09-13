# Document Preview and Editing Components

This directory contains components for previewing and editing generated documents with MFEC formatting standards.

## Components

### DocumentPreview
Main component that displays the generated document with MFEC formatting and provides editing capabilities.

**Features:**
- Document header with MFEC branding
- Section-by-section content display
- Inline editing mode toggle
- Image preview and management
- Source attribution display
- Download functionality

**Props:**
- `document`: GeneratedDocument - The document to preview
- `onDocumentUpdate`: Function to handle document updates
- `onSave`: Function to save document changes
- `onDownload`: Function to download document in specified format
- `isEditing`: Boolean to control edit mode
- `onEditModeChange`: Function to toggle edit mode

### SectionEditor
Rich text editor for individual document sections with validation.

**Features:**
- Title and content editing
- Rich text formatting toolbar (bold, italic, lists, headings)
- Real-time validation
- Preview mode toggle
- Character and word count
- Markdown support

**Props:**
- `section`: DocumentSection - The section to edit
- `onUpdate`: Function called when section is updated
- `onCancel`: Function called when editing is cancelled
- `onSave`: Function called when changes are saved

### ImagePreview
Component for displaying and editing images within document sections.

**Features:**
- Image display with zoom functionality
- Caption editing
- Position control (top, inline, bottom)
- Size adjustment (small, medium, large)
- Image replacement
- Image removal

**Props:**
- `image`: ImagePlacement - The image to display
- `sectionId`: String - ID of the containing section
- `onUpdate`: Function to handle image updates
- `isEditing`: Boolean to show/hide edit controls

### DocumentToolbar
Toolbar with document-level controls and status indicators.

**Features:**
- Edit mode toggle
- Save functionality with unsaved changes indicator
- Download buttons (PDF, DOCX)
- Status indicators (saved/unsaved)
- Help text and warnings

**Props:**
- `isEditing`: Boolean - Current edit mode state
- `hasUnsavedChanges`: Boolean - Whether there are unsaved changes
- `onEditModeChange`: Function to toggle edit mode
- `onSave`: Function to save changes
- `onDownload`: Function to download document

## Usage Example

```tsx
import { DocumentPreview } from '@/components/preview';
import { GeneratedDocument } from '@/types';

function DocumentPage() {
  const [document, setDocument] = useState<GeneratedDocument>(/* ... */);
  const [isEditing, setIsEditing] = useState(false);

  const handleDocumentUpdate = (updatedDocument: GeneratedDocument) => {
    setDocument(updatedDocument);
  };

  const handleSave = async () => {
    // Save document to backend
    await saveDocument(document);
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    // Trigger document download
    await downloadDocument(document.id, format);
  };

  return (
    <DocumentPreview
      document={document}
      onDocumentUpdate={handleDocumentUpdate}
      onSave={handleSave}
      onDownload={handleDownload}
      isEditing={isEditing}
      onEditModeChange={setIsEditing}
    />
  );
}
```

## Styling

The components use MFEC-specific CSS classes for consistent branding:

- `.mfec-card` - MFEC-styled card components
- `.mfec-shadow` - MFEC shadow styles
- `.mfec-heading` - MFEC heading typography
- `.mfec-text` - MFEC body text styles
- `.mfec-content` - MFEC content formatting
- `.mfec-document-content` - Document-specific content styles
- `.mfec-logo` - MFEC logo container styles

## Validation

### Section Editor Validation
- Title: Required, max 200 characters
- Content: Required, max 10,000 characters
- Real-time validation with error messages
- Save button disabled when validation fails

### Image Editor Validation
- Caption: Optional, recommended for accessibility
- Position: Must be 'top', 'inline', or 'bottom'
- Size: Must be 'small', 'medium', or 'large'
- File type: Images only (jpg, png, gif, webp)

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management in edit modes

## Testing

All components include comprehensive unit tests covering:
- Rendering with various props
- User interactions (clicking, typing, etc.)
- Validation logic
- Callback function calls
- Error states
- Accessibility features

Run tests with:
```bash
npm test src/components/preview
```

## Performance Considerations

- Images are lazy-loaded and optimized
- Large content is virtualized when needed
- Debounced validation to prevent excessive re-renders
- Memoized components to prevent unnecessary updates
- Efficient diff algorithms for section updates

## Future Enhancements

- Collaborative editing support
- Version history and change tracking
- Advanced rich text formatting
- Drag-and-drop image reordering
- Bulk section operations
- Export to additional formats
- Integration with MFEC template system
- Real-time preview updates