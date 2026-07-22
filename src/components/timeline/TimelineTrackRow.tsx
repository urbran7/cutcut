import { FC } from 'react'
import TimelineTrackHeader from './TimelineTrackHeader'

interface TimelineTrackRowProps {
  trackName: string
  trackType: 'video' | 'audio'
}

const TRACK_HEIGHT = 52

const TimelineTrackRow: FC<TimelineTrackRowProps> = ({ 
  trackName, 
  trackType 
}) => {
  return (
    <div 
      className="h-[52px] flex border-b border-app-border"
      role="row"
      aria-label={`${trackName} track`}
    >
      {/* Fixed Track Header */}
      <TimelineTrackHeader 
        trackName={trackName}
        trackType={trackType}
      />
      
      {/* Scrollable Track Content */}
      <div 
        className="flex-1 bg-app-control/30 relative"
        style={{ height: TRACK_HEIGHT }}
      >
        {/* Empty track content - no clips in Step 6 */}
      </div>
    </div>
  )
}

export default TimelineTrackRow
