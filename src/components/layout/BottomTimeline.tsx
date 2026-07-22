import { FC, useState, useRef } from 'react'
import { useTimelineStore } from '../../stores/timelineStore'
import TimelineToolbar from '../timeline/TimelineToolbar'
import TimelineRuler from '../timeline/TimelineRuler'
import TimelineGrid from '../timeline/TimelineGrid'
import TimelineTrackRow from '../timeline/TimelineTrackRow'
import { timeUsToPixels, pixelsToTimeUs } from '../../utils/coordinates'

const TRACK_HEIGHT = 52
const TRACK_COUNT = 4
const DEFAULT_DURATION_US = 60_000_000 // 60 seconds in microseconds

const tracks = [
  { id: 'video2', name: 'Video 2', type: 'video' as const },
  { id: 'video1', name: 'Video 1', type: 'video' as const },
  { id: 'audio1', name: 'Audio 1', type: 'audio' as const },
  { id: 'audio2', name: 'Audio 2', type: 'audio' as const },
]

const BottomTimeline: FC = () => {
  const [zoomPercentage, setZoomPercentage] = useState<number>(100)
  const setPlayheadTimeUs = useTimelineStore((state) => state.setPlayheadTimeUs)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return
    
    const scrollLeft = scrollContainerRef.current.scrollLeft
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left + scrollLeft
    const timeUs = pixelsToTimeUs(x, zoomPercentage)
    const clampedTime = Math.max(0, Math.min(DEFAULT_DURATION_US, timeUs))
    
    setPlayheadTimeUs(clampedTime)
  }

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
                trackName={track.name}
                trackType={track.type}
              />
            </div>
          ))}
        </div>

        {/* Scrollable Timeline Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
        >
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
                  className="absolute left-0 right-auto h-[52px] border-b border-app-border cursor-pointer"
                  style={{
                    top: tracks.findIndex(t => t.id === track.id) * TRACK_HEIGHT,
                  }}
                  onClick={handleTrackClick}
                >
                  <div
                    className="h-full bg-app-control/30"
                    style={{ minWidth: timeUsToPixels(DEFAULT_DURATION_US, zoomPercentage) }}
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
