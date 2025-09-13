#!/usr/bin/env python3
"""
YouTube Video Processor for Thai Document Generator
Extracts transcripts, metadata, and handles video processing
"""

import sys
import json
import re
from urllib.parse import urlparse, parse_qs

def extract_video_id(url):
    """Extract YouTube video ID from URL"""
    # Handle different YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None

def get_video_info(url):
    """Get basic video information from URL"""
    video_id = extract_video_id(url)
    if not video_id:
        return {"error": "Invalid YouTube URL"}
    
    # Parse timestamp if present
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    timestamp = query_params.get('t', [None])[0]
    
    return {
        "video_id": video_id,
        "url": url,
        "timestamp": timestamp,
        "title": f"YouTube Video {video_id}",
        "description": "Video processing available"
    }

def get_transcript_placeholder(video_id):
    """Placeholder for transcript extraction"""
    return {
        "video_id": video_id,
        "transcript": "Transcript extraction requires youtube-transcript-api library",
        "language": "auto",
        "note": "Use fetch MCP to get video page content for now"
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide YouTube URL"}))
        return
    
    url = sys.argv[1]
    action = sys.argv[2] if len(sys.argv) > 2 else "info"
    
    if action == "info":
        result = get_video_info(url)
    elif action == "transcript":
        video_id = extract_video_id(url)
        result = get_transcript_placeholder(video_id) if video_id else {"error": "Invalid URL"}
    else:
        result = {"error": "Unknown action"}
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()