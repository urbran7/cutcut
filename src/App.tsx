import { FC } from 'react'

const App: FC = () => {
  return (
    <div className="h-screen w-screen bg-app-bg text-text-main flex items-center justify-center">
      <div className="text-center p-8 bg-app-panel rounded-lg border border-app-border max-w-md">
        <h1 className="text-3xl font-bold mb-2">NovaCut Web Lite</h1>
        <p className="text-text-secondary mb-6">Lightweight recap video editor</p>
        <div className="space-y-4">
          <p className="text-sm text-accent-success">Project foundation ready</p>
          <div className="flex gap-3 justify-center">
            <button 
              className="px-4 py-2 bg-app-control rounded hover:bg-app-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled
            >
              Create Project
            </button>
            <button 
              className="px-4 py-2 bg-app-control rounded hover:bg-app-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled
            >
              Import Media
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
