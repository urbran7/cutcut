import { create } from 'zustand'

const DEFAULT_DURATION_US = 60_000_000 // 60 seconds in microseconds

interface TimelineState {
  selectedClipId: string | null
  playheadTimeUs: number
  isDraggingPlayhead: boolean
  zoomPercentage: number
  scrollLeft: number
  snappingEnabled: boolean
  timelineDurationUs: number
  
  // Actions
  setSelectedClip: (clipId: string | null) => void
  setPlayheadTimeUs: (timeUs: number) => void
  setDraggingPlayhead: (dragging: boolean) => void
  setZoomPercentage: (zoom: number) => void
  setScrollLeft: (scrollLeft: number) => void
  setSnappingEnabled: (enabled: boolean) => void
}

export const useTimelineStore = create<TimelineState>((set) => ({
  selectedClipId: null,
  playheadTimeUs: 0,
  isDraggingPlayhead: false,
  zoomPercentage: 100,
  scrollLeft: 0,
  snappingEnabled: true,
  timelineDurationUs: DEFAULT_DURATION_US,
  
  setSelectedClip: (clipId: string | null) => {
    set({ selectedClipId: clipId })
  },
  
  setPlayheadTimeUs: (timeUs: number) => {
    set({ playheadTimeUs: Math.max(0, Math.min(DEFAULT_DURATION_US, timeUs)) })
  },
  
  setDraggingPlayhead: (dragging: boolean) => {
    set({ isDraggingPlayhead: dragging })
  },
  
  setZoomPercentage: (zoom: number) => {
    set({ zoomPercentage: Math.max(50, Math.min(200, zoom)) })
  },
  
  setScrollLeft: (scrollLeft: number) => {
    set({ scrollLeft: Math.max(0, scrollLeft) })
  },
  
  setSnappingEnabled: (enabled: boolean) => {
    set({ snappingEnabled: enabled })
  },
}))
