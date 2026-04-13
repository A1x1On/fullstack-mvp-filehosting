'use client'

import { useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap'
import { FilesHeader } from '@/app/files.header'
import { RTitleBadge } from '@/shared/components/RTitleBadge'
import { RTable } from '@/shared/components/RTable'

import { formatDate, formatSize } from '@/utils/general'

import { useFiles } from '@/features/files/filesHook'
import { useAlerts } from '@/features/alerts/alertsHook'

import { FILE_HEADERS, IFileMap, IFile } from '@/entities/file'
import { ALERT_HEADERS, IAlert, IAlertMap } from '@/entities/alert'

export default function Page() {
  const {
    data: files,
    isLoading: isLoadingFiles,
    criteria: criteriaFiles,

    fetchByCriteria: fetchFiles,
    updateCriteria: updateCriteriaFiles,
    upload: uploadFile,
    download: downloadFile,

    getProcessingVariant,
  } = useFiles()

  const {
    data: alerts,
    isLoading: isFetchingAlerts,
    criteria: criteriaAlerts,

    fetchByCriteria: fetchAlerts,
    updateCriteria: updateCriteriaAlerts,

    getLevelVariant,
  } = useAlerts()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onChangedFilesPage = (page: number) => {
    updateCriteriaFiles({ ...criteriaFiles, offset: (page - 1) * criteriaFiles.limit })
  }

  const onChangedAlertsPage = (page: number) => {
    updateCriteriaAlerts({ ...criteriaAlerts, offset: (page - 1) * criteriaAlerts.limit })
  }

  async function onUpload(title: string, file: File) {
    setErrorMessage(null)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('file', file)

    await uploadFile(formData)
      .then(() => console.log('Upload success'))
      .catch((error: Error) => {
        console.error('Upload error:', error)
        setErrorMessage('Не удалось загрузить файл')
      })

    await fetchFiles()
    await fetchAlerts()
  }

  async function onDownload(id: string) {
    await downloadFile(id)
      .then(() => {
        console.log('Download success')
      })
      .catch((error: Error) => {
        console.error('Download error:', error)
        setErrorMessage('Не удалось скачать файл')
      })
  }

  const onFetch = () => {
    void fetchFiles()
    void fetchAlerts()
  }

  const mappedFiles = useMemo((): IFileMap[] => {
    if (!files?.data?.length) return []

    return files.data.map((file: IFile) => {
      return {
        ...file,
        processing: {
          variant: getProcessingVariant(file.processingStatus),
          label: file.processingStatus,
        },
        size: formatSize(file.size),
        createdAt: formatDate(file.createdAt),
      } as IFileMap
    })
  }, [files])

  const mappedAlerts = useMemo((): IAlertMap[] => {
    if (!alerts?.data?.length) return []

    return alerts.data.map((alert: IAlert) => {
      return {
        ...alert,
        level: {
          variant: getLevelVariant(alert.level),
          label: alert.level,
        },
        createdAt: formatDate(alert.createdAt),
      } as IAlertMap
    })
  }, [alerts])

  return (
    <Container fluid className="py-4 px-4 bg-light min-vh-100">
      <Row className="justify-content-center">
        <Col xxl={10} xl={11}>
          <FilesHeader onFetch={() => onFetch()} onUpload={onUpload} />

          {errorMessage ? (
            <Alert variant="danger" className="shadow-sm">
              {errorMessage}
            </Alert>
          ) : null}

          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <RTitleBadge title="Файлы" count={files.count} />
            </Card.Header>

            <Card.Body className="px-4 pb-4">
              <RTable
                items={mappedFiles}
                headers={FILE_HEADERS}
                isLoading={isLoadingFiles}
                emptyMessage="Файлы пока не загружены"
                pagination={{
                  count: files.count,
                  ...criteriaFiles,
                  onChange: onChangedFilesPage,
                }}
                renderItem={(file) => (
                  <>
                    <td>
                      <div className="fw-semibold">{file.title}</div>

                      <div className="small text-secondary">{file.id}</div>
                    </td>

                    <td>{file.originalName}</td>

                    <td>{file.mimeType}</td>

                    <td>{file.size}</td>

                    <td>
                      <Badge bg={file.processing.variant}>{file.processing.label}</Badge>
                    </td>

                    <td>
                      <div className="d-flex flex-column gap-1">
                        <Badge bg={file.requiresAttention ? 'warning' : 'success'}>
                          {file.scanStatus ?? 'pending'}
                        </Badge>

                        <span className="small text-secondary">
                          {file.scanDetails ?? 'Ожидает обработки'}
                        </span>
                      </div>
                    </td>

                    <td>{file.createdAt}</td>

                    <td className="text-nowrap">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onDownload(file.id)}
                      >
                        Скачать
                      </Button>
                    </td>
                  </>
                )}
              />
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <RTitleBadge title="Алерты" count={mappedAlerts.length} />
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <RTable
                items={mappedAlerts}
                headers={ALERT_HEADERS}
                isLoading={isFetchingAlerts}
                emptyMessage="Алертов пока нет"
                pagination={{
                  count: alerts.count,
                  ...criteriaAlerts,
                  onChange: onChangedAlertsPage,
                }}
                renderItem={(alert) => (
                  <>
                    <td>{alert.id}</td>

                    <td className="small">{alert.fileId}</td>

                    <td>
                      <Badge bg={alert.level.variant}>{alert.level.label}</Badge>
                    </td>

                    <td>{alert.message}</td>

                    <td>{alert.createdAt}</td>
                  </>
                )}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
