# Project Structure

## Current Organization
```
.
├── .kiro/           # Kiro AI assistant configuration
│   └── steering/    # AI guidance documents
└── .qodo/          # Qodo configuration (if applicable)
```

## Recommended Structure Guidelines
As the project grows, follow these organizational principles:

### Source Code Organization
- Keep source code in a dedicated `src/` directory
- Separate business logic from presentation layer
- Group related functionality into modules/packages
- Use clear, descriptive naming conventions

### Configuration Files
- Keep configuration files at project root
- Use environment-specific config files when needed
- Document configuration options and defaults

### Documentation
- Maintain a comprehensive README.md
- Include API documentation where applicable
- Keep documentation close to relevant code
- Use consistent documentation format

### Testing
- Mirror source structure in test directories
- Keep unit tests close to source files
- Separate integration and end-to-end tests
- Include test data and fixtures in organized manner

### Assets and Resources
- Organize static assets in dedicated directories
- Use consistent naming for images, styles, etc.
- Keep build artifacts separate from source

## Naming Conventions
- Use consistent case conventions (camelCase, snake_case, etc.)
- Choose descriptive names over abbreviated ones
- Follow language-specific conventions
- Be consistent across the entire codebase