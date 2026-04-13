import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RTable } from './index'

const HEADERS: IHeader[] = [
  { key: 'id', title: 'ID', classes: '' },
  { key: 'name', title: 'Имя', classes: '' },
]

type TRow = { id: number; name: string }

const ITEMS: TRow[] = [
  { id: 1, name: 'Файл А' },
  { id: 2, name: 'Файл Б' },
]

const renderItem = (item: TRow) => (
  <>
    <td>{item.id}</td>
    <td>{item.name}</td>
  </>
)

describe('RTable', () => {
  it('renders column headers', () => {
    render(<RTable items={ITEMS} headers={HEADERS} isLoading={false} renderItem={renderItem} />)
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Имя')).toBeInTheDocument()
  })

  it('renders all rows', () => {
    render(<RTable items={ITEMS} headers={HEADERS} isLoading={false} renderItem={renderItem} />)
    expect(screen.getByText('Файл А')).toBeInTheDocument()
    expect(screen.getByText('Файл Б')).toBeInTheDocument()
  })

  it('shows empty message when no items', () => {
    render(
      <RTable
        items={[]}
        headers={HEADERS}
        isLoading={false}
        emptyMessage="Данных нет"
        renderItem={renderItem}
      />
    )
    expect(screen.getByText('Данных нет')).toBeInTheDocument()
  })

  it('shows default empty message', () => {
    render(<RTable items={[]} headers={HEADERS} isLoading={false} renderItem={renderItem} />)
    expect(screen.getByText('Нет данных')).toBeInTheDocument()
  })

  it('shows spinner while loading', () => {
    const { container } = render(
      <RTable items={[]} headers={HEADERS} isLoading={true} renderItem={renderItem} />
    )
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('does not render table while loading', () => {
    render(<RTable items={ITEMS} headers={HEADERS} isLoading={true} renderItem={renderItem} />)
    expect(screen.queryByText('Файл А')).not.toBeInTheDocument()
  })

  describe('pagination', () => {
    const pagination: IPagination = {
      count: 25,
      offset: 0,
      limit: 10,
      onChange: vi.fn(),
    }

    // Bootstrap Pagination renders label text inside <span class="visually-hidden">;
    // the click handler lives on the inner a/span.page-link, not the li
    const getPaginationItem = (label: string) =>
      screen.getByText(label, { selector: '.visually-hidden' }).closest('li')!
    const clickPaginationItem = (label: string) =>
      fireEvent.click(getPaginationItem(label).querySelector('.page-link')!)

    it('renders pagination when totalPages > 1', () => {
      render(
        <RTable
          items={ITEMS}
          headers={HEADERS}
          isLoading={false}
          renderItem={renderItem}
          pagination={pagination}
        />
      )
      expect(getPaginationItem('First')).toBeInTheDocument()
      expect(getPaginationItem('Last')).toBeInTheDocument()
    })

    it('does not render pagination when totalPages <= 1', () => {
      render(
        <RTable
          items={ITEMS}
          headers={HEADERS}
          isLoading={false}
          renderItem={renderItem}
          pagination={{ count: 5, offset: 0, limit: 10, onChange: vi.fn() }}
        />
      )
      expect(screen.queryByText('First', { selector: '.visually-hidden' })).not.toBeInTheDocument()
    })

    it('calls onChange with correct page on Next click', () => {
      const onChange = vi.fn()
      render(
        <RTable
          items={ITEMS}
          headers={HEADERS}
          isLoading={false}
          renderItem={renderItem}
          pagination={{ ...pagination, onChange }}
        />
      )
      clickPaginationItem('Next')
      expect(onChange).toHaveBeenCalledWith(2)
    })

    it('calls onChange(1) on First click when on page 2', () => {
      const onChange = vi.fn()
      render(
        <RTable
          items={ITEMS}
          headers={HEADERS}
          isLoading={false}
          renderItem={renderItem}
          pagination={{ count: 25, offset: 10, limit: 10, onChange }}
        />
      )
      clickPaginationItem('First')
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('First and Prev are disabled on page 1', () => {
      render(
        <RTable
          items={ITEMS}
          headers={HEADERS}
          isLoading={false}
          renderItem={renderItem}
          pagination={pagination}
        />
      )
      expect(getPaginationItem('First')).toHaveClass('disabled')
      expect(getPaginationItem('Previous')).toHaveClass('disabled')
    })

    it('Next and Last are disabled on last page', () => {
      render(
        <RTable
          items={ITEMS}
          headers={HEADERS}
          isLoading={false}
          renderItem={renderItem}
          pagination={{ count: 25, offset: 20, limit: 10, onChange: vi.fn() }}
        />
      )
      expect(getPaginationItem('Next')).toHaveClass('disabled')
      expect(getPaginationItem('Last')).toHaveClass('disabled')
    })
  })
})
