import { FC, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useUIStore } from '../../stores/uiStore'
import { createMediaItemFromFile, detectMediaTypeFromExtension } from '../../services/mediaService'

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024

export type TabType = 'media' | 'filters' | 'transitions'

interface LeftSidebarProps {
  onImportComplete?: (importedCount: number) => void
}

const LeftSidebar: FC<LeftSidebarProps> = ({ onImportComplete }) => {
  const [activeTab, setActiveTab] = useState<TabType>('media')
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { runtimeMedia, addMedia, removeMedia, selectedMediaId, selectMedia, clearMediaSelection } = useProjectStore()
  const triggerImportMedia = useUIStore(state => state.importMediaTrigger)
  const addNotification = useUIStore(state => state.addNotification)
  
  // Watch the global import trigger (clicked from TopToolbar)
  useEffect(() => {
    if (triggerImportMedia > 0) {
      fileInputRef.current?.click()
    }
  }, [triggerImportMedia])
  
  const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  const supportedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/aac']
  const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
  
  const formatDuration = (us: number): string => {
    if (us <= 0) return '--:--'
    const seconds = Math.floor(us / 1_000_000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }
  
  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'video':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.553A1 1 0 0121 8.236V12a1 1 0 01-1 1h-4a1 1 0 01-1-1V8.236a1 1 0 011-1L15 5.764M9 10l-4.553-2.553A1 1 0 003 8.236V12a1 1 0 001 1h4a1 1 0 001 1V8.236a1 1 0 00-1-1L5 5.764M15 5.764V3a1 1 0 00-1-1H8a1 1 0 00-1 1v2.764M20 15V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2z" />
          </svg>
        )
      case 'audio':
        return (
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v8M9 19c0 1.105-1.243 2-2.5 2S4 20.105 4 19V6l12-3v8" />
          </svg>
        )
      case 'image':
        return (
          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
    }
  }
  
  const isFileTypeSupported = (file: File): boolean => {
    const allMimeTypes = [...supportedVideoTypes, ...supportedAudioTypes, ...supportedImageTypes]
    if (file.type && allMimeTypes.includes(file.type)) return true
    return detectMediaTypeFromExtension(file.name) !== null
  }
  
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    // Ensure a project exists before importing
    const { project, createProject } = useProjectStore.getState()
    if (!project) {
      createProject()
    }
    
    const filesToProcess = Array.from(files)
    setIsImporting(true)
    setImportError(null)
    
    const existingItems = Array.from(runtimeMedia.values())
    const validFiles: File[] = []
    const invalidFiles: string[] = []
    const duplicateFiles: File[] = []
    
    for (const file of filesToProcess) {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name}: File too large (${formatFileSize(file.size)})`)
        continue
      }
      
      if (!isFileTypeSupported(file)) {
        const displayType = file.type || 'unknown'
        invalidFiles.push(`${file.name}: Unsupported file type (${displayType})`)
        continue
      }
      
      const isDuplicate = existingItems.some(item => 
        item.fileName === file.name && 
        item.fileSize === file.size && 
        Math.abs(item.createdAt - Date.now()) < 60000
      )
      
      if (isDuplicate) {
        duplicateFiles.push(file)
        continue
      }
      
      validFiles.push(file)
    }
    
    for (const file of validFiles) {
      try {
        const mediaItem = await createMediaItemFromFile(file)
        if (mediaItem) {
          addMedia(mediaItem)
        }
      } catch (error) {
        invalidFiles.push(`${file.name}: ${error instanceof Error ? error.message : 'Processing failed'}`)
      }
    }
    
    const totalImported = validFiles.length - duplicateFiles.length
    if (totalImported > 0) {
      addNotification(`${totalImported} file(s) imported`, 'success')
    }
    onImportComplete?.(totalImported)
    
    if (invalidFiles.length > 0) {
      const errorMsg = invalidFiles.join('\n')
      setImportError(errorMsg)
      setTimeout(() => setImportError(null), 5000)
    }
    
    setIsImporting(false)
  }
  
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    e.target.value = ''
  }
  
  const allMedia = useMemo(() => Array.from(runtimeMedia.values()), [runtimeMedia])
  
  const filteredMedia = useMemo(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return allMedia
    const lowerQuery = trimmed.toLowerCase()
    return allMedia.filter(item => item.fileName.toLowerCase().includes(lowerQuery))
  }, [allMedia, searchQuery])
  
  const handleCardClick = useCallback((mediaId: string) => {
    selectMedia(mediaId)
  }, [selectMedia])
  
  const handlePanelClick = useCallback((e: React.MouseEvent) => {
    // Only clear if clicking the panel background directly, not a card
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-media-panel]') === null) {
      // Click is on the panel container or scroll area background
    }
    // Clear selection when clicking empty space in the panel
    if (!(e.target as HTMLElement).closest('[data-media-card]')) {
      clearMediaSelection()
    }
  }, [clearMediaSelection])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent, mediaId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      selectMedia(mediaId)
    }
  }, [selectMedia])
  
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearMediaSelection()
      searchInputRef.current?.blur()
    }
  }, [clearMediaSelection])
  
  const handleRemoveMedia = useCallback((e: React.MouseEvent | React.KeyboardEvent, mediaId: string) => {
    e.stopPropagation()
    
    const result = removeMedia(mediaId)
    
    if (result.success) {
      addNotification('Media removed successfully', 'success')
    } else if (result.reason === 'in-timeline') {
      addNotification('This media is used in the timeline.', 'error')
    }
  }, [removeMedia, addNotification])
  
  const handleRemoveKeyDown = useCallback((e: React.KeyboardEvent, mediaId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      handleRemoveMedia(e, mediaId)
    }
  }, [handleRemoveMedia])
  
  const getItemCountLabel = (count: number): string => {
    if (count === 0) return '0 items'
    if (count === 1) return '1 item'
    return `${count} items`
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/aac,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.mp3,.wav,.aac"
        className="hidden"
        onChange={handleFileChange}
        disabled={isImporting}
      />
      
      <div className="flex border-b border-app-border">
        {([{ id: 'media' as const, label: 'Media' }, { id: 'filters' as const, label: 'Filters' }, { id: 'transitions' as const, label: 'Transitions' }]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-app-secondary text-text-main border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-main hover:bg-app-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div
        className="flex-1 overflow-y-auto"
        data-media-panel
        onClick={handlePanelClick}
        onKeyDown={handlePanelKeyDown}
        tabIndex={-1}
      >
        {activeTab === 'media' && (
          <div className="h-full flex flex-col p-4">
            {/* Toolbar */}
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleImportClick}
                  disabled={isImporting}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 text-sm"
                  aria-label="Import Media"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8l-8 8-8-8" />
                  </svg>
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
              
              <div className="relative">
                <svg
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-app-control border border-app-border rounded text-text-main placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                  aria-label="Search media by filename"
                />
              </div>
              
              <div className="text-xs text-text-secondary">
                {getItemCountLabel(filteredMedia.length)}
              </div>
            </div>
            
            {importError && (
              <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                <div className="font-medium mb-1">Import errors:</div>
                <div className="whitespace-pre-wrap">{importError}</div>
              </div>
            )}
            
            {allMedia.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <svg
                  className="w-12 h-12 text-text-secondary mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-text-main font-medium mb-1">No media imported</p>
                <p className="text-text-secondary text-xs">Import videos, audio and images.</p>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <svg
                  className="w-10 h-10 text-text-secondary mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-text-main font-medium mb-1">No matching media</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMedia.map((item) => {
                  const isSelected = selectedMediaId === item.id
                  return (
                    <div
                      key={item.id}
                      data-media-card
                      role="option"
                      aria-selected={isSelected}
                      aria-label={`${item.fileName}, ${item.mediaType}`}
                      tabIndex={0}
                      onClick={() => handleCardClick(item.id)}
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      className={`flex items-center p-3 rounded border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-app-hover border-[#4D8DFF] ring-1 ring-[#4D8DFF]'
                          : 'bg-app-secondary border-app-border hover:bg-app-hover'
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          getMediaIcon(item.mediaType)
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-main truncate" title={item.fileName}>
                          {item.fileName}
                        </div>
                        <div className="text-xs text-text-secondary flex items-center gap-2 flex-wrap">
                          <span className="capitalize">{item.mediaType}</span>
                          {(item.mediaType === 'video' || item.mediaType === 'audio') && item.durationUs > 0 && (
                            <>
                              <span>•</span>
                              <span>{formatDuration(item.durationUs)}</span>
                            </>
                          )}
                          {(item.width > 0 || item.height > 0) && (
                            <>
                              <span>•</span>
                              <span>{item.width}x{item.height}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatFileSize(item.fileSize)}</span>
                        </div>
                        <div className="text-xs text-text-secondary mt-0.5">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleRemoveMedia(e, item.id)}
                        onKeyDown={(e) => handleRemoveKeyDown(e, item.id)}
                        className="flex-shrink-0 ml-2 p-1.5 rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8DFF]"
                        aria-label={`Remove ${item.fileName}`}
                        title="Remove media"
                        tabIndex={0}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'filters' && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <svg
              className="w-12 h-12 text-text-secondary mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <p className="text-text-main font-medium mb-1">No filters available</p>
            <p className="text-text-secondary text-xs">Filters will appear here.</p>
          </div>
        )}
        
        {activeTab === 'transitions' && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <svg
              className="w-12 h-12 text-text-secondary mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <p className="text-text-main font-medium mb-1">No transitions available</p>
            <p className="text-text-secondary text-xs">Transitions will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeftSidebar
