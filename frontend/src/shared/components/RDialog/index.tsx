'use client'

import { Button, Modal, Form } from 'react-bootstrap'

interface IProps {
  show: boolean
  title: string
  isSubmitting?: boolean
  children: React.ReactNode
  onHide: () => void
  onChanged: () => void
}

export const RDialog = ({
  show,
  title,
  isSubmitting = false,
  children,
  onHide,
  onChanged,
}: IProps) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          onChanged()
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{children}</Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Отмена
          </Button>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Загрузка...' : 'Сохранить'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
