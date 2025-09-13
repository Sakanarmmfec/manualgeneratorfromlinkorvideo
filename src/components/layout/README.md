# Layout Components

This directory contains the main layout components for the Thai Document Generator application, implementing MFEC branding and responsive design.

## Components Overview

### MainLayout
The primary layout wrapper that provides the overall application structure.

**Features:**
- Responsive design with mobile-first approach
- MFEC brand styling and colors
- Proper semantic HTML structure
- Accessibility considerations

**Usage:**
```tsx
import { MainLayout } from '@/components/layout';

export default function Page() {
  return (
    <MainLayout>
      <div>Your page content</div>
    </MainLayout>
  );
}
```

### Header
Application header with MFEC branding and navigation.

**Features:**
- MFEC logo and application title
- Responsive navigation menu
- Mobile menu toggle
- Settings button
- Professional MFEC styling

**Key Elements:**
- Logo: `/mfec-logo.png` with proper alt text
- Title: "Thai Document Generator"
- Subtitle: "MFEC Automated Documentation System"
- Navigation links for main sections

### Footer
Application footer with MFEC company information and source attribution.

**Features:**
- MFEC company branding and contact information
- Application information and version
- Source attribution notice (requirement 8.2)
- External links to MFEC website
- Copyright information

**Key Elements:**
- Company information and description
- Contact details (website, email, phone)
- Application version and description
- "Powered by MFEC AI" branding

### Container
Responsive container component for consistent content width and spacing.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'lg')
- `className`: Additional CSS classes
- `children`: Content to wrap

### MobileMenu
Slide-out mobile navigation menu with full application navigation.

**Features:**
- Smooth slide animation
- Backdrop overlay
- Complete navigation structure
- Descriptive menu items
- Proper accessibility labels

### StatusBar
Real-time system status indicator showing connection and API status.

**Features:**
- Online/offline detection
- API connection status
- Last update timestamp
- Visual status indicators
- Thai language labels

## MFEC Branding Implementation

### Colors
The layout uses MFEC brand colors defined in `tailwind.config.js`:
- Primary blue palette: `#2563eb` to `#1d4ed8`
- Secondary gray palette for text and backgrounds
- Accent colors for highlights and interactive elements

### Typography
- Headers: 'Prompt' font family for Thai compatibility
- Body text: 'Sarabun' font family for Thai readability
- Consistent font weights and sizing

### Custom CSS Classes
Defined in `globals.css`:
- `.mfec-gradient`: Primary brand gradient
- `.mfec-shadow`: Brand-colored shadows
- `.mfec-card`: Consistent card styling
- `.mfec-header`: Header-specific styling
- `.mfec-footer`: Footer-specific styling

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Optimizations
- Collapsible navigation menu
- Touch-friendly button sizes
- Optimized spacing and typography
- Proper viewport configuration

## Accessibility Features

### Semantic HTML
- Proper use of `<header>`, `<main>`, `<footer>` elements
- Navigation landmarks
- Heading hierarchy

### ARIA Labels
- Button descriptions in Thai
- Menu state indicators
- Screen reader friendly navigation

### Keyboard Navigation
- Tab order optimization
- Focus indicators
- Keyboard shortcuts support

## Testing

### Test Coverage
- Component rendering tests
- MFEC branding verification
- Responsive behavior testing
- Accessibility compliance
- User interaction testing

### Running Tests
```bash
npm test -- src/components/layout/__tests__/
```

## Requirements Compliance

This implementation satisfies the following requirements:

### Requirement 3.4 (MFEC Format Standards)
- ✅ Consistent MFEC branding throughout the layout
- ✅ Official logo usage and placement
- ✅ Brand color scheme implementation
- ✅ Professional typography and spacing

### Requirement 8.2 (Source Attribution)
- ✅ Clear source attribution in footer
- ✅ "Generated documents include source attribution as required"
- ✅ MFEC company information and branding
- ✅ "Powered by MFEC AI" attribution

## File Structure

```
src/components/layout/
├── MainLayout.tsx          # Main layout wrapper
├── Header.tsx              # Application header
├── Footer.tsx              # Application footer
├── Container.tsx           # Responsive container
├── MobileMenu.tsx          # Mobile navigation
├── StatusBar.tsx           # System status indicator
├── index.ts                # Component exports
├── __tests__/              # Test files
│   ├── MainLayout.test.tsx
│   ├── Header.test.tsx
│   └── Footer.test.tsx
└── README.md               # This documentation
```

## Future Enhancements

### Planned Improvements
- Dark mode support with MFEC brand colors
- Enhanced animations and transitions
- Additional accessibility features
- Performance optimizations
- Internationalization support

### Customization Options
- Theme switching capability
- Layout density options
- Navigation customization
- Brand asset variations