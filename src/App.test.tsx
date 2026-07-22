import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders NovaCut Web Lite title', () => {
    render(<App />)
    expect(screen.getByText('NovaCut')).toBeInTheDocument()
  })

  it('renders the version info', () => {
    render(<App />)
    expect(screen.getByText('Version 0.1')).toBeInTheDocument()
  })

  it('renders Media tab', () => {
    render(<App />)
    expect(screen.getByText('Media')).toBeInTheDocument()
  })

  it('renders Filters tab', () => {
    render(<App />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  it('renders Transitions tab', () => {
    render(<App />)
    expect(screen.getByText('Transitions')).toBeInTheDocument()
  })

  it('renders no media imported message', () => {
    render(<App />)
    expect(screen.getByText('No media imported')).toBeInTheDocument()
  })

  it('renders Preview placeholder', () => {
    render(<App />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('renders Inspector header', () => {
    render(<App />)
    expect(screen.getByText('Inspector')).toBeInTheDocument()
  })

  it('renders no clip selected message', () => {
    render(<App />)
    expect(screen.getByText('No clip selected.')).toBeInTheDocument()
  })

  it('renders Timeline header', () => {
    render(<App />)
    expect(screen.getByText('Timeline')).toBeInTheDocument()
  })

  it('renders Video 2 track', () => {
    render(<App />)
    expect(screen.getByText('Video 2')).toBeInTheDocument()
  })

  it('renders Video 1 track', () => {
    render(<App />)
    expect(screen.getByText('Video 1')).toBeInTheDocument()
  })

  it('renders Audio 1 track', () => {
    render(<App />)
    expect(screen.getByText('Audio 1')).toBeInTheDocument()
  })

  it('renders Audio 2 track', () => {
    render(<App />)
    expect(screen.getByText('Audio 2')).toBeInTheDocument()
  })

  it('renders disabled toolbar buttons', () => {
    render(<App />)
    const newButton = screen.getByRole('button', { name: 'New' })
    expect(newButton).toBeInTheDocument()
    expect(newButton).toBeDisabled()
  })
})
