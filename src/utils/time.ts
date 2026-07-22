export const US_PER_SECOND = 1_000_000

export function secondsToUs(seconds: number): number {
  return Math.round(seconds * US_PER_SECOND)
}

export function usToSeconds(us: number): number {
  return us / US_PER_SECOND
}

/**
 * Format time in microseconds to MM:SS.mmm format
 * Examples:
 *   0 us -> "00:00.000"
 *   5_250_000 us (5.25s) -> "00:05.250"
 *   65_125_000 us (65.125s) -> "01:05.125"
 */
export function formatTimeMicroseconds(us: number): string {
  const clamped = Math.max(0, us)
  const totalMs = Math.floor(clamped / 1000) // Convert to milliseconds
  const minutes = Math.floor(totalMs / 60000)
  const seconds = Math.floor((totalMs % 60000) / 1000)
  const milliseconds = totalMs % 1000
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
}

export function formatTime(us: number): string {
  const totalSeconds = Math.floor(us / US_PER_SECOND)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const frames = Math.floor((us % US_PER_SECOND) / (US_PER_SECOND / 30))

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
}

export function formatDuration(us: number): string {
  const totalSeconds = Math.floor(us / US_PER_SECOND)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}
