import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RTitleBadge } from './RTitleBadge'

describe('RTitleBadge', () => {
  it('renders the title', () => {
    render(<RTitleBadge title="Файлы" count={0} />)
    expect(screen.getByText('Файлы')).toBeInTheDocument()
  })

  it('shows the count badge when count > 0', () => {
    render(<RTitleBadge title="Файлы" count={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show badge when count is 0', () => {
    render(<RTitleBadge title="Файлы" count={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
