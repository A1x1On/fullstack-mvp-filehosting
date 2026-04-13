'use client'

import { useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { RDialog } from '@/shared/components/RDialog'

interface IProps {
  onFetch: () => void
  onUpload: (title: string, file: File) => Promise<void>
}

export const FilesHeader = ({ onFetch, onUpload }: IProps) => {
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !selectedFile) return

    setIsSubmitting(true)
    try {
      await onUpload(title.trim(), selectedFile)
      setShowModal(false)
      setTitle('')
      setSelectedFile(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h1 className="h3 mb-2">Управление файлами</h1>

              <p className="text-secondary mb-0">
                Загрузка файлов, просмотр статусов обработки и ленты алертов.
              </p>
            </div>

            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={onFetch}>
                Обновить
              </Button>

              <Button variant="primary" onClick={() => setShowModal(true)}>
                Добавить файл
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <RDialog
        show={showModal}
        title="Добавить файл"
        isSubmitting={isSubmitting}
        onHide={() => setShowModal(false)}
        onChanged={() => void handleSubmit()}
      >
        <Form.Group className="mb-3">
          <Form.Label>Название</Form.Label>

          <Form.Control
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например, Договор с подрядчиком"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Файл</Form.Label>

          <Form.Control
            type="file"
            onChange={(event) =>
              setSelectedFile((event.target as HTMLInputElement).files?.[0] ?? null)
            }
          />
        </Form.Group>
      </RDialog>
    </>
  )
}
