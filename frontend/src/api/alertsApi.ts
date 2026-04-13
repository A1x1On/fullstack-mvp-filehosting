import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'
import type { IAlert, IAlertCriteria } from '@/entities/alert'

const BASE_URL = '/alerts'

export const alertsApi = createApi({
  reducerPath: 'alertsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Alerts'],

  endpoints: (builder) => ({
    fetch: builder.query<IListResponse<IAlert[]>, void>({
      query: () => ({
        url: BASE_URL,
        method: 'GET',
      }),
      providesTags: ['Alerts'],
    }),

    fetchByCriteria: builder.mutation<IListResponse<IAlert[]>, IAlertCriteria>({
      query: (body) => ({
        url: `${BASE_URL}/getByCriteria`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Alerts'],
    }),
  }),
})

export const { useLazyFetchQuery, useFetchByCriteriaMutation } = alertsApi
