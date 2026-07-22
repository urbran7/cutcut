import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { detectMediaTypeFromExtension, validateFile, createMediaItemFromFile } from './mediaService'

const mockObjectUrls: string[] = []
let mockUrlIndex = 0

function mockCreateUrl(): string {
  const url = `blob:mock/${mockUrlIndex++}`
  mockObjectUrls.push(url)
  return url
}

function mockRevokeUrl(url: string) {
  const idx = mockObjectUrls.indexOf(url)
  if (idx !== -1) mockObjectUrls.splice(idx, 1)
}

beforeEach(() => {
  mockUrlIndex = 0

  if (typeof URL.createObjectURL !== 'function') {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(mockCreateUrl),
      writable: true,
      configurable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(mockRevokeUrl),
      writable: true,
      configurable: true,
    })
  } else {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(mockCreateUrl)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mockRevokeUrl)
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  mockObjectUrls.length = 0
})

function createMockFile(name: string, mimeType: string, size = 1024): File {
  const blob = new Blob(['x'.repeat(Math.min(size, 1024))], { type: mimeType })
  const file = new File([blob], name, { type: mimeType, lastModified: Date.now() })
  if (size !== file.size) {
    Object.defineProperty(file, 'size', { value: size, configurable: true })
  }
  return file
}

function mockImageLoad(success = true, width = 1920, height = 1080) {
  const mockDecode = vi.fn()
  if (success) {
    mockDecode.mockResolvedValue(undefined)
  } else {
    mockDecode.mockRejectedValue(new Error('decode failed'))
  }

  vi.spyOn(globalThis, 'Image').mockImplementation(() => {
    const img = {
      naturalWidth: width,
      naturalHeight: height,
      decode: mockDecode,
      complete: success,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLImageElement

    Object.defineProperty(img, 'onload', {
      set(handler: ((() => void) | null)) {
        if (success && handler) setTimeout(handler, 0)
      },
      get() { return null },
      configurable: true,
    })
    Object.defineProperty(img, 'onerror', {
      set(handler: ((() => void) | null)) {
        if (!success && handler) setTimeout(handler, 0)
      },
      get() { return null },
      configurable: true,
    })

    return img
  })

  return { mockDecode }
}

// --- detectMediaTypeFromExtension ---

describe('detectMediaTypeFromExtension', () => {
  it('detects .jpg as image', () => {
    expect(detectMediaTypeFromExtension('photo.jpg')).toBe('image')
  })

  it('detects .jpeg as image', () => {
    expect(detectMediaTypeFromExtension('photo.jpeg')).toBe('image')
  })

  it('detects .png as image', () => {
    expect(detectMediaTypeFromExtension('photo.png')).toBe('image')
  })

  it('detects .webp as image', () => {
    expect(detectMediaTypeFromExtension('photo.webp')).toBe('image')
  })

  it('handles uppercase .JPG', () => {
    expect(detectMediaTypeFromExtension('photo.JPG')).toBe('image')
  })

  it('handles uppercase .JPEG', () => {
    expect(detectMediaTypeFromExtension('photo.JPEG')).toBe('image')
  })

  it('ignores unsupported .gif', () => {
    expect(detectMediaTypeFromExtension('animation.gif')).toBeNull()
  })

  it('ignores unsupported .svg', () => {
    expect(detectMediaTypeFromExtension('vector.svg')).toBeNull()
  })

  it('returns null for files with no extension', () => {
    expect(detectMediaTypeFromExtension('Makefile')).toBeNull()
  })
})

// --- validateFile ---

describe('validateFile', () => {
  it('accepts JPEG by MIME type', () => {
    const file = createMockFile('photo.jpg', 'image/jpeg')
    expect(validateFile(file).valid).toBe(true)
  })

  it('accepts JPEG by extension when MIME is empty', () => {
    const file = createMockFile('photo.jpeg', '')
    expect(validateFile(file).valid).toBe(true)
  })

  it('accepts PNG by MIME type', () => {
    const file = createMockFile('img.png', 'image/png')
    expect(validateFile(file).valid).toBe(true)
  })

  it('accepts WebP by MIME type', () => {
    const file = createMockFile('img.webp', 'image/webp')
    expect(validateFile(file).valid).toBe(true)
  })

  it('rejects unsupported GIF', () => {
    const file = createMockFile('animation.gif', 'image/gif')
    expect(validateFile(file).valid).toBe(false)
    expect(validateFile(file).error).toContain('Unsupported')
  })

  it('rejects oversized files', () => {
    const file = createMockFile('large.jpg', 'image/jpeg', 3 * 1024 * 1024 * 1024)
    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('very large')
  })
})

// --- createMediaItemFromFile ---

describe('createMediaItemFromFile', () => {
  it('imports JPEG by MIME type, stores width and height', async () => {
    mockImageLoad(true, 800, 600)
    const file = createMockFile('photo.jpg', 'image/jpeg')
    const item = await createMediaItemFromFile(file)
    expect(item.mediaType).toBe('image')
    expect(item.width).toBe(800)
    expect(item.height).toBe(600)
    expect(item.name).toBe('photo.jpg')
  })

  it('imports PNG, stores correct properties', async () => {
    mockImageLoad(true, 1024, 768)
    const file = createMockFile('screenshot.png', 'image/png')
    const item = await createMediaItemFromFile(file)
    expect(item.mediaType).toBe('image')
    expect(item.width).toBe(1024)
    expect(item.height).toBe(768)
    expect(item.mimeType).toBe('image/png')
  })

  it('imports WebP', async () => {
    mockImageLoad(true, 400, 300)
    const file = createMockFile('img.webp', 'image/webp')
    const item = await createMediaItemFromFile(file)
    expect(item.mediaType).toBe('image')
    expect(item.width).toBe(400)
    expect(item.height).toBe(300)
  })

  it('imports JPEG by extension when MIME type is empty', async () => {
    mockImageLoad(true, 1200, 900)
    const file = createMockFile('photo.jpeg', '')
    const item = await createMediaItemFromFile(file)
    expect(item.mediaType).toBe('image')
    expect(item.width).toBe(1200)
    expect(item.height).toBe(900)
  })

  it('imports uppercase .JPG extension', async () => {
    mockImageLoad(true, 640, 480)
    const file = createMockFile('photo.JPG', '')
    const item = await createMediaItemFromFile(file)
    expect(item.mediaType).toBe('image')
    expect(item.width).toBe(640)
    expect(item.height).toBe(480)
  })

  it('sets durationUs to 0 for images', async () => {
    mockImageLoad(true, 100, 100)
    const file = createMockFile('img.png', 'image/png')
    const item = await createMediaItemFromFile(file)
    expect(item.durationUs).toBe(0)
  })

  it('uses the same URL for objectUrl and thumbnailUrl', async () => {
    mockImageLoad(true, 200, 200)
    const file = createMockFile('img.png', 'image/png')
    const item = await createMediaItemFromFile(file)
    expect(item.objectUrl).toBeTruthy()
    expect(item.thumbnailUrl).toBe(item.objectUrl)
    expect(item.thumbnailUrl).toMatch(/^blob:/)
  })

  it('does not revoke the object URL after successful import', async () => {
    mockImageLoad(true, 200, 200)
    const file = createMockFile('img.png', 'image/png')
    await createMediaItemFromFile(file)

    // Revocations may happen for the temp metadata URL,
    // but the final MediaItem URL should survive.
    expect(mockObjectUrls.length).toBeGreaterThanOrEqual(1)
  })

  it('rejects image with zero width', async () => {
    mockImageLoad(false, 0, 100)
    const file = createMockFile('broken.png', 'image/png')
    await expect(createMediaItemFromFile(file)).rejects.toThrow()
  })

  it('rejects unsupported GIF', async () => {
    const file = createMockFile('animation.gif', 'image/gif')
    await expect(createMediaItemFromFile(file)).rejects.toThrow('Unsupported')
  })

  it('throws meaningful error for failed image decode', async () => {
    mockImageLoad(false)
    const file = createMockFile('corrupt.jpg', 'image/jpeg')
    await expect(createMediaItemFromFile(file)).rejects.toThrow()
  })
})
