import { describe, it, expect } from 'vitest'
import { validateUrl, formatFileSize, cn } from './utils'

describe('Utils', () => {
  describe('validateUrl', () => {
    it('should validate YouTube URLs correctly', () => {
      const result1 = validateUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      expect(result1).toEqual({ isValid: true, type: 'youtube' })
      
      const result2 = validateUrl('https://youtu.be/dQw4w9WgXcQ')
      expect(result2).toEqual({ isValid: true, type: 'youtube' })
    })

    it('should validate website URLs correctly', () => {
      const result = validateUrl('https://example.com/product')
      expect(result).toEqual({ isValid: true, type: 'website' })
    })

    it('should reject invalid URLs', () => {
      const result1 = validateUrl('not-a-url')
      expect(result1).toEqual({ isValid: false, type: 'invalid' })
      
      const result2 = validateUrl('ftp://example.com')
      expect(result2).toEqual({ isValid: false, type: 'invalid' })
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2621440)).toBe('2.5 MB')
    })
  })

  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
    })
  })
})