import { describe, it, expect } from 'vitest'
import { timeUsToPixels, pixelsToTimeUs } from './coordinates'

const US_PER_SECOND = 1_000_000

describe('timeline coordinates', () => {
  describe('timeUsToPixels', () => {
    it('converts 0 microseconds to 0 pixels at any zoom', () => {
      expect(timeUsToPixels(0, 50)).toBe(0)
      expect(timeUsToPixels(0, 100)).toBe(0)
      expect(timeUsToPixels(0, 200)).toBe(0)
    })

    it('converts 1 second to 10 pixels at 50% zoom', () => {
      // Base: 20px/sec at 100%, so 10px/sec at 50%
      expect(timeUsToPixels(US_PER_SECOND, 50)).toBe(10)
    })

    it('converts 1 second to 20 pixels at 100% zoom', () => {
      expect(timeUsToPixels(US_PER_SECOND, 100)).toBe(20)
    })

    it('converts 1 second to 40 pixels at 200% zoom', () => {
      // Base: 20px/sec at 100%, so 40px/sec at 200%
      expect(timeUsToPixels(US_PER_SECOND, 200)).toBe(40)
    })

    it('converts 5 seconds correctly at 100% zoom', () => {
      expect(timeUsToPixels(5 * US_PER_SECOND, 100)).toBe(100)
    })

    it('converts 60 seconds correctly at 100% zoom', () => {
      expect(timeUsToPixels(60 * US_PER_SECOND, 100)).toBe(1200)
    })

    it('throws on invalid timeUs', () => {
      expect(() => timeUsToPixels(Infinity, 100)).toThrow()
      expect(() => timeUsToPixels(NaN, 100)).toThrow()
    })

    it('throws on invalid zoomPercentage', () => {
      expect(() => timeUsToPixels(1000, 0)).toThrow()
      expect(() => timeUsToPixels(1000, -50)).toThrow()
      expect(() => timeUsToPixels(1000, Infinity)).toThrow()
    })
  })

  describe('pixelsToTimeUs', () => {
    it('converts 0 pixels to 0 microseconds at any zoom', () => {
      expect(pixelsToTimeUs(0, 50)).toBe(0)
      expect(pixelsToTimeUs(0, 100)).toBe(0)
      expect(pixelsToTimeUs(0, 200)).toBe(0)
    })

    it('converts 10 pixels to 1 second at 50% zoom', () => {
      expect(pixelsToTimeUs(10, 50)).toBe(US_PER_SECOND)
    })

    it('converts 20 pixels to 1 second at 100% zoom', () => {
      expect(pixelsToTimeUs(20, 100)).toBe(US_PER_SECOND)
    })

    it('converts 40 pixels to 1 second at 200% zoom', () => {
      expect(pixelsToTimeUs(40, 200)).toBe(US_PER_SECOND)
    })

    it('converts 100 pixels to 5 seconds at 100% zoom', () => {
      expect(pixelsToTimeUs(100, 100)).toBe(5 * US_PER_SECOND)
    })

    it('converts 1200 pixels to 60 seconds at 100% zoom', () => {
      expect(pixelsToTimeUs(1200, 100)).toBe(60 * US_PER_SECOND)
    })

    it('throws on invalid pixels', () => {
      expect(() => pixelsToTimeUs(Infinity, 100)).toThrow()
      expect(() => pixelsToTimeUs(NaN, 100)).toThrow()
    })

    it('throws on invalid zoomPercentage', () => {
      expect(() => pixelsToTimeUs(10, 0)).toThrow()
      expect(() => pixelsToTimeUs(10, -50)).toThrow()
      expect(() => pixelsToTimeUs(10, Infinity)).toThrow()
    })
  })

  describe('roundtrip conversion', () => {
    it('preserves time through roundtrip at 50% zoom', () => {
      const timeUs = 5_000_000 // 5 seconds
      const pixels = timeUsToPixels(timeUs, 50)
      const backToTime = pixelsToTimeUs(pixels, 50)
      expect(backToTime).toBe(timeUs)
    })

    it('preserves time through roundtrip at 100% zoom', () => {
      const timeUs = 5_000_000 // 5 seconds
      const pixels = timeUsToPixels(timeUs, 100)
      const backToTime = pixelsToTimeUs(pixels, 100)
      expect(backToTime).toBe(timeUs)
    })

    it('preserves time through roundtrip at 200% zoom', () => {
      const timeUs = 5_000_000 // 5 seconds
      const pixels = timeUsToPixels(timeUs, 200)
      const backToTime = pixelsToTimeUs(pixels, 200)
      expect(backToTime).toBe(timeUs)
    })
  })
})
