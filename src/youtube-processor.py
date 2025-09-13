#!/usr/bin/env python3
"""
Simple YouTube processor for Thai Document Generator
Works without complex MCP dependencies
"""

import requests
import re
import json
from urllib.parse import urlparse, parse_qs

class YouTubeProcessor:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def extract_video_id(self, url):
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/v\/([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def get_video_info(self, url):
        """Get basic video information"""
        video_id = self.extract_video_id(url)
        if not video_id:
            return {"error": "Invalid YouTube URL"}
        
        try:
            # Get video page
            response = self.session.get(f"https://www.youtube.com/watch?v={video_id}")
            html = response.text
            
            # Extract title
            title_match = re.search(r'"title":"([^"]+)"', html)
            title = title_match.group(1) if title_match else "Unknown Title"
            
            # Extract description
            desc_match = re.search(r'"shortDescription":"([^"]+)"', html)
            description = desc_match.group(1) if desc_match else "No description"
            
            # Extract duration
            duration_match = re.search(r'"lengthSeconds":"(\d+)"', html)
            duration = int(duration_match.group(1)) if duration_match else 0
            
            return {
                "video_id": video_id,
                "title": title.encode().decode('unicode_escape'),
                "description": description.encode().decode('unicode_escape'),
                "duration": duration,
                "url": url,
                "thumbnail": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            }
            
        except Exception as e:
            return {"error": f"Failed to get video info: {str(e)}"}
    
    def get_transcript_urls(self, video_id):
        """Get available transcript/caption URLs"""
        try:
            # Try to get captions info
            captions_url = f"https://www.youtube.com/api/timedtext?type=list&v={video_id}"
            response = self.session.get(captions_url)
            
            if response.status_code == 200:
                # Parse available captions
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                
                captions = []
                for track in root.findall('.//track'):
                    lang_code = track.get('lang_code', 'en')
                    name = track.get('name', lang_code)
                    captions.append({
                        'lang_code': lang_code,
                        'name': name,
                        'url': f"https://www.youtube.com/api/timedtext?lang={lang_code}&v={video_id}"
                    })
                
                return captions
            
        except Exception as e:
            print(f"Caption extraction error: {e}")
        
        return []
    
    def get_transcript(self, url, lang='en'):
        """Get video transcript/captions"""
        video_id = self.extract_video_id(url)
        if not video_id:
            return {"error": "Invalid YouTube URL"}
        
        try:
            # Try to get transcript
            transcript_url = f"https://www.youtube.com/api/timedtext?lang={lang}&v={video_id}"
            response = self.session.get(transcript_url)
            
            if response.status_code == 200:
                # Parse XML transcript
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                
                transcript_parts = []
                for text_elem in root.findall('.//text'):
                    start_time = float(text_elem.get('start', 0))
                    duration = float(text_elem.get('dur', 0))
                    text = text_elem.text or ""
                    
                    # Clean up text
                    text = re.sub(r'&amp;', '&', text)
                    text = re.sub(r'&lt;', '<', text)
                    text = re.sub(r'&gt;', '>', text)
                    
                    transcript_parts.append({
                        'start': start_time,
                        'duration': duration,
                        'text': text.strip()
                    })
                
                return {
                    'video_id': video_id,
                    'language': lang,
                    'transcript': transcript_parts,
                    'full_text': ' '.join([part['text'] for part in transcript_parts])
                }
            
            else:
                return {"error": "No transcript available for this video"}
                
        except Exception as e:
            return {"error": f"Failed to get transcript: {str(e)}"}

def main():
    """Test the YouTube processor"""
    processor = YouTubeProcessor()
    
    # Test URL
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    print("Testing YouTube Processor...")
    print("=" * 50)
    
    # Get video info
    print("Getting video info...")
    info = processor.get_video_info(test_url)
    print(json.dumps(info, indent=2))
    
    print("\n" + "=" * 50)
    
    # Get transcript
    print("Getting transcript...")
    transcript = processor.get_transcript(test_url)
    print(json.dumps(transcript, indent=2))

if __name__ == "__main__":
    main()