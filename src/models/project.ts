export interface MediaItem {
  id: string
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  mediaType: 'video' | 'audio' | 'image'
  durationUs: number
  width: number
  height: number
  objectUrl: string | null
  thumbnailUrl: string | null
  createdAt: number
}

export interface VideoProperties {
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  rotate: 0 | 90 | 180 | 270
  flipHorizontal: boolean
  brightness: number
  contrast: number
  saturation: number
  opacity: number
  speed: number
  fadeInUs: number
  fadeOutUs: number
}

export interface Clip {
  id: string
  mediaId: string
  trackId: string
  linkGroupId: string | null
  timelineStartUs: number
  sourceStartUs: number
  sourceEndUs: number
  durationUs: number
  speed: number
  volume: number
  muted: boolean
  fadeInUs: number
  fadeOutUs: number
  videoProperties: VideoProperties
}

export interface Track {
  id: string
  type: 'video' | 'audio'
  name: string
  order: number
  muted: boolean
  locked: boolean
  clips: Clip[]
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  canvasWidth: number
  canvasHeight: number
  frameRate: number
  tracks: Track[]
  media: Omit<MediaItem, 'objectUrl' | 'thumbnailUrl'>[]
  version: string
}

export const DEFAULT_VIDEO_PROPERTIES: VideoProperties = {
  rotate: 0,
  flipHorizontal: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  opacity: 100,
  speed: 1,
  fadeInUs: 0,
  fadeOutUs: 0,
}

export const TRACK_ORDER = ['Video 2', 'Video 1', 'Audio 1', 'Audio 2'] as const

export const DEFAULT_PROJECT: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Untitled Project',
  canvasWidth: 1920,
  canvasHeight: 1080,
  frameRate: 30,
  tracks: [],
  media: [],
  version: '0.1.0',
}
