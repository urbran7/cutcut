import { FC } from 'react'

const CenterPreview: FC = () => {
  return (
    <main className="flex-1 bg-app-secondary p-4 flex flex-col">
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center mb-4">
        <div className="w-full h-full max-w-4xl max-h-[60vh] bg-app-control rounded border border-app-border flex items-center justify-center">
          <p className="text-text-secondary text-lg">Preview</p>
        </div>
      </div>
      
      {/* Playback Controls */}
      <div className="h-14 bg-app-panel rounded border border-app-border flex items-center justify-center gap-4 px-4">
        <button
          className="px-3 py-1.5 text-sm bg-app-control rounded hover:bg-app-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-main"
          disabled
        >
          Play
        </button>
        <button
          className="px-3 py-1.5 text-sm bg-app-control rounded hover:bg-app-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-main"
          disabled
        >
          Pause
        </button>
        <button
          className="px-3 py-1.5 text-sm bg-app-control rounded hover:bg-app-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-main"
          disabled
        >
          Stop
        </button>
        
        <div className="h-6 w-px bg-app-border mx-2" />
        
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <span>Current Time:</span>
          <span className="text-text-main font-mono">00:00</span>
        </div>
        
        <div className="h-6 w-px bg-app-border mx-2" />
        
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <span>Duration:</span>
          <span className="text-text-main font-mono">00:00</span>
        </div>
      </div>
    </main>
  )
}

export default CenterPreview
