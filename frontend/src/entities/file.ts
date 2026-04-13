import { EProcessingStatus } from '@/app/enums/file'
import { EColorVariants } from '@/app/enums/ui'

export type TProductLastFetch = 'fetch' | 'search' | 'init'

export interface IFile {
  id: string
  title: string
  originalName: string
  mimeType: string
  size: number
  processingStatus: EProcessingStatus
  scanStatus: string | null
  scanDetails: string | null
  metadataJson: Record<string, unknown> | null
  requiresAttention: boolean
  createdAt: string
  updatedAt: string
}

export interface IFileCriteria {
  offset: number
  limit: number
}

export interface IFileMap {
  id: string
  title: string
  originalName: string
  mimeType: string
  size: string
  processing: {
    variant: EColorVariants
    label: EProcessingStatus
  }
  scanStatus: string | null
  scanDetails: string | null
  metadataJson: Record<string, unknown> | null
  requiresAttention: boolean
  createdAt: string
  updatedAt: string
}

export interface IFileRec {
  title: string
  category: string
  rating?: number
  brand?: string
  price: number
  sku: string
  description?: string
}

export interface IFileState {
  criteria: IFileCriteria
}

/**
 * CONSTANTS
 **/

export const FILE_REC: IFileRec = {
  title: '',
  category: '',
  price: 0,
  sku: '',
}

export const FILE_STATE: IFileState = {
  criteria: { offset: 0, limit: 10 },
}

export const FILE_HEADERS: IHeader[] = [
  { key: 'title', title: 'Название', classes: '' },
  { key: 'originalName', title: 'Файл', classes: '' },
  { key: 'mimeType', title: 'MIME', classes: '' },
  { key: 'size', title: 'Размер', classes: '' },
  { key: 'processingStatus', title: 'Статус', classes: '' },
  { key: 'scanStatus', title: 'Проверка', classes: '' },
  { key: 'createdAt', title: 'Создан', classes: '' },
  { key: 'actions', title: '', classes: '' },
]
