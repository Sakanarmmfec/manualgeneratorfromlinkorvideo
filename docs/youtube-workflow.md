# YouTube Processing Workflow

## Current MCP Setup Status

✅ **filesystem** - Working (for file operations)  
✅ **fetch** - Working (for HTTP requests)  
✅ **puppeteer** - Working (for screenshots)  
❌ **youtube-transcript** - Not available as MCP server  

## YouTube Processing Workflow

### Method 1: Using Available MCPs

#### Step 1: Get Video Page Content
```
YouTube URL → fetch MCP → Get HTML content → Extract metadata
```

#### Step 2: Capture Screenshots  
```
YouTube URL → puppeteer MCP → Navigate to video → Take screenshots
```

#### Step 3: AI Processing
```
Content + Screenshots → MFEC LiteLLM → AI Analysis → Manual Generation
```

### Method 2: Using Python Script + MCPs

#### Step 1: Extract Video Info
```bash
python scripts/youtube_processor.py "https://www.youtube.com/watch?v=VIDEO_ID" info
```

#### Step 2: Get Transcript (Manual Implementation)
```bash
python scripts/youtube_processor.py "https://www.youtube.com/watch?v=VIDEO_ID" transcript
```

#### Step 3: Use MCPs for Additional Processing
- **fetch**: Get video page HTML
- **puppeteer**: Capture screenshots at specific timestamps
- **filesystem**: Save processed content

## Testing Current Setup

### Test 1: Fetch Video Page
Ask me to: **"Use fetch to get https://www.youtube.com/watch?v=EynNaU_7GE0"**

### Test 2: Capture Screenshot
Ask me to: **"Use puppeteer to take screenshot of YouTube video"**

### Test 3: Process Video Info
Ask me to: **"Run the YouTube processor script"**

## Alternative Solutions

### Option 1: Install youtube-transcript-api separately
```bash
pip install youtube-transcript-api
```

### Option 2: Use yt-dlp for video processing
```bash
pip install yt-dlp
```

### Option 3: Create custom MCP server
Build a custom MCP server specifically for YouTube processing.

## Recommended Approach

1. **Start with current MCPs** (fetch + puppeteer)
2. **Use Python script** for video ID extraction
3. **Add transcript library** separately if needed
4. **Build custom solution** as the project grows

## Next Steps

1. Test current MCP setup
2. Verify fetch and puppeteer are working
3. Implement YouTube processing using available tools
4. Add transcript extraction later if needed