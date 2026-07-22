import { FC, useState } from 'react'

type TabType = 'media' | 'filters' | 'transitions'

const LeftSidebar: FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('media')

  const tabs: { id: TabType; label: string }[] = [
    { id: 'media', label: 'Media' },
    { id: 'filters', label: 'Filters' },
    { id: 'transitions', label: 'Transitions' },
  ]

  return (
    <aside className="w-64 bg-app-panel border-r border-app-border flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-app-border">
        {tabs.map((tab) => (
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
      
      {/* Content */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
        {activeTab === 'media' && (
          <>
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
          </>
        )}
        
        {activeTab === 'filters' && (
          <>
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
          </>
        )}
        
        {activeTab === 'transitions' && (
          <>
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
          </>
        )}
      </div>
    </aside>
  )
}

export default LeftSidebar
