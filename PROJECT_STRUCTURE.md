# Project Structure

This document outlines the complete project structure for the Thai Document Generator application.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest with React Testing Library
- **Build Tools**: Next.js built-in bundler
- **Linting**: ESLint with Next.js configuration
- **Formatting**: Prettier with Tailwind CSS plugin

## Directory Structure

```
thai-document-generator/
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment variables (gitignored)
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore rules
├── .prettierrc                     # Prettier configuration
├── next.config.js                  # Next.js configuration
├── next-env.d.ts                   # Next.js TypeScript declarations
├── package.json                    # Dependencies and scripts
├── postcss.config.js               # PostCSS configuration
├── PROJECT_STRUCTURE.md            # This file
├── README.md                       # Project documentation
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts                # Vitest testing configuration
│
├── .kiro/                          # Kiro AI assistant configuration
│   ├── specs/                      # Feature specifications
│   │   └── thai-document-generator/
│   │       ├── requirements.md     # Project requirements
│   │       ├── design.md          # System design document
│   │       └── tasks.md           # Implementation tasks
│   └── steering/                   # AI guidance documents
│
├── .qodo/                          # MFEC templates and brand assets
│   └── Template/                   # Official MFEC templates and logos
│
└── src/                            # Source code
    ├── app/                        # Next.js App Router
    │   ├── api/                    # API routes (backend endpoints)
    │   ├── globals.css             # Global styles
    │   ├── layout.tsx              # Root layout component
    │   ├── page.tsx                # Home page component
    │   └── page.test.tsx           # Home page tests
    │
    ├── components/                 # React components
    │   ├── ui/                     # Reusable UI components
    │   └── layout/                 # Layout-specific components
    │
    ├── hooks/                      # Custom React hooks
    ├── lib/                        # Utility functions and shared libraries
    │   ├── utils.ts                # Common utility functions
    │   └── utils.test.ts           # Utility function tests
    │
    ├── services/                   # Business logic and API services
    ├── test/                       # Test configuration and utilities
    │   └── setup.ts                # Test environment setup
    │
    ├── types/                      # TypeScript type definitions
    │   └── index.ts                # Core application types
    │
    └── utils/                      # Helper functions
```

## Key Configuration Files

### package.json Scripts
- `dev`: Start development server
- `build`: Build for production
- `start`: Start production server
- `lint`: Run ESLint
- `type-check`: Run TypeScript type checking
- `test`: Run tests once
- `test:watch`: Run tests in watch mode
- `test:ui`: Run tests with UI

### Environment Variables
See `.env.example` for required environment variables:
- `MFEC_LLM_BASE_URL`: MFEC LiteLLM endpoint
- `MFEC_LLM_API_KEY`: API key for MFEC services
- `MFEC_LLM_CHAT_MODEL`: Chat model (gpt-4o)
- `MFEC_LLM_EMBEDDING_MODEL`: Embedding model (text-embedding-3-large)

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured for clean imports
- Test files excluded from build
- Next.js plugin integration

### Testing Setup
- Vitest for unit testing
- React Testing Library for component testing
- jsdom environment for DOM testing
- Global test utilities and mocks

## Development Workflow

1. **Setup**: Clone repository and run `npm install`
2. **Environment**: Copy `.env.example` to `.env.local` and configure
3. **Development**: Run `npm run dev` to start development server
4. **Testing**: Run `npm test` for unit tests
5. **Type Checking**: Run `npm run type-check` for TypeScript validation
6. **Linting**: Run `npm run lint` for code quality checks
7. **Building**: Run `npm run build` for production build

## Code Organization Principles

### Components
- UI components in `src/components/ui/`
- Layout components in `src/components/layout/`
- Page-specific components co-located with pages

### Services
- Business logic separated from UI components
- API integrations in dedicated service files
- Error handling and data transformation

### Types
- Centralized type definitions in `src/types/`
- Interface-based architecture
- Strict typing for all data models

### Testing
- Unit tests co-located with source files
- Integration tests for complete workflows
- Mocked external dependencies

## Next Steps

This project structure is now ready for implementation of the remaining tasks:

1. **Task 2**: Implement secure configuration and API key management
2. **Task 3**: Create MFEC template and asset management system
3. **Task 4**: Enhance YouTube processing and implement website content extraction
4. **Task 5**: Build AI processing engine with MFEC LLM integration

Each subsequent task will build upon this foundation, following the established patterns and conventions.