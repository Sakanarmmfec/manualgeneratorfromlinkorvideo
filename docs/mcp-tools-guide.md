# MCP Tools Guide for Thai Document Generator

This document explains all the MCP (Model Context Protocol) tools configured for the Thai Document Generator project and their specific use cases.

## Core Content Processing MCPs

### 1. **web-search** 
- **Purpose**: Extract content from product URLs
- **Use Cases**:
  - Scrape product pages for content extraction
  - Extract text, images, and metadata from websites
  - Get page content for AI processing
- **Key Functions**: `search`, `scrape`, `get_page_content`, `extract_links`

### 2. **youtube**
- **Purpose**: Process YouTube videos for manual generation
- **Use Cases**:
  - Extract video transcripts and captions
  - Get video metadata (title, description, duration)
  - Search for related videos
  - Extract key moments and timestamps
- **Key Functions**: `get_transcript`, `get_video_info`, `search_videos`, `get_captions`

### 3. **puppeteer**
- **Purpose**: Advanced web scraping and screenshot capture
- **Use Cases**:
  - Capture screenshots from YouTube videos at specific timestamps
  - Generate PDFs from web content
  - Handle dynamic content that requires JavaScript
  - Extract content from complex web applications
- **Key Functions**: `screenshot`, `pdf`, `navigate`, `extract_content`

## File and Data Management MCPs

### 4. **filesystem**
- **Purpose**: Handle MFEC templates and generated documents
- **Use Cases**:
  - Read MFEC DOCX templates and brand guidelines
  - Write generated documents in various formats
  - Manage project file structure
  - Handle image assets and logos
- **Key Functions**: `read_file`, `write_file`, `list_directory`, `create_directory`

### 5. **sqlite**
- **Purpose**: Local database for RAG system and document metadata
- **Use Cases**:
  - Store generated document metadata
  - Index content for search functionality
  - Manage user preferences and settings
  - Cache processed content
- **Key Functions**: `query`, `execute`, `create_table`, `insert`, `update`

### 6. **postgres**
- **Purpose**: Production database for scalable deployment
- **Use Cases**:
  - Production-ready document storage
  - User management and authentication
  - Advanced search and analytics
  - Team collaboration features
- **Key Functions**: `query`, `execute`, `create_table`, `insert`, `update`

### 7. **memory**
- **Purpose**: Persistent memory for AI context and learning
- **Use Cases**:
  - Remember user preferences and patterns
  - Store frequently used content templates
  - Learn from user feedback and corrections
  - Maintain conversation context across sessions
- **Key Functions**: `create_memory`, `search_memory`, `update_memory`

## Development and Deployment MCPs

### 8. **git**
- **Purpose**: Version control and collaboration
- **Use Cases**:
  - Track changes to generated documents
  - Collaborate with team members
  - Manage document versions and history
  - Deploy updates to production
- **Key Functions**: `status`, `add`, `commit`, `push`, `pull`, `log`

### 9. **docker**
- **Purpose**: Containerization and deployment
- **Use Cases**:
  - Package application for consistent deployment
  - Manage development and production environments
  - Scale application based on usage
  - Ensure consistent runtime across different systems
- **Key Functions**: `list_containers`, `run_container`, `build_image`

### 10. **shell**
- **Purpose**: System operations and automation
- **Use Cases**:
  - Install dependencies and packages
  - Run build and deployment scripts
  - Execute system-level operations
  - Automate maintenance tasks
- **Key Functions**: `run_command`

## Search and Intelligence MCPs

### 11. **brave-search**
- **Purpose**: Enhanced web search capabilities
- **Use Cases**:
  - Find additional resources and references
  - Validate product information
  - Search for similar products or documentation
  - Gather competitive intelligence
- **Key Functions**: `web_search`, `local_search`

### 12. **sequential-thinking**
- **Purpose**: Enhanced AI reasoning and planning
- **Use Cases**:
  - Complex document structure planning
  - Multi-step content organization
  - Quality assurance and validation
  - Problem-solving for complex scenarios
- **Key Functions**: `think`, `analyze`, `plan`

## Utility MCPs

### 13. **fetch**
- **Purpose**: HTTP requests and API integration
- **Use Cases**:
  - Connect to MFEC LiteLLM API
  - Integrate with external services
  - Download resources and assets
  - Handle webhook integrations
- **Key Functions**: `fetch`, `post`, `put`, `delete`

### 14. **time**
- **Purpose**: Time and date operations
- **Use Cases**:
  - Timestamp generated documents
  - Schedule document generation tasks
  - Track processing time and performance
  - Handle time-based content organization
- **Key Functions**: `get_current_time`, `format_time`, `parse_time`

### 15. **aws-kb**
- **Purpose**: AWS documentation and cloud services
- **Use Cases**:
  - Get deployment guidance for AWS
  - Access cloud service documentation
  - Optimize cloud resource usage
  - Troubleshoot deployment issues
- **Key Functions**: `search_docs`, `get_service_info`

## MCP Usage Priority for Development

### Phase 1 (Essential - Start Here):
1. **filesystem** - Handle MFEC templates
2. **web-search** - Basic content extraction
3. **fetch** - API integration with MFEC LiteLLM

### Phase 2 (Core Features):
4. **youtube** - Video processing
5. **puppeteer** - Screenshot capture
6. **sqlite** - Local data storage

### Phase 3 (Advanced Features):
7. **memory** - AI learning and context
8. **sequential-thinking** - Enhanced reasoning
9. **git** - Version control

### Phase 4 (Production):
10. **docker** - Deployment
11. **postgres** - Production database
12. **shell** - System operations

### Phase 5 (Enhancement):
13. **brave-search** - Enhanced search
14. **time** - Time operations
15. **aws-kb** - Cloud deployment guidance

## Installation and Setup

All MCPs are configured to use `uvx` for automatic installation. Make sure you have `uv` installed:

```bash
# Install uv (Python package manager)
pip install uv

# uvx comes automatically with uv
# MCPs will be installed automatically when first used
```

## Security Considerations

- All MCPs are configured with `FASTMCP_LOG_LEVEL: "ERROR"` to minimize log verbosity
- Auto-approve is enabled for common operations to improve workflow efficiency
- Sensitive operations should still require manual approval
- API keys and credentials should be managed through environment variables

## Troubleshooting

If an MCP server fails to start:
1. Check that `uv` and `uvx` are properly installed
2. Verify internet connection for package downloads
3. Check the Kiro MCP Server view for error messages
4. Restart Kiro if needed to reconnect servers

## Performance Tips

- Disable unused MCPs by setting `"disabled": true`
- Remove auto-approve for operations you want to review manually
- Monitor resource usage with multiple MCPs running
- Use local MCPs (sqlite, filesystem) for better performance than remote APIs