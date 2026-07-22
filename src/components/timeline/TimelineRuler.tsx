import { FC, useMemo } from 'react'
import { timeUsToPixels } from '../../utils/coordinates'

interface TimelineRulerProps {
  durationUs: number
  zoomPercentage: number
}

const MAJOR_TICK_INTERVAL_US = 5_000_000 // 5 seconds in microseconds
const MINOR_TICK_INTERVAL_US = 1_000_000 // 1 second in microseconds

const TimelineRuler: FC<TimelineRulerProps> = ({ durationUs, zoomPercentage }) => {
  const rulerWidth = useMemo(() => {
    return timeUsToPixels(durationUs, zoomPercentage)
  }, [durationUs, zoomPercentage])

  // Generate major tick labels (every 5 seconds)
  const majorTicks = useMemo(() => {
    const ticks: number[] = []
    for (let us = 0; us <= durationUs; us += MAJOR_TICK_INTERVAL_US) {
      ticks.push(us)
    }
    return ticks
  }, [durationUs])

  // Generate minor ticks (every 1 second, excluding major ticks)
  const minorTicks = useMemo(() => {
    const ticks: number[] = []
    for (let us = 0; us <= durationUs; us += MINOR_TICK_INTERVAL_US) {
      if (us % MAJOR_TICK_INTERVAL_US !== 0) {
        ticks.push(us)
      }
    }
    return ticks
  }, [durationUs])

  return (
    <div 
      className="h-6 bg-app-secondary border-b border-app-border relative overflow-hidden"
      style={{ width: rulerWidth }}
    >
      {/* Minor ticks */}
      {minorTicks.map((us) => {
        const left = timeUsToPixels(us, zoomPercentage)
        return (
          <div
            key={`minor-${us}`}
            className="absolute bottom-0 w-px h-2 bg-app-border"
            style={{ left }}
          />
        )
      })}
      
      {/* Major ticks and labels */}
      {majorTicks.map((us) => {
        const left = timeUsToPixels(us, zoomPercentage)
        const seconds = us / 1_000_000
        return (
          <div
            key={`major-${us}`}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left }}
          >
            <div className="h-3 w-px bg-text-secondary" />
            <span className="text-text-secondary text-xs mt-0.5 select-none">
              {seconds}s
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default TimelineRuler
