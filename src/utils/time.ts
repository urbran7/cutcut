export const US_PER_SECOND = 1_000_000

export function secondsToUs(seconds: number): number {
  return Math.round(seconds * US_PER_SECOND)
}

export function usToSeconds(us: number): number {
  return us / US_PER_SECOND
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
