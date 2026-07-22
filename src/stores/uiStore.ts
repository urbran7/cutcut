import { create } from 'zustand'

type PanelTab = 'media' | 'filters' | 'transitions'

interface UIState {
  activePanelTab: PanelTab
  inspectorVisible: boolean
  notifications: Notification[]
  
  // Actions
  setActivePanelTab: (tab: PanelTab) => void
  setInspectorVisible: (visible: boolean) => void
  addNotification: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  createdAt: number
}

export const useUIStore = create<UIState>((set, get) => ({
  activePanelTab: 'media',
  inspectorVisible: true,
  notifications: [],
  
  setActivePanelTab: (tab: PanelTab) => {
    set({ activePanelTab: tab })
  },
  
  setInspectorVisible: (visible: boolean) => {
    set({ inspectorVisible: visible })
  },
  
  addNotification: (message, type = 'info') => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const notification: Notification = {
      id,
      message,
      type,
      createdAt: Date.now(),
    }
    
    set({
      notifications: [...get().notifications, notification],
    })
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id)
    }, 5000)
  },
  
  removeNotification: (id: string) => {
    set({
      notifications: get().notifications.filter(n => n.id !== id),
    })
  },
}))
