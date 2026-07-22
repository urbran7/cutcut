import { FC } from 'react'
import TopToolbar from './TopToolbar'
import LeftSidebar from './LeftSidebar'
import CenterPreview from './CenterPreview'
import RightInspector from './RightInspector'
import BottomTimeline from './BottomTimeline'

const AppLayout: FC = () => {
  return (
    <div className="h-screen w-screen bg-app-bg flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />
        
        {/* Center Preview */}
        <CenterPreview />
        
        {/* Right Inspector */}
        <RightInspector />
      </div>
      
      {/* Bottom Timeline */}
      <BottomTimeline />
    </div>
  )
}

export default AppLayout
