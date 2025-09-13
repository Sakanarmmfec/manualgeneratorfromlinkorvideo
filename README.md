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

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Free Tier Deployment

Deploy to free hosting platforms optimized for small teams:

```bash
# Deploy to Railway (recommended)
./scripts/deploy-free-tier.sh railway

# Deploy to Render
./scripts/deploy-free-tier.sh render

# Deploy to Vercel
./scripts/deploy-free-tier.sh vercel

# Windows PowerShell
.\scripts\deploy-free-tier.ps1 -Platform railway
```

**Supported Free Platforms:**
- **Railway**: 512MB RAM, 1 vCPU, 1GB storage
- **Render**: 512MB RAM, 0.1 CPU, 1GB storage  
- **Vercel**: Serverless functions, 100GB bandwidth

See [Free Tier Deployment Guide](docs/free-tier-deployment.md) for detailed instructions.

### Environment Setup

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Set required variables:
   ```bash
   MFEC_LLM_BASE_URL=https://gpt.mfec.co.th/litellm
   MFEC_LLM_API_KEY=your_api_key_here
   ENCRYPTION_KEY=your_32_character_key_here
   ```

3. For production deployment, set these as secrets in your platform dashboard

## Free Tier Optimizations

The application is optimized for free hosting platforms:

- **Memory Efficient**: Optimized for 512MB RAM limits
- **Smart Caching**: Reduces API calls and improves performance
- **Auto Cleanup**: Manages storage within 1GB limits
- **Rate Limiting**: Prevents quota exhaustion
- **Fallback API Keys**: Users can provide their own keys when needed
- **Health Monitoring**: Built-in monitoring for free tier constraints

## MFEC Assets

The project includes official MFEC brand assets:
- `MFEC_System&User_Manual_Template.docx` - Official document template
- `ENG_MFEC Brand Guideline as of 11 Sep 23.pdf` - Brand guidelines
- MFEC logos in various formats (PNG, AI)

## Documentation

- [Free Tier Deployment Guide](docs/free-tier-deployment.md) - Complete deployment instructions
- [General Deployment Guide](docs/deployment.md) - Advanced deployment options
- [Project Specifications](.kiro/specs/thai-document-generator/) - Detailed requirements and design

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
