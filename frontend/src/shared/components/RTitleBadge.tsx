'use client'

import { Badge } from 'react-bootstrap'

interface IPropsComponent {
  title: string
  count: number
}

export const RTitleBadge = ({ title, count }: IPropsComponent) => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <h2 className="h5 mb-0">{title}</h2>

      {count > 0 && <Badge bg="secondary">{count}</Badge>}
    </div>
  )
}
