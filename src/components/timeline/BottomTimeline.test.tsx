import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BottomTimeline from '../../components/layout/BottomTimeline'

describe('BottomTimeline', () => {
  it('renders four track names in correct order', () => {
    render(<BottomTimeline />)
    
    const video2 = screen.getByText('Video 2')
    const video1 = screen.getByText('Video 1')
    const audio1 = screen.getByText('Audio 1')
    const audio2 = screen.getByText('Audio 2')
    
    expect(video2).toBeInTheDocument()
    expect(video1).toBeInTheDocument()
    expect(audio1).toBeInTheDocument()
    expect(audio2).toBeInTheDocument()
  })

  it('renders Timeline title', () => {
    render(<BottomTimeline />)
    expect(screen.getByText('Timeline')).toBeInTheDocument()
  })

  it('has default zoom of 100%', () => {
    render(<BottomTimeline />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('zooms in when clicking zoom-in button', () => {
    render(<BottomTimeline />)
    
    const zoomInButton = screen.getByLabelText('Zoom in')
    fireEvent.click(zoomInButton)
    
    expect(screen.getByText('110%')).toBeInTheDocument()
  })

  it('zooms out when clicking zoom-out button', () => {
    render(<BottomTimeline />)
    
    const zoomOutButton = screen.getByLabelText('Zoom out')
    fireEvent.click(zoomOutButton)
    
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('changes zoom when using slider', () => {
    render(<BottomTimeline />)
    
    const slider = screen.getByLabelText('Zoom level') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '150' } })
    
    expect(screen.getByText('150%')).toBeInTheDocument()
  })

  it('disables zoom-out at minimum zoom', () => {
    render(<BottomTimeline />)
    
    const zoomOutButton = screen.getByLabelText('Zoom out')
    // First click multiple times to reach minimum
    for (let i = 0; i < 6; i++) {
      fireEvent.click(zoomOutButton)
    }
    
    expect(zoomOutButton).toBeDisabled()
  })

  it('disables zoom-in at maximum zoom', () => {
    render(<BottomTimeline />)
    
    const zoomInButton = screen.getByLabelText('Zoom in')
    // Click multiple times to reach maximum
    for (let i = 0; i < 10; i++) {
      fireEvent.click(zoomInButton)
    }
    
    expect(zoomInButton).toBeDisabled()
  })

  it('renders major ruler labels', () => {
    render(<BottomTimeline />)
    
    // Check for some major labels
    expect(screen.getByText('0s')).toBeInTheDocument()
    expect(screen.getByText('5s')).toBeInTheDocument()
    expect(screen.getByText('10s')).toBeInTheDocument()
    expect(screen.getByText('60s')).toBeInTheDocument()
  })
})
