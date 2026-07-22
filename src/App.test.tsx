import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders NovaCut Web Lite title', () => {
    render(<App />)
    expect(screen.getByText('NovaCut Web Lite')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<App />)
    expect(screen.getByText('Lightweight recap video editor')).toBeInTheDocument()
  })

  it('renders project foundation ready status', () => {
    render(<App />)
    expect(screen.getByText('Project foundation ready')).toBeInTheDocument()
  })

  it('renders disabled Create Project button', () => {
    render(<App />)
    const createProjectButton = screen.getByRole('button', { name: 'Create Project' })
    expect(createProjectButton).toBeInTheDocument()
    expect(createProjectButton).toBeDisabled()
  })

  it('renders disabled Import Media button', () => {
    render(<App />)
    const importMediaButton = screen.getByRole('button', { name: 'Import Media' })
    expect(importMediaButton).toBeInTheDocument()
    expect(importMediaButton).toBeDisabled()
  })
})
