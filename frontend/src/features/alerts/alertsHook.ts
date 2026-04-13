'use client'

import { useCallback, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useLazyFetchQuery, useFetchByCriteriaMutation } from '@/api/alertsApi'
import { setCriteria } from './alertsSlice'

import { EColorVariants } from '@/app/enums/ui'
import { ELevelStatus } from '@/app/enums/alert'

import type { IAlert, IAlertCriteria } from '@/entities/alert'
import type { RootState, AppDispatch } from '@/features/store'
import { LIST_RESPONSE } from '@/constants'

export const useAlerts = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.alerts)

  const [alertsFetchAll, { data: dataAll, isFetching: isFetchingAll }] = useLazyFetchQuery()
  const [alertsFetchByCriteria, { data: dataByCriteria, isLoading: isLoadingByCriteria }] =
    useFetchByCriteriaMutation()

  // todo: implement fetch all alerts on UI if you need
  const fetchAll = useCallback(async () => {
    try {
      await alertsFetchAll().unwrap()
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }, [dispatch, alertsFetchAll])

  const fetchByCriteria = useCallback(async () => {
    try {
      await alertsFetchByCriteria(state.criteria).unwrap()
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }, [alertsFetchByCriteria, state.criteria])

  const updateCriteria = useCallback(
    (newCriteria: IAlertCriteria) => {
      dispatch(setCriteria(newCriteria))
    },
    [dispatch]
  )

  const getLevelVariant = (level: ELevelStatus) => {
    switch (level) {
      case ELevelStatus.CRITICAL:
        return EColorVariants.DANGER
      case ELevelStatus.WARNING:
        return EColorVariants.WARNING
      default:
        return EColorVariants.SUCCESS
    }
  }

  const isLoading = useMemo(() => {
    return isFetchingAll || isLoadingByCriteria
  }, [isFetchingAll, isLoadingByCriteria])

  const data = useMemo((): IListResponse<IAlert[]> => {
    return dataByCriteria ?? dataAll ?? (LIST_RESPONSE as IListResponse<IAlert[]>)
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

    getLevelVariant,
  }
}
