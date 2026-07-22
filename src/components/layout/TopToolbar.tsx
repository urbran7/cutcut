import { FC } from 'react'

const TopToolbar: FC = () => {
  const toolbarButtons = [
    'New',
    'Open',
    'Save',
    'Import',
    'Undo',
    'Redo',
    'Split',
    'Delete',
    'Export',
  ]

  return (
    <header className="h-14 bg-app-panel border-b border-app-border flex items-center justify-between px-4">
      {/* Left side - Toolbar buttons */}
      <div className="flex items-center gap-2">
        {toolbarButtons.map((label) => (
          <button
            key={label}
            className="px-3 py-1.5 text-sm bg-app-control rounded hover:bg-app-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-main"
            // Import button is now enabled - functionality handled by file input in LeftSidebar
            disabled={label !== 'Import'}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Right side - App name and version */}
      <div className="flex items-center gap-4">
        <span className="text-text-main font-semibold">NovaCut</span>
        <span className="text-text-secondary text-xs">Version 0.1</span>
      </div>
    </header>
  )
}

export default TopToolbar
