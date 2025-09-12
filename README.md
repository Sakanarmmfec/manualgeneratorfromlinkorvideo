# Thai Document Generator

An AI-powered application that automatically generates professional Thai user manuals and product documents following MFEC's format standards.

## Features

- 🌐 **Multi-Source Content**: Process both product URLs and YouTube videos
- 🤖 **AI-Powered**: Uses MFEC's LiteLLM endpoint with GPT-4o for intelligent content processing
- 📄 **MFEC Standards**: Follows official MFEC format guidelines and branding
- 🎥 **Video Processing**: Analyze YouTube videos, extract key steps, and capture screenshots
- 🔍 **RAG System**: Search and chat with previously generated documents
- 🌏 **Thai Language**: Native Thai language support with natural translation
- 📱 **Responsive UI**: Modern web interface with preview and editing capabilities

## Technology Stack

- **AI Models**: GPT-4o (content generation), text-embedding-3-large (RAG)
- **API Endpoint**: MFEC LiteLLM (https://gpt.mfec.co.th/litellm)
- **Templates**: Official MFEC brand guidelines and document templates
- **Deployment**: Free tier cloud hosting (Railway/Render/Vercel)

## Project Structure

```
.
├── .kiro/                  # Kiro AI assistant configuration
│   ├── specs/             # Feature specifications
│   └── steering/          # AI guidance documents
├── .qodo/                 # MFEC templates and brand assets
│   └── Template/          # Official MFEC templates and logos
├── src/                   # Source code (to be created)
├── docs/                  # Documentation (to be created)
└── tests/                 # Test files (to be created)
```

## Getting Started

This project is currently in the specification phase. To begin implementation:

1. Review the specifications in `.kiro/specs/thai-document-generator/`
2. Start with Task 1 in `tasks.md` for project setup
3. Follow the implementation plan sequentially

## MFEC Assets

The project includes official MFEC brand assets:
- `MFEC_System&User_Manual_Template.docx` - Official document template
- `ENG_MFEC Brand Guideline as of 11 Sep 23.pdf` - Brand guidelines
- MFEC logos in various formats (PNG, AI)

## Security

- API keys are managed securely through environment variables
- User API key fallback system for token exhaustion scenarios
- No sensitive information stored in code or version control

## Development Workflow

1. **Requirements**: Defined in `requirements.md`
2. **Design**: Architecture and components in `design.md`
3. **Implementation**: Step-by-step tasks in `tasks.md`
4. **Testing**: Comprehensive testing strategy included

## Team Size

Optimized for small teams (5-6 employees) with cost-effective deployment options.

## License

Internal MFEC project - All rights reserved.

## Contact

For questions about this project, please contact the development team.