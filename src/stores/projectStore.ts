import { create } from 'zustand'
import { Project, Track, MediaItem, DEFAULT_PROJECT, DEFAULT_VIDEO_PROPERTIES } from '../models/project'
import { generateId, generateLinkId } from '../utils/ids'

interface ProjectState {
  project: Project | null
  runtimeMedia: Map<string, MediaItem>
  dirty: boolean
  selectedMediaId: string | null
  
  // Actions
  createProject: (name?: string) => void
  loadProject: (project: Project, runtimeMedia: Map<string, MediaItem>) => void
  updateProjectMetadata: (updates: Partial<Pick<Project, 'name' | 'canvasWidth' | 'canvasHeight' | 'frameRate'>>) => void
  addMedia: (media: MediaItem) => void
  removeMedia: (mediaId: string) => { success: boolean; reason?: string }
  selectMedia: (mediaId: string | null) => void
  clearMediaSelection: () => void
  setDirty: (dirty: boolean) => void
  markSaved: () => void
}

const createDefaultTracks = (): Track[] => {
  return [
    { id: 'video2', type: 'video', name: 'Video 2', order: 0, muted: false, locked: false, clips: [] },
    { id: 'video1', type: 'video', name: 'Video 1', order: 1, muted: false, locked: false, clips: [] },
    { id: 'audio1', type: 'audio', name: 'Audio 1', order: 2, muted: false, locked: false, clips: [] },
    { id: 'audio2', type: 'audio', name: 'Audio 2', order: 3, muted: false, locked: false, clips: [] },
  ]
}

function isMediaReferencedInTimeline(project: Project, mediaId: string): boolean {
  return project.tracks.some(track =>
    track.clips.some(clip => clip.mediaId === mediaId)
  )
}

function revokeMediaUrl(url: string | null): void {
  if (url && url.startsWith('blob:') && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url)
  }
}

function revokeMediaUrls(media: MediaItem): void {
  if (media.objectUrl && media.thumbnailUrl && media.objectUrl === media.thumbnailUrl) {
    revokeMediaUrl(media.objectUrl)
  } else {
    revokeMediaUrl(media.objectUrl)
    revokeMediaUrl(media.thumbnailUrl)
  }
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  runtimeMedia: new Map(),
  dirty: false,
  selectedMediaId: null,

  createProject: (name?: string) => {
    const now = Date.now()
    const project: Project = {
      ...DEFAULT_PROJECT,
      id: generateId(),
      name: name || 'Untitled Project',
      createdAt: now,
      updatedAt: now,
      tracks: createDefaultTracks(),
    }
    set({ 
      project, 
      runtimeMedia: new Map(),
      dirty: false,
      selectedMediaId: null,
    })
  },

  loadProject: (project: Project, runtimeMedia: Map<string, MediaItem>) => {
    set({ project, runtimeMedia, dirty: false, selectedMediaId: null })
  },

  updateProjectMetadata: (updates) => {
    const { project } = get()
    if (!project) return
    
    set({
      project: {
        ...project,
        ...updates,
        updatedAt: Date.now(),
      },
      dirty: true,
    })
  },

  addMedia: (media: MediaItem) => {
    const { project, runtimeMedia } = get()
    if (!project) return

    const newRuntimeMedia = new Map(runtimeMedia)
    newRuntimeMedia.set(media.id, media)

    const serializableMedia = { ...media, objectUrl: null, thumbnailUrl: null }
    
    set({
      project: {
        ...project,
        media: [...project.media, serializableMedia],
        updatedAt: Date.now(),
      },
      runtimeMedia: newRuntimeMedia,
      dirty: true,
    })
  },

  removeMedia: (mediaId: string) => {
    const { project, runtimeMedia, selectedMediaId } = get()
    if (!project) return { success: false, reason: 'no-project' }

    if (isMediaReferencedInTimeline(project, mediaId)) {
      return { success: false, reason: 'in-timeline' }
    }

    const mediaToRemove = runtimeMedia.get(mediaId)
    if (mediaToRemove) {
      revokeMediaUrls(mediaToRemove)
    }

    const newRuntimeMedia = new Map(runtimeMedia)
    newRuntimeMedia.delete(mediaId)

    set({
      project: {
        ...project,
        media: project.media.filter(m => m.id !== mediaId),
        updatedAt: Date.now(),
      },
      runtimeMedia: newRuntimeMedia,
      selectedMediaId: selectedMediaId === mediaId ? null : selectedMediaId,
      dirty: true,
    })

    return { success: true }
  },

  selectMedia: (mediaId: string | null) => {
    const { runtimeMedia } = get()
    if (mediaId !== null && !runtimeMedia.has(mediaId)) return
    set({ selectedMediaId: mediaId })
  },

  clearMediaSelection: () => {
    set({ selectedMediaId: null })
  },

  setDirty: (dirty: boolean) => {
    set({ dirty })
  },

  markSaved: () => {
    const { project } = get()
    if (!project) return

    set({
      project: {
        ...project,
        updatedAt: Date.now(),
      },
      dirty: false,
    })
  },
}))

// Helper actions that depend on the store
export function addClipToTimeline(
  mediaId: string,
  trackType: 'video' | 'audio',
  timelineStartUs: number,
  sourceStartUs: number,
  sourceEndUs: number,
  linkGroupId?: string
) {
  const { project, runtimeMedia } = useProjectStore.getState()
  if (!project) return

  const media = runtimeMedia.get(mediaId)
  if (!media) return

  const durationUs = sourceEndUs - sourceStartUs
  
  const clip = {
    id: generateId(),
    mediaId,
    trackId: trackType === 'video' ? 'video1' : 'audio2',
    linkGroupId: linkGroupId || null,
    timelineStartUs,
    sourceStartUs,
    sourceEndUs,
    durationUs,
    speed: 1,
    volume: 1,
    muted: false,
    fadeInUs: 0,
    fadeOutUs: 0,
    videoProperties: { ...DEFAULT_VIDEO_PROPERTIES },
  }

  const tracks = project.tracks.map(track => {
    if (track.id === clip.trackId) {
      return { ...track, clips: [...track.clips, clip] }
    }
    return track
  })

  useProjectStore.setState({
    project: { ...project, tracks, updatedAt: Date.now() },
    dirty: true,
  })
}

export function addVideoWithAudio(mediaId: string, timelineStartUs: number) {
  const { runtimeMedia } = useProjectStore.getState()
  const media = runtimeMedia.get(mediaId)
  if (!media || media.mediaType !== 'video') return

  const linkGroupId = generateLinkId()
  const durationUs = media.durationUs

  // Add video to Video 1
  addClipToTimeline(mediaId, 'video', timelineStartUs, 0, durationUs, linkGroupId)

  // Add source audio to Audio 2
  addClipToTimeline(mediaId, 'audio', timelineStartUs, 0, durationUs, linkGroupId)
}
