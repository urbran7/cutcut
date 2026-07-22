import { FC } from 'react'
import { useTimelineStore } from '../../stores/timelineStore'
import { Minus, Plus } from 'lucide-react'
import { formatTimeMicroseconds } from '../../utils/time'

interface TimelineToolbarProps {
  zoomPercentage: number
  onZoomChange: (zoom: number) => void
}

const MIN_ZOOM = 50
const MAX_ZOOM = 200
const ZOOM_STEP = 10

const TimelineToolbar: FC<TimelineToolbarProps> = ({ zoomPercentage, onZoomChange }) => {
  const playheadTimeUs = useTimelineStore((state) => state.playheadTimeUs)
  
  const handleZoomOut = () => {
    onZoomChange(Math.max(MIN_ZOOM, zoomPercentage - ZOOM_STEP))
  }

  const handleZoomIn = () => {
    onZoomChange(Math.min(MAX_ZOOM, zoomPercentage + ZOOM_STEP))
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onZoomChange(Number(e.target.value))
  }

  return (
    <div className="h-8 bg-app-panel border-b border-app-border flex items-center px-3 gap-3">
      <span className="text-text-main font-semibold text-sm">Timeline</span>
      
      {/* Current time display */}
      <span className="text-text-secondary text-xs font-mono">
        {formatTimeMicroseconds(playheadTimeUs)}
      </span>
      
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={handleZoomOut}
          disabled={zoomPercentage <= MIN_ZOOM}
          className="p-1 rounded hover:bg-app-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4 text-text-secondary" />
        </button>
        
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={ZOOM_STEP}
          value={zoomPercentage}
          onChange={handleSliderChange}
          className="w-24 accent-app-primary"
          aria-label="Zoom level"
        />
        
        <button
          onClick={handleZoomIn}
          disabled={zoomPercentage >= MAX_ZOOM}
          className="p-1 rounded hover:bg-app-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4 text-text-secondary" />
        </button>
        
        <span className="text-text-secondary text-xs w-12 text-right">
          {zoomPercentage}%
        </span>
      </div>
    </div>
  )
}

export default TimelineToolbar
