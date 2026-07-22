import { Project, MediaItem } from '../models/project'

const DB_NAME = 'NovaCutWebLite'
const DB_VERSION = 1
const PROJECTS_STORE = 'projects'
const METADATA_STORE = 'metadata'

let db: IDBDatabase | null = null

export async function openDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db!)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      if (!database.objectStoreNames.contains(PROJECTS_STORE)) {
        database.createObjectStore(PROJECTS_STORE, { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        database.createObjectStore(METADATA_STORE, { keyPath: 'id' })
      }
    }
  })
}

export async function saveProject(project: Project): Promise<void> {
  const database = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PROJECTS_STORE], 'readwrite')
    const store = transaction.objectStore(PROJECTS_STORE)
    
    const request = store.put({
      id: project.id,
      name: project.name,
      data: project,
      updatedAt: Date.now(),
    })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to save project'))
  })
}

export async function loadProject(projectId: string): Promise<Project | null> {
  const database = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PROJECTS_STORE], 'readonly')
    const store = transaction.objectStore(PROJECTS_STORE)
    
    const request = store.get(projectId)

    request.onsuccess = () => {
      const result = request.result
      resolve(result?.data || null)
    }
    request.onerror = () => reject(new Error('Failed to load project'))
  })
}

export async function getAllProjects(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
  const database = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PROJECTS_STORE], 'readonly')
    const store = transaction.objectStore(PROJECTS_STORE)
    
    const request = store.getAll()

    request.onsuccess = () => {
      const results = request.result.map((item: any) => ({
        id: item.id,
        name: item.name,
        updatedAt: item.updatedAt,
      }))
      resolve(results)
    }
    request.onerror = () => reject(new Error('Failed to get projects'))
  })
}

export async function deleteProject(projectId: string): Promise<void> {
  const database = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PROJECTS_STORE], 'readwrite')
    const store = transaction.objectStore(PROJECTS_STORE)
    
    const request = store.delete(projectId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to delete project'))
  })
}

export async function saveMediaMetadata(mediaId: string, metadata: {
  fileName: string
  fileSize: number
  mimeType: string
  durationUs: number
  width: number
  height: number
  mediaType: string
}): Promise<void> {
  const database = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([METADATA_STORE], 'readwrite')
    const store = transaction.objectStore(METADATA_STORE)
    
    const request = store.put({
      id: mediaId,
      ...metadata,
      savedAt: Date.now(),
    })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to save media metadata'))
  })
}

export async function loadMediaMetadata(mediaId: string): Promise<any | null> {
  const database = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([METADATA_STORE], 'readonly')
    const store = transaction.objectStore(METADATA_STORE)
    
    const request = store.get(mediaId)

    request.onsuccess = () => {
      resolve(request.result || null)
    }
    request.onerror = () => reject(new Error('Failed to load media metadata'))
  })
}

export function exportProjectJSON(project: Project): string {
  return JSON.stringify(project, null, 2)
}

export function importProjectJSON(json: string): Project | null {
  try {
    const project = JSON.parse(json)
    
    // Basic validation
    if (!project.id || !project.name || !project.tracks || !project.media) {
      return null
    }
    
    return project as Project
  } catch {
    return null
  }
}

export function downloadFile(content: string, filename: string, mimeType: string = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
