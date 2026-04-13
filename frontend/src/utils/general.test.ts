import { describe, it, expect } from 'vitest'
import { formatSize, formatDate } from './general'

describe('formatSize', () => {
  it('formats bytes', () => {
    expect(formatSize(512)).toBe('512 B')
  })

  it('formats kilobytes', () => {
    expect(formatSize(1024)).toBe('1.0 KB')
    expect(formatSize(2048)).toBe('2.0 KB')
    expect(formatSize(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB')
    expect(formatSize(1024 * 1024 * 2.5)).toBe('2.5 MB')
  })

  it('boundary: exactly 1024 is KB not B', () => {
    expect(formatSize(1023)).toBe('1023 B')
    expect(formatSize(1024)).toBe('1.0 KB')
  })
})

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2024-01-15T10:30:00.000Z')
    expect(result).toBeTypeOf('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats the correct year', () => {
    const result = formatDate('2024-06-01T00:00:00.000Z')
    expect(result).toContain('2024')
  })
})
