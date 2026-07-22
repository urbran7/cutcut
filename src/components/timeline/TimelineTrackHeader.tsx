import { FC } from 'react'
import { Film, Mic, Eye, Lock } from 'lucide-react'

interface TimelineTrackHeaderProps {
  trackName: string
  trackType: 'video' | 'audio'
}

const TimelineTrackHeader: FC<TimelineTrackHeaderProps> = ({ 
  trackName, 
  trackType 
}) => {
  const isVideo = trackType === 'video'
  
  return (
    <div 
      className="w-[120px] h-[52px] bg-app-secondary border-r border-app-border flex items-center px-2 gap-2 flex-shrink-0"
      role="rowheader"
      aria-label={`${trackName} track header`}
    >
      {/* Track icon */}
      <div className="flex-shrink-0">
        {isVideo ? (
          <Film className="w-4 h-4 text-text-secondary" aria-hidden="true" />
        ) : (
          <Mic className="w-4 h-4 text-text-secondary" aria-hidden="true" />
        )}
      </div>
      
      {/* Track name */}
      <span className="text-text-secondary text-xs truncate flex-1" title={trackName}>
        {trackName}
      </span>
      
      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {isVideo && (
          <button
            disabled
            className="p-0.5 rounded hover:bg-app-primary disabled:opacity-30 disabled:cursor-not-allowed"
            title="Toggle visibility"
            aria-label={`Toggle ${trackName} visibility`}
          >
            <Eye className="w-3 h-3 text-text-secondary" />
          </button>
        )}
        
        {!isVideo && (
          <button
            disabled
            className="p-0.5 rounded hover:bg-app-primary disabled:opacity-30 disabled:cursor-not-allowed"
            title="Mute track"
            aria-label={`Mute ${trackName}`}
          >
            <Mic className="w-3 h-3 text-text-secondary" />
          </button>
        )}
        
        <button
          disabled
          className="p-0.5 rounded hover:bg-app-primary disabled:opacity-30 disabled:cursor-not-allowed"
          title="Lock track"
          aria-label={`Lock ${trackName}`}
        >
          <Lock className="w-3 h-3 text-text-secondary" />
        </button>
      </div>
    </div>
  )
}

export default TimelineTrackHeader
