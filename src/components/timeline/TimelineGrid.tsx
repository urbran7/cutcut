import { FC, useMemo } from 'react'
import { timeUsToPixels } from '../../utils/coordinates'

interface TimelineGridProps {
  durationUs: number
  zoomPercentage: number
  trackHeight: number
  trackCount: number
}

const MAJOR_GRID_INTERVAL_US = 5_000_000 // 5 seconds in microseconds
const MINOR_GRID_INTERVAL_US = 1_000_000 // 1 second in microseconds

const TimelineGrid: FC<TimelineGridProps> = ({ 
  durationUs, 
  zoomPercentage,
  trackHeight,
  trackCount 
}) => {
  const gridWidth = useMemo(() => {
    return timeUsToPixels(durationUs, zoomPercentage)
  }, [durationUs, zoomPercentage])

  const totalHeight = trackHeight * trackCount

  // Generate major vertical grid lines (every 5 seconds)
  const majorLines = useMemo(() => {
    const lines: number[] = []
    for (let us = 0; us <= durationUs; us += MAJOR_GRID_INTERVAL_US) {
      lines.push(us)
    }
    return lines
  }, [durationUs])

  // Generate minor vertical grid lines (every 1 second, excluding major)
  const minorLines = useMemo(() => {
    const lines: number[] = []
    for (let us = 0; us <= durationUs; us += MINOR_GRID_INTERVAL_US) {
      if (us % MAJOR_GRID_INTERVAL_US !== 0) {
        lines.push(us)
      }
    }
    return lines
  }, [durationUs])

  // Generate horizontal track separators
  const horizontalLines = useMemo(() => {
    const lines: number[] = []
    for (let i = 1; i < trackCount; i++) {
      lines.push(i * trackHeight)
    }
    return lines
  }, [trackCount, trackHeight])

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ width: gridWidth, height: totalHeight }}
    >
      {/* Minor vertical grid lines */}
      {minorLines.map((us) => {
        const left = timeUsToPixels(us, zoomPercentage)
        return (
          <div
            key={`minor-${us}`}
            className="absolute top-0 bottom-0 w-px bg-app-border opacity-50"
            style={{ left }}
          />
        )
      })}
      
      {/* Major vertical grid lines */}
      {majorLines.map((us) => {
        const left = timeUsToPixels(us, zoomPercentage)
        return (
          <div
            key={`major-${us}`}
            className="absolute top-0 bottom-0 w-px bg-app-border"
            style={{ left }}
          />
        )
      })}
      
      {/* Horizontal track separators */}
      {horizontalLines.map((y, index) => (
        <div
          key={`h-${index}`}
          className="absolute left-0 right-0 h-px bg-app-border"
          style={{ top: y }}
        />
      ))}
    </div>
  )
}

export default TimelineGrid
