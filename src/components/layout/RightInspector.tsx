import { FC } from 'react'

const RightInspector: FC = () => {
  return (
    <aside className="w-72 bg-app-panel border-l border-app-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-app-border flex items-center px-4">
        <h2 className="text-text-main font-semibold">Inspector</h2>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 flex items-center justify-center text-center">
        <p className="text-text-secondary text-sm">No clip selected.</p>
      </div>
    </aside>
  )
}

export default RightInspector
