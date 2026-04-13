import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilesHeader } from './files.header'

vi.mock('@/shared/components/RDialog', () => ({
  RDialog: ({ show, children, onChanged, onHide, title }: {
    show: boolean
    children: React.ReactNode
    onChanged: () => void
    onHide: () => void
    title: string
  }) =>
    show ? (
      <div role="dialog">
        <span>{title}</span>
        {children}
        <button onClick={onChanged}>Сохранить</button>
        <button onClick={onHide}>Закрыть</button>
      </div>
    ) : null,
}))

describe('FilesHeader', () => {
  it('renders the page heading', () => {
    render(<FilesHeader onFetch={vi.fn()} onUpload={vi.fn()} />)
    expect(screen.getByText('Управление файлами')).toBeInTheDocument()
  })

  it('renders Обновить and Добавить файл buttons', () => {
    render(<FilesHeader onFetch={vi.fn()} onUpload={vi.fn()} />)
    expect(screen.getByText('Обновить')).toBeInTheDocument()
    expect(screen.getByText('Добавить файл')).toBeInTheDocument()
  })

  it('calls onFetch when Обновить is clicked', async () => {
    const onFetch = vi.fn()
    render(<FilesHeader onFetch={onFetch} onUpload={vi.fn()} />)
    await userEvent.click(screen.getByText('Обновить'))
    expect(onFetch).toHaveBeenCalledTimes(1)
  })

  it('opens the dialog when Добавить файл is clicked', async () => {
    render(<FilesHeader onFetch={vi.fn()} onUpload={vi.fn()} />)
    await userEvent.click(screen.getByText('Добавить файл'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Добавить файл', { selector: 'span' })).toBeInTheDocument()
  })

  it('closes the dialog on Закрыть click', async () => {
    render(<FilesHeader onFetch={vi.fn()} onUpload={vi.fn()} />)
    await userEvent.click(screen.getByText('Добавить файл'))
    await userEvent.click(screen.getByText('Закрыть'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not call onUpload when title or file is missing', async () => {
    const onUpload = vi.fn()
    render(<FilesHeader onFetch={vi.fn()} onUpload={onUpload} />)
    await userEvent.click(screen.getByText('Добавить файл'))
    await userEvent.click(screen.getByText('Сохранить'))
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('calls onUpload with title and file when both provided', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<FilesHeader onFetch={vi.fn()} onUpload={onUpload} />)

    await userEvent.click(screen.getByText('Добавить файл'))

    await userEvent.type(screen.getByPlaceholderText('Например, Договор с подрядчиком'), 'Тест')

    const file = new File(['hello'], 'test.txt', { type: 'text/plain' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)

    await userEvent.click(screen.getByText('Сохранить'))

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith('Тест', file)
    })
  })

  it('resets form and closes dialog after successful upload', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<FilesHeader onFetch={vi.fn()} onUpload={onUpload} />)

    await userEvent.click(screen.getByText('Добавить файл'))
    await userEvent.type(screen.getByPlaceholderText('Например, Договор с подрядчиком'), 'Doc')

    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    await userEvent.upload(container.querySelector('input[type="file"]') as HTMLInputElement, file)
    await userEvent.click(screen.getByText('Сохранить'))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
