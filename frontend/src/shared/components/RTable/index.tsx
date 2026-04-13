'use client'

import clsx from 'clsx'
import { Pagination } from 'react-bootstrap'
import styles from './index.module.scss'

interface IPropsComponent<T> {
  items: T[]
  headers: IHeader[]
  isLoading: boolean
  emptyMessage?: string
  renderItem: (item: T) => React.ReactNode
  pagination?: IPagination
}

export const RTable = <T,>({
  items,
  headers,
  isLoading,
  emptyMessage = 'Нет данных',
  renderItem,
  pagination,
}: IPropsComponent<T>) => {
  const currentPage = Math.floor((pagination?.offset ?? 0) / (pagination?.limit ?? 0)) + 1
  const totalPages = Math.ceil((pagination?.count ?? 0) / (pagination?.limit ?? 0))

  const buildPageWindow = (current: number, total: number, window = 2): number[] => {
    const start = Math.max(1, current - window)
    const end = Math.min(total, current + window)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const pageWindow = buildPageWindow(currentPage, totalPages)

  return (
    <div>
      {isLoading ? (
        <div className={clsx(styles.loading)}>
          <span className="loading loading-spinner" />
        </div>
      ) : (
        <>
          <div className={clsx(styles.wrapper)}>
            <table className={clsx(styles.table)}>
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header.key} className={clsx(header.classes)}>
                      {header.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className={clsx(styles.empty)}>
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => <tr key={index}>{renderItem(item)}</tr>)
                )}
              </tbody>
            </table>
          </div>

          {pagination && totalPages > 1 && (
            <div className="d-flex justify-content-end mt-3">
              <Pagination size="sm" className="mb-0">
                <Pagination.First
                  disabled={currentPage === 1}
                  onClick={() => pagination.onChange(1)}
                />
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => pagination.onChange(currentPage - 1)}
                />

                {pageWindow[0] > 1 && <Pagination.Ellipsis disabled />}

                {pageWindow.map((p) => (
                  <Pagination.Item
                    key={p}
                    active={p === currentPage}
                    onClick={() => pagination.onChange(p)}
                  >
                    {p}
                  </Pagination.Item>
                ))}

                {pageWindow[pageWindow.length - 1] < totalPages && <Pagination.Ellipsis disabled />}

                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => pagination.onChange(currentPage + 1)}
                />
                <Pagination.Last
                  disabled={currentPage === totalPages}
                  onClick={() => pagination.onChange(totalPages)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
