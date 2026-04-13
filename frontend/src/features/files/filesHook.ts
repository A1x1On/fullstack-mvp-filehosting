'use client'

import { useCallback, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  useLazyFetchQuery,
  useFetchByCriteriaMutation,
  useUploadMutation,
  useDownloadMutation,
} from '@/api/filesApi'
import { setCriteria } from './filesSlice'

import { EColorVariants } from '@/app/enums/ui'
import { EProcessingStatus } from '@/app/enums/file'

import type { IFile, IFileCriteria } from '@/entities/file'
import type { RootState, AppDispatch } from '@/features/store'
import { LIST_RESPONSE } from '@/constants'

export const useFiles = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.files)

  const [filesFetchAll, { data: dataAll, isFetching: isFetchingAll }] = useLazyFetchQuery()
  const [filesFetchByCriteria, { data: dataByCriteria, isLoading: isLoadingByCriteria }] =
    useFetchByCriteriaMutation()

  const [fileUpload, { isLoading: isUploading }] = useUploadMutation()
  const [fileDownload] = useDownloadMutation()

  // todo: implement fetch all alerts on UI if you need
  const fetchAll = useCallback(async () => {
    try {
      await filesFetchAll().unwrap()
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }, [dispatch, filesFetchAll])

  const fetchByCriteria = useCallback(async () => {
    try {
      await filesFetchByCriteria(state.criteria).unwrap()
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }, [filesFetchByCriteria, state.criteria])

  const updateCriteria = useCallback(
    (newCriteria: IFileCriteria) => {
      dispatch(setCriteria(newCriteria))
    },
    [dispatch]
  )

  const upload = useCallback(
    async (formData: FormData) => {
      try {
        await fileUpload(formData).unwrap()
      } catch (error) {
        console.error('Upload error:', error)
        throw error
      }
    },
    [fileUpload]
  )

  const download = useCallback(
    async (id: string) => {
      try {
        await fileDownload(id).unwrap()
      } catch (error) {
        console.error('Download error:', error)
        throw error
      }
    },
    [fileDownload]
  )

  const getProcessingVariant = (status: EProcessingStatus) => {
    switch (status) {
      case EProcessingStatus.FAILED:
        return EColorVariants.DANGER
      case EProcessingStatus.PROCESSING:
        return EColorVariants.WARNING
      case EProcessingStatus.PROCESSED:
        return EColorVariants.SUCCESS
      default:
        return EColorVariants.SECONDARY
    }
  }

  const isLoading = useMemo(() => {
    return isFetchingAll || isUploading || isLoadingByCriteria
  }, [isFetchingAll, isUploading, isLoadingByCriteria])

  const data = useMemo((): IListResponse<IFile[]> => {
    return dataByCriteria ?? dataAll ?? (LIST_RESPONSE as IListResponse<IFile[]>)
  }, [dataByCriteria, dataAll])

  useEffect(() => {
    fetchByCriteria()
  }, [state.criteria])

  return {
    isLoading,
    data,
    criteria: state.criteria,

    fetchByCriteria,
    updateCriteria,
    upload,
    download,

    getProcessingVariant,
  }
}
