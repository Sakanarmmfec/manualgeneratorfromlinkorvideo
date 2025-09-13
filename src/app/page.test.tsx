import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from './page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByText('Welcome to Thai Document Generator')
    expect(heading).toBeInTheDocument()
  })

  it('renders the MFEC branding', () => {
    render(<Home />)
    
    const branding = screen.getByText('Thai Document Generator - MFEC')
    expect(branding).toBeInTheDocument()
  })

  it('renders the generate documents section', () => {
    render(<Home />)
    
    const generateSection = screen.getByText('Generate Documents')
    expect(generateSection).toBeInTheDocument()
  })
})