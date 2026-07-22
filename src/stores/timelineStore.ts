import { create } from 'zustand'

interface TimelineState {
  selectedClipId: string | null
  playheadUs: number
  zoom: number // pixels per microsecond
  scrollLeft: number
  snappingEnabled: boolean
  
  // Actions
  setSelectedClip: (clipId: string | null) => void
  setPlayhead: (timeUs: number) => void
  setZoom: (zoom: number) => void
  setScrollLeft: (scrollLeft: number) => void
  setSnappingEnabled: (enabled: boolean) => void
}

export const useTimelineStore = create<TimelineState>((set) => ({
  selectedClipId: null,
  playheadUs: 0,
  zoom: 0.0001, // Default zoom level
  scrollLeft: 0,
  snappingEnabled: true,
  
  setSelectedClip: (clipId: string | null) => {
    set({ selectedClipId: clipId })
  },
  
  setPlayhead: (timeUs: number) => {
    set({ playheadUs: Math.max(0, timeUs) })
  },
  
  setZoom: (zoom: number) => {
    set({ zoom: Math.max(0.00001, Math.min(0.001, zoom)) })
  },
  
  setScrollLeft: (scrollLeft: number) => {
    set({ scrollLeft: Math.max(0, scrollLeft) })
  },
  
  setSnappingEnabled: (enabled: boolean) => {
    set({ snappingEnabled: enabled })
  },
}))
