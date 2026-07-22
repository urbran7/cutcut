import { FC, useState } from 'react'
import TimelineToolbar from '../timeline/TimelineToolbar'
import TimelineRuler from '../timeline/TimelineRuler'
import TimelineGrid from '../timeline/TimelineGrid'
import TimelineTrackRow from '../timeline/TimelineTrackRow'

const TRACK_HEIGHT = 52
const TRACK_COUNT = 4
const DEFAULT_DURATION_US = 60_000_000 // 60 seconds in microseconds
const DEFAULT_ZOOM = 100

const tracks = [
  { id: 'video2', name: 'Video 2', type: 'video' as const },
  { id: 'video1', name: 'Video 1', type: 'video' as const },
  { id: 'audio1', name: 'Audio 1', type: 'audio' as const },
  { id: 'audio2', name: 'Audio 2', type: 'audio' as const },
]

const BottomTimeline: FC = () => {
  const [zoomPercentage, setZoomPercentage] = useState<number>(DEFAULT_ZOOM)

  return (
    <section className="h-64 bg-app-panel border-t border-app-border flex flex-col">
      {/* Timeline Toolbar */}
      <TimelineToolbar 
        zoomPercentage={zoomPercentage}
        onZoomChange={setZoomPercentage}
      />
      
      {/* Timeline Content Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Track Headers Column */}
        <div className="w-[120px] flex-shrink-0 border-r border-app-border bg-app-secondary">
          {/* Ruler header spacer */}
          <div className="h-6 border-b border-app-border" />
          
          {/* Track headers */}
          {tracks.map((track) => (
            <div
              key={`header-${track.id}`}
              className="h-[52px] border-b border-app-border"
            >
              <TimelineTrackRow 
                trackId={track.id}
                trackName={track.name}
                trackType={track.type}
              />
            </div>
          ))}
        </div>
        
        {/* Scrollable Timeline Content */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="relative">
            {/* Ruler */}
            <TimelineRuler 
              durationUs={DEFAULT_DURATION_US}
              zoomPercentage={zoomPercentage}
            />
            
            {/* Tracks with Grid */}
            <div className="relative" style={{ height: TRACK_HEIGHT * TRACK_COUNT }}>
              <TimelineGrid 
                durationUs={DEFAULT_DURATION_US}
                zoomPercentage={zoomPercentage}
                trackHeight={TRACK_HEIGHT}
                trackCount={TRACK_COUNT}
              />
              
              {/* Track rows */}
              {tracks.map((track) => (
                <div
                  key={`row-${track.id}`}
                  className="absolute left-0 right-auto h-[52px] border-b border-app-border"
                  style={{ 
                    top: tracks.findIndex(t => t.id === track.id) * TRACK_HEIGHT,
                    width: 'max-content'
                  }}
                >
                  <div 
                    className="h-full bg-app-control/30"
                    style={{ minWidth: '100%' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BottomTimeline
