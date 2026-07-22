export function getMediaTypeFromMime(mimeType: string): 'video' | 'audio' | 'image' {
  if (mimeType.startsWith('video/')) {
    return 'video'
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio'
  }
  if (mimeType.startsWith('image/')) {
    return 'image'
  }
  
  // Fallback based on extension
  const extension = mimeType.split('/').pop()?.toLowerCase()
  if (extension && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
    return 'image'
  }
  if (extension && ['mp3', 'wav', 'aac', 'ogg'].includes(extension)) {
    return 'audio'
  }
  
  return 'video'
}

export function getExtensionFromMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/aac': 'aac',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return mimeToExt[mimeType] || 'unknown'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function isSupportedVideoMime(mimeType: string): boolean {
  const supported = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ]
  return supported.includes(mimeType)
}

export function isSupportedAudioMime(mimeType: string): boolean {
  const supported = [
    'audio/mpeg',
    'audio/wav',
    'audio/aac',
  ]
  return supported.includes(mimeType)
}

export function isSupportedImageMime(mimeType: string): boolean {
  const supported = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]
  return supported.includes(mimeType)
}
