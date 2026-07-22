export interface TimelineMetrics {
  trackHeaderWidth: number
  zoom: number // pixels per microsecond
  scrollLeft: number
}

const DEFAULT_TRACK_HEADER_WIDTH = 100

export function timeUsToPixels(timeUs: number, zoom: number): number {
  return timeUs * zoom
}

export function pixelsToTimeUs(pixels: number, zoom: number): number {
  return pixels / zoom
}

export function clientXToTimelineTimeUs(
  clientX: number,
  containerRect: DOMRect,
  metrics: TimelineMetrics
): number {
  const x = clientX - containerRect.left - metrics.trackHeaderWidth + metrics.scrollLeft
  return Math.max(0, pixelsToTimeUs(x, metrics.zoom))
}

export function timelineTimeUsToClientX(
  timeUs: number,
  containerRect: DOMRect,
  metrics: TimelineMetrics
): number {
  const x = timeUsToPixels(timeUs, metrics.zoom)
  return containerRect.left + metrics.trackHeaderWidth + x - metrics.scrollLeft
}

export function getTimelineMetrics(
  trackHeaderWidth: number = DEFAULT_TRACK_HEADER_WIDTH,
  zoom: number,
  scrollLeft: number
): TimelineMetrics {
  return {
    trackHeaderWidth,
    zoom,
    scrollLeft,
  }
}
