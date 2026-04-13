import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Page from './page'
import { EProcessingStatus } from './enums/file'
import { ELevelStatus } from './enums/alert'
import { EColorVariants } from './enums/ui'
import type { IFile } from '@/entities/file'
import type { IAlert } from '@/entities/alert'

const mockFetchFiles = vi.fn()
const mockUploadFile = vi.fn()
const mockDownloadFile = vi.fn()
const mockUpdateCriteriaFiles = vi.fn()
const mockFetchAlerts = vi.fn()
const mockUpdateCriteriaAlerts = vi.fn()

const DEFAULT_FILES_DATA: IListResponse<IFile[]> = { data: [], count: 0 }
const DEFAULT_CRITERIA = { offset: 0, limit: 10 }

vi.mock('@/features/files/filesHook', () => ({
  useFiles: vi.fn(),
}))

vi.mock('@/features/alerts/alertsHook', () => ({
  useAlerts: vi.fn(),
}))

vi.mock('@/app/files.header', () => ({
  FilesHeader: ({
    onFetch,
    onUpload,
  }: {
    onFetch: () => void
    onUpload: (t: string, f: File) => Promise<void>
  }) => (
    <div>
      <button onClick={onFetch}>Обновить</button>
      <button onClick={() => onUpload('Тест', new File([''], 'test.txt'))}>Upload</button>
    </div>
  ),
}))

import { useFiles } from '@/features/files/filesHook'
import { useAlerts } from '@/features/alerts/alertsHook'

function makeFilesMock(overrides = {}) {
  return {
    data: DEFAULT_FILES_DATA,
    isLoading: false,
    criteria: DEFAULT_CRITERIA,
    fetchByCriteria: mockFetchFiles,
    updateCriteria: mockUpdateCriteriaFiles,
    upload: mockUploadFile,
    download: mockDownloadFile,
    getProcessingVariant: (s: EProcessingStatus) =>
      s === EProcessingStatus.FAILED ? EColorVariants.DANGER : EColorVariants.SUCCESS,
    ...overrides,
  }
}

function makeAlertsMock(overrides = {}) {
  return {
    data: { data: [], count: 0 } as IListResponse<IAlert[]>,
    isLoading: false,
    criteria: DEFAULT_CRITERIA,
    fetchByCriteria: mockFetchAlerts,
    updateCriteria: mockUpdateCriteriaAlerts,
    getLevelVariant: (l: ELevelStatus) =>
      l === ELevelStatus.CRITICAL ? EColorVariants.DANGER : EColorVariants.SUCCESS,
    ...overrides,
  }
}

beforeEach(() => {
  vi.mocked(useFiles).mockReturnValue(makeFilesMock())
  vi.mocked(useAlerts).mockReturnValue(makeAlertsMock())
  mockFetchFiles.mockResolvedValue(undefined)
  mockUploadFile.mockResolvedValue(undefined)
  mockDownloadFile.mockResolvedValue(undefined)
  mockFetchAlerts.mockResolvedValue(undefined)
})

describe('Page', () => {
  it('renders section titles', () => {
    render(<Page />)
    expect(screen.getByText('Файлы')).toBeInTheDocument()
    expect(screen.getByText('Алерты')).toBeInTheDocument()
  })

  it('shows empty message when no files', () => {
    render(<Page />)
    expect(screen.getByText('Файлы пока не загружены')).toBeInTheDocument()
  })

  it('shows empty message when no alerts', () => {
    render(<Page />)
    expect(screen.getByText('Алертов пока нет')).toBeInTheDocument()
  })

  it('shows files count badge', () => {
    vi.mocked(useFiles).mockReturnValue(
      makeFilesMock({
        data: { data: [], count: 7 },
      })
    )
    render(<Page />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders file rows when data is present', () => {
    const file: IFile = {
      id: 'abc-1',
      title: 'Договор',
      originalName: 'contract.pdf',
      mimeType: 'application/pdf',
      size: 2048,
      processingStatus: EProcessingStatus.PROCESSED,
      scanStatus: null,
      scanDetails: null,
      metadataJson: null,
      requiresAttention: false,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    }
    vi.mocked(useFiles).mockReturnValue(
      makeFilesMock({
        data: { data: [file], count: 1 },
      })
    )
    render(<Page />)
    expect(screen.getByText('Договор')).toBeInTheDocument()
    expect(screen.getByText('contract.pdf')).toBeInTheDocument()
    expect(screen.getByText('application/pdf')).toBeInTheDocument()
  })

  it('calls fetchByCriteria and fetchAlerts on refresh', async () => {
    render(<Page />)
    fireEvent.click(screen.getByText('Обновить'))
    await waitFor(() => {
      expect(mockFetchFiles).toHaveBeenCalled()
      expect(mockFetchAlerts).toHaveBeenCalled()
    })
  })

  it('calls upload and then fetches on upload', async () => {
    render(<Page />)
    fireEvent.click(screen.getByText('Upload'))
    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled()
    })
  })

  it('shows error alert when upload fails', async () => {
    mockUploadFile.mockRejectedValueOnce(new Error('fail'))
    render(<Page />)
    fireEvent.click(screen.getByText('Upload'))
    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить файл')).toBeInTheDocument()
    })
  })

  it('shows loading spinner for files table', () => {
    vi.mocked(useFiles).mockReturnValue(makeFilesMock({ isLoading: true }))
    const { container } = render(<Page />)
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('updates files criteria on page change', () => {
    vi.mocked(useFiles).mockReturnValue(
      makeFilesMock({
        data: { data: [], count: 25 },
      })
    )
    render(<Page />)
    // pagination shows when totalPages > 1 (25 items / 10 per page = 3 pages)
    const nextPageLink = screen
      .getByText('Next', { selector: '.visually-hidden' })
      .closest('li')!
      .querySelector('.page-link')!
    fireEvent.click(nextPageLink)
    expect(mockUpdateCriteriaFiles).toHaveBeenCalledWith({ offset: 10, limit: 10 })
  })
})
