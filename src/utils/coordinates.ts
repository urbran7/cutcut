// Timeline coordinate utilities using integer microseconds as canonical time
// Default: 20 pixels per second at 100% zoom = 0.02 pixels per microsecond

export interface TimelineMetrics {
  trackHeaderWidth: number
  zoomPercentage: number // 50-200, where 100 is base zoom
  scrollLeft: number
}

const DEFAULT_TRACK_HEADER_WIDTH = 120
const BASE_PIXELS_PER_SECOND = 20 // At 100% zoom
const US_PER_SECOND = 1_000_000

// Base zoom: pixels per microsecond at 100%
const BASE_ZOOM = BASE_PIXELS_PER_SECOND / US_PER_SECOND

/**
 * Convert time in microseconds to pixels based on zoom percentage
 */
export function timeUsToPixels(timeUs: number, zoomPercentage: number): number {
  if (!Number.isFinite(timeUs)) {
    throw new Error('timeUs must be a finite number')
  }
  if (!Number.isFinite(zoomPercentage) || zoomPercentage <= 0) {
    throw new Error('zoomPercentage must be a positive finite number')
  }
  const zoom = BASE_ZOOM * (zoomPercentage / 100)
  return Math.round(timeUs * zoom)
}

/**
 * Convert pixels to time in microseconds based on zoom percentage
 */
export function pixelsToTimeUs(pixels: number, zoomPercentage: number): number {
  if (!Number.isFinite(pixels)) {
    throw new Error('pixels must be a finite number')
  }
  if (!Number.isFinite(zoomPercentage) || zoomPercentage <= 0) {
    throw new Error('zoomPercentage must be a positive finite number')
  }
  const zoom = BASE_ZOOM * (zoomPercentage / 100)
  return Math.round(pixels / zoom)
}

export function clientXToTimelineTimeUs(
  clientX: number,
  containerRect: DOMRect,
  metrics: TimelineMetrics
): number {
  const x = clientX - containerRect.left - metrics.trackHeaderWidth + metrics.scrollLeft
  return Math.max(0, pixelsToTimeUs(x, metrics.zoomPercentage))
}

export function timelineTimeUsToClientX(
  timeUs: number,
  containerRect: DOMRect,
  metrics: TimelineMetrics
): number {
  const x = timeUsToPixels(timeUs, metrics.zoomPercentage)
  return containerRect.left + metrics.trackHeaderWidth + x - metrics.scrollLeft
}

export function getTimelineMetrics(
  trackHeaderWidth: number = DEFAULT_TRACK_HEADER_WIDTH,
  zoomPercentage: number,
  scrollLeft: number
): TimelineMetrics {
  return {
    trackHeaderWidth,
    zoomPercentage,
    scrollLeft,
  }
}
