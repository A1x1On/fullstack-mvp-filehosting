import { EColorVariants } from '@/app/enums/ui'
import { ELevelStatus } from '@/app/enums/alert'

export interface IAlert {
  id: number
  fileId: string
  level: ELevelStatus
  message: string
  createdAt: string
}

export interface IAlertCriteria {
  offset: number
  limit: number
}

export interface IAlertMap {
  id: number
  fileId: string
  level: {
    variant: EColorVariants
    label: ELevelStatus
  }
  message: string
  createdAt: string
}

export interface IAlertState {
  criteria: IAlertCriteria
}

// CONSTANTS

export const ALERT_STATE: IAlertState = {
  criteria: { offset: 0, limit: 2 },
}

export const ALERT_HEADERS: IHeader[] = [
  { key: 'id', title: 'ID', classes: '' },
  { key: 'fileId', title: 'File ID', classes: '' },
  { key: 'level', title: 'Уровень', classes: '' },
  { key: 'message', title: 'Сообщение', classes: '' },
  { key: 'createdAt', title: 'Создан', classes: '' },
]
