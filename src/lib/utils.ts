import { type ClassValue, clsx } from 'clsx'

/**
 * Utility function to merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Validates if a URL is a valid product URL or YouTube video URL
 */
export function validateUrl(url: string): { isValid: boolean; type: 'website' | 'youtube' | 'invalid' } {
  try {
    const urlObj = new URL(url)
    
    // Check if it's a YouTube URL
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return { isValid: true, type: 'youtube' }
    }
    
    // Check if it's a valid website URL
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return { isValid: true, type: 'website' }
    }
    
    return { isValid: false, type: 'invalid' }
  } catch {
    return { isValid: false, type: 'invalid' }
  }
}

/**
 * Formats file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}