const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2GB warning threshold

export async function getMediaMetadata(file: File): Promise<{
  durationUs: number
  width: number
  height: number
  mediaType: 'video' | 'audio' | 'image'
}> {
  const mimeType = file.type
  
  if (mimeType.startsWith('video/')) {
    return getVideoMetadata(file)
  } else if (mimeType.startsWith('audio/')) {
    return getAudioMetadata(file)
  } else if (mimeType.startsWith('image/')) {
    return getImageMetadata(file)
  }
  
  throw new Error(`Unsupported media type: ${mimeType}`)
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
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        durationUs: 5_000_000, // Default 5 seconds for images
        width: img.width || 1920,
        height: img.height || 1080,
        mediaType: 'image' as const,
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" is very large (${formatBytes(file.size)}). This may cause performance issues.`,
    }
  }
  
  const supportedTypes = [
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
  
  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}`,
    }
  }
  
  return { valid: true }
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
      // For images, create a small thumbnail
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
        video.currentTime = timeUs / 1_000_000
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
