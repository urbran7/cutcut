let idCounter = 0

export function generateId(): string {
  return `id_${Date.now()}_${++idCounter}`
}

export function generateLinkId(): string {
  return `link_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
