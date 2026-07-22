import { create } from 'zustand'

interface PlaybackState {
  isPlaying: boolean
  currentTimeUs: number
  durationUs: number
  previewQuality: 'full' | 'half'
  
  // Actions
  setPlaying: (playing: boolean) => void
  setCurrentTime: (timeUs: number) => void
  setDuration: (durationUs: number) => void
  setPreviewQuality: (quality: 'full' | 'half') => void
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  isPlaying: false,
  currentTimeUs: 0,
  durationUs: 0,
  previewQuality: 'full',
  
  setPlaying: (playing: boolean) => {
    set({ isPlaying: playing })
  },
  
  setCurrentTime: (timeUs: number) => {
    set({ currentTimeUs: Math.max(0, timeUs) })
  },
  
  setDuration: (durationUs: number) => {
    set({ durationUs: Math.max(0, durationUs) })
  },
  
  setPreviewQuality: (quality: 'full' | 'half') => {
    set({ previewQuality: quality })
  },
}))
