import { generateId } from '../utils/ids'
import { MediaItem } from '../models/project'

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2GB warning threshold

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov']
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.aac']

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex === -1) return ''
  return fileName.slice(dotIndex).toLowerCase()
}

export function detectMediaTypeFromExtension(fileName: string): 'video' | 'audio' | 'image' | null {
  const ext = getFileExtension(fileName)
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image'
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video'
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio'
  return null
}

function getSupportedMediaType(file: File): 'video' | 'audio' | 'image' | null {
  const mimeType = file.type

  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('image/')) return 'image'

  return detectMediaTypeFromExtension(file.name)
}

const SUPPORTED_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/aac',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export async function getMediaMetadata(file: File): Promise<{
  durationUs: number
  width: number
  height: number
  mediaType: 'video' | 'audio' | 'image'
}> {
  const mediaType = getSupportedMediaType(file)
  
  if (mediaType === 'video') {
    return getVideoMetadata(file)
  } else if (mediaType === 'audio') {
    return getAudioMetadata(file)
  } else if (mediaType === 'image') {
    return getImageMetadata(file)
  }
  
  throw new Error(`Unsupported media type: ${file.type || getFileExtension(file.name) || 'unknown'}`)
}

async function getVideoMetadata(file: File): Promise<{
  durationUs: number
  width: number
  height: number
  mediaType: 'video'
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    const url = URL.createObjectURL(file)
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      
      if (video.duration && !isNaN(video.duration)) {
        resolve({
          durationUs: Math.round(video.duration * 1_000_000),
          width: video.videoWidth || 1920,
          height: video.videoHeight || 1080,
          mediaType: 'video' as const,
        })
      } else {
        // Fallback for when duration is not available
        resolve({
          durationUs: 30_000_000, // Default 30 seconds
          width: video.videoWidth || 1920,
          height: video.videoHeight || 1080,
          mediaType: 'video' as const,
        })
      }
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = url
  })
}

async function getAudioMetadata(file: File): Promise<{
  durationUs: number
  width: number
  height: number
  mediaType: 'audio'
}> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    
    const url = URL.createObjectURL(file)
    
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      
      if (audio.duration && !isNaN(audio.duration)) {
        resolve({
          durationUs: Math.round(audio.duration * 1_000_000),
          width: 0,
          height: 0,
          mediaType: 'audio' as const,
        })
      } else {
        resolve({
          durationUs: 60_000_000, // Default 60 seconds
          width: 0,
          height: 0,
          mediaType: 'audio' as const,
        })
      }
    }
    
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio metadata'))
    }
    
    audio.src = url
  })
}

async function getImageMetadata(file: File): Promise<{
  durationUs: number
  width: number
  height: number
  mediaType: 'image'
}> {
  const url = URL.createObjectURL(file)

  try {
    const dimensions = await loadImage(url)

    if (dimensions.width === 0 || dimensions.height === 0) {
      URL.revokeObjectURL(url)
      throw new Error('Image has zero dimensions')
    }

    URL.revokeObjectURL(url)

    return {
      durationUs: 0,
      width: dimensions.width,
      height: dimensions.height,
      mediaType: 'image' as const,
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

async function loadImage(url: string): Promise<{ width: number; height: number }> {
  const img = new Image()
  img.src = url

  if (typeof img.decode === 'function') {
    try {
      await img.decode()
    } catch {
      // decode failed, fall through to onload
    }
  }

  return new Promise((resolve, reject) => {
    if (img.complete && img.naturalWidth > 0) {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      return
    }

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
  })
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" is very large (${formatBytes(file.size)}). This may cause performance issues.`,
    }
  }
  
  const mimeType = file.type

  if (mimeType && SUPPORTED_MIME_TYPES.includes(mimeType)) {
    return { valid: true }
  }

  const detectedType = detectMediaTypeFromExtension(file.name)
  if (detectedType) {
    return { valid: true }
  }

  const displayType = mimeType || getFileExtension(file.name) || 'unknown'
  return {
    valid: false,
    error: `Unsupported file type: ${displayType}`,
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export async function generateThumbnail(file: File, timeUs: number = 0): Promise<string | null> {
  try {
    const mimeType = file.type
    
    if (!mimeType.startsWith('video/') && !mimeType.startsWith('image/')) {
      return null
    }
    
    if (mimeType.startsWith('image/')) {
      return new Promise((resolve) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            URL.revokeObjectURL(url)
            resolve(null)
            return
          }
          
          const scale = Math.min(160 / img.width, 90 / img.height)
          canvas.width = Math.max(1, Math.floor(img.width * scale))
          canvas.height = Math.max(1, Math.floor(img.height * scale))
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          URL.revokeObjectURL(url)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        
        img.onerror = () => {
          URL.revokeObjectURL(url)
          resolve(null)
        }
        
        img.src = url
      })
    }
    
    // For videos, capture frame at specified time
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      const url = URL.createObjectURL(file)
      
      video.onloadeddata = () => {
        if (isNaN(timeUs / 1_000_000)) {
          video.currentTime = 0
        } else {
          video.currentTime = timeUs / 1_000_000
        }
      }
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          resolve(null)
          return
        }
        
        const scale = Math.min(160 / video.videoWidth, 90 / video.videoHeight)
        canvas.width = Math.max(1, Math.floor(video.videoWidth * scale))
        canvas.height = Math.max(1, Math.floor(video.videoHeight * scale))
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      
      video.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(null)
      }
      
      video.src = url
    })
  } catch {
    return null
  }
}

export async function createMediaItemFromFile(file: File): Promise<MediaItem> {
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  try {
    const metadata = await getMediaMetadata(file)
    
    const mediaItem: MediaItem = {
      id: generateId(),
      name: file.name,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      mediaType: metadata.mediaType,
      durationUs: metadata.mediaType === 'image' ? 0 : metadata.durationUs,
      width: metadata.width,
      height: metadata.height,
      objectUrl: null,
      thumbnailUrl: null,
      createdAt: Date.now(),
    }
    
    if (metadata.mediaType === 'image') {
      const url = URL.createObjectURL(file)
      mediaItem.objectUrl = url
      mediaItem.thumbnailUrl = url
    } else {
      mediaItem.objectUrl = URL.createObjectURL(file)
      if (metadata.mediaType === 'video') {
        mediaItem.thumbnailUrl = await generateThumbnail(file)
      }
    }
    
    return mediaItem
  } catch (error) {
    throw new Error(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}