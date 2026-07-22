import { FC, useRef, useCallback, useEffect } from 'react'
import { useTimelineStore } from '../../stores/timelineStore'
import { timeUsToPixels, clientXToTimelineTimeUs, getTimelineMetrics } from '../../utils/coordinates'

const PLAYHEAD_COLOR = '#4D8DFF'
const HANDLE_WIDTH = 12
const HANDLE_HEIGHT = 16

interface TimelinePlayheadProps {
  containerRef: React.RefObject<HTMLDivElement>
  scrollContainerRef: React.RefObject<HTMLDivElement>
}

const TimelinePlayhead: FC<TimelinePlayheadProps> = ({ containerRef, scrollContainerRef }) => {
  const playheadTimeUs = useTimelineStore((state) => state.playheadTimeUs)
  const setPlayheadTimeUs = useTimelineStore((state) => state.setPlayheadTimeUs)
  const isDraggingPlayhead = useTimelineStore((state) => state.isDraggingPlayhead)
  const setDraggingPlayhead = useTimelineStore((state) => state.setDraggingPlayhead)
  const zoomPercentage = useTimelineStore((state) => state.zoomPercentage)
  const timelineDurationUs = useTimelineStore((state) => state.timelineDurationUs)
  
  const handleRef = useRef<HTMLDivElement>(null)

  // Calculate playhead pixel position
  const playheadX = timeUsToPixels(playheadTimeUs, zoomPercentage)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDraggingPlayhead(true)
    
    // Set pointer capture for continuous tracking
    const target = e.currentTarget as HTMLElement
    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId)
    }
  }, [setDraggingPlayhead])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingPlayhead) return
    
    e.preventDefault()
    
    if (!containerRef.current || !scrollContainerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const scrollLeft = scrollContainerRef.current.scrollLeft
    
    const metrics = getTimelineMetrics(120, zoomPercentage, scrollLeft)
    const timeUs = clientXToTimelineTimeUs(e.clientX, containerRect, metrics)
    const clampedTime = Math.max(0, Math.min(timelineDurationUs, timeUs))
    
    setPlayheadTimeUs(clampedTime)
  }, [isDraggingPlayhead, containerRef, scrollContainerRef, zoomPercentage, timelineDurationUs, setPlayheadTimeUs])

  const handlePointerUp = useCallback((_e: PointerEvent) => {
    if (!isDraggingPlayhead) return
    
    setDraggingPlayhead(false)
  }, [isDraggingPlayhead, setDraggingPlayhead])

  // Keyboard seeking
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 1_000_000 : 100_000 // 1s or 100ms
    let newTime = playheadTimeUs

    switch (e.key) {
      case 'ArrowLeft':
        newTime = Math.max(0, playheadTimeUs - step)
        e.preventDefault()
        break
      case 'ArrowRight':
        newTime = Math.min(timelineDurationUs, playheadTimeUs + step)
        e.preventDefault()
        break
      case 'Home':
        newTime = 0
        e.preventDefault()
        break
      case 'End':
        newTime = timelineDurationUs
        e.preventDefault()
        break
      default:
        return
    }

    setPlayheadTimeUs(newTime)
  }, [playheadTimeUs, timelineDurationUs, setPlayheadTimeUs])

  // Attach global pointer listeners when dragging
  useEffect(() => {
    if (!isDraggingPlayhead) return

    const onPointerMove = (e: PointerEvent) => handlePointerMove(e)
    const onPointerUp = (e: PointerEvent) => handlePointerUp(e)
    const onPointerCancel = () => {
      setDraggingPlayhead(false)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [isDraggingPlayhead, handlePointerMove, handlePointerUp, setDraggingPlayhead])

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDraggingPlayhead) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'ew-resize'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    return () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDraggingPlayhead])

  const minTime = 0
  const maxTime = timelineDurationUs

  return (
    <>
      {/* Playhead handle above ruler */}
      <div
        ref={handleRef}
        role="slider"
        aria-label="Timeline playhead"
        aria-valuemin={minTime}
        aria-valuemax={maxTime}
        aria-valuenow={playheadTimeUs}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        className={`absolute top-0 z-20 flex flex-col items-center justify-end cursor-pointer`}
        style={{ 
          left: playheadX - HANDLE_WIDTH / 2,
          width: HANDLE_WIDTH,
          height: HANDLE_HEIGHT,
        }}
      >
        {/* Triangle handle */}
        <div 
          className="w-0 h-0"
          style={{
            borderLeft: `${HANDLE_WIDTH / 2}px solid transparent`,
            borderRight: `${HANDLE_WIDTH / 2}px solid transparent`,
            borderBottom: `${HANDLE_HEIGHT}px solid ${PLAYHEAD_COLOR}`,
          }}
        />
      </div>
      
      {/* Vertical line through ruler and tracks */}
      <div
        className="absolute top-6 bottom-0 w-px z-10 pointer-events-none"
        style={{ 
          left: playheadX,
          backgroundColor: PLAYHEAD_COLOR,
        }}
      />
    </>
  )
}

export default TimelinePlayhead
