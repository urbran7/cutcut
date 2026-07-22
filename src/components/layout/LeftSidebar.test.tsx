import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { useProjectStore } from '../../stores/projectStore'
import { useUIStore } from '../../stores/uiStore'
import { MediaItem } from '../../models/project'

// Mock the media service to avoid actual file processing
vi.mock('../../services/mediaService', () => ({
  createMediaItemFromFile: vi.fn(),
  detectMediaTypeFromExtension: vi.fn(() => 'image'),
}))

// Mock URL.revokeObjectURL for jsdom
beforeEach(() => {
  if (typeof URL.revokeObjectURL !== 'function') {
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
  }
})

function createMockMedia(overrides: Partial<MediaItem> = {}): MediaItem {
  const id = overrides.id ?? `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const now = Date.now()
  return {
    id,
    name: overrides.name ?? 'test.jpg',
    fileName: overrides.fileName ?? 'test.jpg',
    fileSize: overrides.fileSize ?? 1024,
    mimeType: overrides.mimeType ?? 'image/jpeg',
    mediaType: overrides.mediaType ?? 'image',
    durationUs: overrides.durationUs ?? 0,
    width: overrides.width ?? 1920,
    height: overrides.height ?? 1080,
    objectUrl: overrides.objectUrl ?? 'blob:mock/test-url',
    thumbnailUrl: overrides.thumbnailUrl ?? 'blob:mock/test-url',
    createdAt: overrides.createdAt ?? now,
    ...overrides,
  }
}

function setupMediaInStore(mediaItems: MediaItem[]) {
  const store = useProjectStore.getState()
  
  // Initialize project if not already done
  if (!store.project) {
    store.createProject('Test Project')
  }
  
  // Add media items
  for (const item of mediaItems) {
    store.addMedia(item)
  }
}

describe('LeftSidebar - Media Selection', () => {
  beforeEach(() => {
    // Reset stores before each test
    useProjectStore.setState({
      project: null,
      runtimeMedia: new Map(),
      selectedMediaId: null,
      dirty: false,
    })
    useUIStore.setState({
      notifications: [],
      importMediaTrigger: 0,
      activePanelTab: 'media',
      inspectorVisible: true,
    })
  })

  it('renders the Media tab', () => {
    render(<App />)
    expect(screen.getByText('Media')).toBeInTheDocument()
  })

  it('renders empty state when no media imported', () => {
    render(<App />)
    expect(screen.getByText('No media imported')).toBeInTheDocument()
  })

  it('shows 0 items count when no media', () => {
    render(<App />)
    expect(screen.getByText('0 items')).toBeInTheDocument()
  })

  it('shows 1 item count with one media item', () => {
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'photo.jpg' })])
    render(<App />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('shows N items count with multiple media items', () => {
    setupMediaInStore([
      createMockMedia({ id: 'test1', fileName: 'photo1.jpg' }),
      createMockMedia({ id: 'test2', fileName: 'photo2.jpg' }),
      createMockMedia({ id: 'test3', fileName: 'photo3.jpg' }),
    ])
    render(<App />)
    expect(screen.getByText('3 items')).toBeInTheDocument()
  })

  it('clicking a media card selects it', async () => {
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'photo.jpg' })])
    render(<App />)
    
    const card = screen.getByRole('option', { name: /photo\.jpg.*image/i })
    await userEvent.click(card)
    
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
  })

  it('clicking another card moves selection', async () => {
    setupMediaInStore([
      createMockMedia({ id: 'test1', fileName: 'photo1.jpg' }),
      createMockMedia({ id: 'test2', fileName: 'photo2.jpg' }),
    ])
    render(<App />)
    
    const card1 = screen.getByRole('option', { name: /photo1\.jpg.*image/i })
    await userEvent.click(card1)
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
    
    const card2 = screen.getByRole('option', { name: /photo2\.jpg.*image/i })
    await userEvent.click(card2)
    expect(useProjectStore.getState().selectedMediaId).toBe('test2')
  })

  it('only one media item is selected at a time', async () => {
    const items = [
      createMockMedia({ id: 'test1', fileName: 'photo1.jpg' }),
      createMockMedia({ id: 'test2', fileName: 'photo2.jpg' }),
      createMockMedia({ id: 'test3', fileName: 'photo3.jpg' }),
    ]
    setupMediaInStore(items)
    render(<App />)
    
    const card2 = screen.getByRole('option', { name: /photo2\.jpg.*image/i })
    await userEvent.click(card2)
    
    const selectedCards = screen.getAllByRole('option').filter(
      card => card.getAttribute('aria-selected') === 'true'
    )
    expect(selectedCards).toHaveLength(1)
    expect(selectedCards[0]).toHaveTextContent('photo2.jpg')
  })

  it('selected visual state is applied with accent outline', async () => {
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'photo.jpg' })])
    render(<App />)
    
    const card = screen.getByRole('option', { name: /photo\.jpg.*image/i })
    await userEvent.click(card)
    
    expect(card.className).toContain('border-[#4D8DFF]')
    expect(card.className).toContain('ring-1')
  })

  it('clicking empty Media panel space clears selection', async () => {
    setupMediaInStore([
      createMockMedia({ id: 'test1', fileName: 'photo.jpg' }),
    ])
    render(<App />)
    
    // First select a card
    const card = screen.getByRole('option', { name: /photo\.jpg.*image/i })
    await userEvent.click(card)
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
    
    // Click on the panel container itself (outside any card)
    const panel = document.querySelector('[data-media-panel]')
    expect(panel).not.toBeNull()
    fireEvent.click(panel!)
    
    // Selection should be cleared
    expect(useProjectStore.getState().selectedMediaId).toBeNull()
  })

  it('Enter selects a focused media card', async () => {
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'photo.jpg' })])
    render(<App />)
    
    const card = screen.getByRole('option', { name: /photo\.jpg.*image/i })
    card.focus()
    fireEvent.keyDown(card, { key: 'Enter' })
    
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
  })

  it('Space selects a focused media card', async () => {
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'photo.jpg' })])
    render(<App />)
    
    const card = screen.getByRole('option', { name: /photo\.jpg.*image/i })
    card.focus()
    fireEvent.keyDown(card, { key: ' ' })
    
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
  })

  it('Escape clears media selection', async () => {
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'photo.jpg' })])
    render(<App />)
    
    // Select a card first
    const card = screen.getByRole('option', { name: /photo\.jpg.*image/i })
    await userEvent.click(card)
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
    
    // Press Escape
    const panel = document.querySelector('[data-media-panel]')
    fireEvent.keyDown(panel!, { key: 'Escape' })
    
    expect(useProjectStore.getState().selectedMediaId).toBeNull()
  })
})

describe('LeftSidebar - Search', () => {
  beforeEach(() => {
    useProjectStore.setState({
      project: null,
      runtimeMedia: new Map(),
      selectedMediaId: null,
      dirty: false,
    })
    useUIStore.setState({
      notifications: [],
      importMediaTrigger: 0,
      activePanelTab: 'media',
      inspectorVisible: true,
    })
    
    setupMediaInStore([
      createMockMedia({ id: 'vid1', fileName: 'vacation.mp4', mediaType: 'video', durationUs: 10_000_000 }),
      createMockMedia({ id: 'aud1', fileName: 'song.mp3', mediaType: 'audio', durationUs: 30_000_000 }),
      createMockMedia({ id: 'img1', fileName: 'sunset.jpg', mediaType: 'image' }),
      createMockMedia({ id: 'img2', fileName: 'Sunset Beach.png', mediaType: 'image' }),
      createMockMedia({ id: 'vid2', fileName: 'clip.mp4', mediaType: 'video', durationUs: 5_000_000 }),
    ])
  })

  it('search filters by filename', async () => {
    render(<App />)
    
    const searchInput = screen.getByPlaceholderText('Search media...')
    await userEvent.type(searchInput, 'sunset')
    
    expect(screen.getByText('sunset.jpg')).toBeInTheDocument()
    expect(screen.queryByText('vacation.mp4')).not.toBeInTheDocument()
    expect(screen.queryByText('song.mp3')).not.toBeInTheDocument()
    expect(screen.queryByText('clip.mp4')).not.toBeInTheDocument()
  })

  it('search is case-insensitive', async () => {
    render(<App />)
    
    const searchInput = screen.getByPlaceholderText('Search media...')
    await userEvent.type(searchInput, 'SUNSET')
    
    expect(screen.getByText('sunset.jpg')).toBeInTheDocument()
    expect(screen.getByText('Sunset Beach.png')).toBeInTheDocument()
  })

  it('search trims whitespace', async () => {
    render(<App />)
    
    const searchInput = screen.getByPlaceholderText('Search media...')
    await userEvent.type(searchInput, '  sunset  ')
    
    expect(screen.getByText('sunset.jpg')).toBeInTheDocument()
  })

  it('clearing search restores all items', async () => {
    render(<App />)
    
    const searchInput = screen.getByPlaceholderText('Search media...')
    await userEvent.type(searchInput, 'zzzz')
    expect(screen.queryByText('vacation.mp4')).not.toBeInTheDocument()
    
    await userEvent.clear(searchInput)
    expect(screen.getByText('vacation.mp4')).toBeInTheDocument()
    expect(screen.getByText('song.mp3')).toBeInTheDocument()
    expect(screen.getByText('sunset.jpg')).toBeInTheDocument()
    expect(screen.getByText('clip.mp4')).toBeInTheDocument()
  })

  it('shows No matching media when search has no results', async () => {
    render(<App />)
    
    const searchInput = screen.getByPlaceholderText('Search media...')
    await userEvent.type(searchInput, 'zzzz')
    
    expect(screen.getByText('No matching media')).toBeInTheDocument()
  })

  it('does not show No matching media when there is no media at all', () => {
    // Reset without media
    useProjectStore.setState({
      project: null,
      runtimeMedia: new Map(),
      selectedMediaId: null,
      dirty: false,
    })
    
    render(<App />)
    
    // Should show empty state, not "No matching media"
    expect(screen.getByText('No media imported')).toBeInTheDocument()
    expect(screen.queryByText('No matching media')).not.toBeInTheDocument()
  })
})

describe('LeftSidebar - Remove Media', () => {
  beforeEach(() => {
    useProjectStore.setState({
      project: null,
      runtimeMedia: new Map(),
      selectedMediaId: null,
      dirty: false,
    })
    useUIStore.setState({
      notifications: [],
      importMediaTrigger: 0,
      activePanelTab: 'media',
      inspectorVisible: true,
    })
  })

  it('remove button removes only one unused item', async () => {
    const items = [
      createMockMedia({ id: 'test1', fileName: 'photo1.jpg' }),
      createMockMedia({ id: 'test2', fileName: 'photo2.jpg' }),
    ]
    setupMediaInStore(items)
    render(<App />)
    
    expect(screen.getAllByRole('option')).toHaveLength(2)
    
    const removeBtn = screen.getByLabelText('Remove photo1.jpg')
    await userEvent.click(removeBtn)
    
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByText('photo2.jpg')).toBeInTheDocument()
    expect(screen.queryByText('photo1.jpg')).not.toBeInTheDocument()
  })

  it('remove button does not trigger card selection', async () => {
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'photo.jpg' })])
    render(<App />)
    
    const removeBtn = screen.getByLabelText('Remove photo.jpg')
    await userEvent.click(removeBtn)
    
    // Clicking remove should not have selected the card
    expect(useProjectStore.getState().selectedMediaId).toBeNull()
  })

  it('removing selected media clears selection', async () => {
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'photo.jpg' })])
    render(<App />)
    
    // Select the card
    const card = screen.getByRole('option', { name: /photo\.jpg.*image/i })
    await userEvent.click(card)
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
    
    // Remove it
    const removeBtn = screen.getByLabelText('Remove photo.jpg')
    await userEvent.click(removeBtn)
    
    expect(useProjectStore.getState().selectedMediaId).toBeNull()
  })

  it('removing unrelated media preserves selection', async () => {
    setupMediaInStore([
      createMockMedia({ id: 'test1', fileName: 'keep.jpg' }),
      createMockMedia({ id: 'test2', fileName: 'remove.jpg' }),
    ])
    render(<App />)
    
    // Select the "keep" card
    const keepCard = screen.getByRole('option', { name: /keep\.jpg.*image/i })
    await userEvent.click(keepCard)
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
    
    // Remove the "remove" card
    const removeBtn = screen.getByLabelText('Remove remove.jpg')
    await userEvent.click(removeBtn)
    
    // Selection should still be test1
    expect(useProjectStore.getState().selectedMediaId).toBe('test1')
  })

  it('referenced media removal is prevented', async () => {
    // Set up a project with a track that references the media
    setupMediaInStore([createMockMedia({ id: 'test1', fileName: 'used.mp4', mediaType: 'video', durationUs: 10_000_000 })])
    
    // Add a clip that references this media in the timeline
    const store = useProjectStore.getState()
    const project = store.project!
    project.tracks[0].clips.push({
      id: 'clip1',
      mediaId: 'test1',
      trackId: 'video1',
      linkGroupId: null,
      timelineStartUs: 0,
      sourceStartUs: 0,
      sourceEndUs: 10_000_000,
      durationUs: 10_000_000,
      speed: 1,
      volume: 1,
      muted: false,
      fadeInUs: 0,
      fadeOutUs: 0,
      videoProperties: {
        rotate: 0,
        flipHorizontal: false,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        opacity: 100,
        speed: 1,
        fadeInUs: 0,
        fadeOutUs: 0,
      },
    })
    useProjectStore.setState({ project: { ...project } })
    
    render(<App />)
    
    // Try to remove the referenced media
    const removeBtn = screen.getByLabelText('Remove used.mp4')
    await userEvent.click(removeBtn)
    
    // Media should still be there
    expect(screen.getByText('used.mp4')).toBeInTheDocument()
  })
})

describe('projectStore - URL Cleanup', () => {
  beforeEach(() => {
    useProjectStore.setState({
      project: null,
      runtimeMedia: new Map(),
      selectedMediaId: null,
      dirty: false,
    })
    
    // Initialize project
    const store = useProjectStore.getState()
    if (!store.project) {
      store.createProject('Test')
    }
  })

  it('objectUrl is revoked once on remove', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
    
    const media = createMockMedia({
      id: 'test1',
      objectUrl: 'blob:mock/obj1',
      thumbnailUrl: 'blob:mock/thumb1',
    })
    useProjectStore.getState().addMedia(media)
    
    useProjectStore.getState().removeMedia('test1')
    
    expect(revokeSpy).toHaveBeenCalledTimes(2)
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock/obj1')
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock/thumb1')
    
    revokeSpy.mockRestore()
  })

  it('shared objectUrl/thumbnailUrl is revoked only once', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
    
    const media = createMockMedia({
      id: 'test1',
      objectUrl: 'blob:mock/shared',
      thumbnailUrl: 'blob:mock/shared',
    })
    useProjectStore.getState().addMedia(media)
    
    useProjectStore.getState().removeMedia('test1')
    
    expect(revokeSpy).toHaveBeenCalledTimes(1)
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock/shared')
    
    revokeSpy.mockRestore()
  })

  it('non-blob URLs are not revoked', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
    
    const media = createMockMedia({
      id: 'test1',
      objectUrl: 'data:image/png;base64,abc123',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    })
    useProjectStore.getState().addMedia(media)
    
    useProjectStore.getState().removeMedia('test1')
    
    // Non-blob URLs should not be revoked
    expect(revokeSpy).not.toHaveBeenCalled()
    
    revokeSpy.mockRestore()
  })

  it('separate thumbnailUrl is revoked once', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
    
    const media = createMockMedia({
      id: 'test1',
      objectUrl: 'blob:mock/obj1',
      thumbnailUrl: null,
    })
    useProjectStore.getState().addMedia(media)
    
    useProjectStore.getState().removeMedia('test1')
    
    expect(revokeSpy).toHaveBeenCalledTimes(1)
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock/obj1')
    
    revokeSpy.mockRestore()
  })

  it('does not revoke URLs belonging to other media items', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
    
    const media1 = createMockMedia({
      id: 'test1',
      fileName: 'keep.jpg',
      objectUrl: 'blob:mock/keep',
      thumbnailUrl: 'blob:mock/keep-thumb',
    })
    const media2 = createMockMedia({
      id: 'test2',
      fileName: 'remove.jpg',
      objectUrl: 'blob:mock/remove',
      thumbnailUrl: 'blob:mock/remove-thumb',
    })
    useProjectStore.getState().addMedia(media1)
    useProjectStore.getState().addMedia(media2)
    
    useProjectStore.getState().removeMedia('test2')
    
    // Should only revoke media2's URLs, not media1's
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock/remove')
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock/remove-thumb')
    expect(revokeSpy).not.toHaveBeenCalledWith('blob:mock/keep')
    
    revokeSpy.mockRestore()
  })
})
