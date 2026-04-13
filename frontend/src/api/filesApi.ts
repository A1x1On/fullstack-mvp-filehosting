import { createApi, type FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'
import type { IFile, IFileCriteria } from '@/entities/file'
import { saveAs } from 'file-saver'

const BASE_URL = '/files'

export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Files'],

  endpoints: (builder) => ({
    fetch: builder.query<IListResponse<IFile[]>, void>({
      query: () => ({
        url: BASE_URL,
        method: 'GET',
      }),
      providesTags: ['Files'],
    }),

    fetchByCriteria: builder.mutation<IListResponse<IFile[]>, IFileCriteria>({
      query: (body) => ({
        url: `${BASE_URL}/getByCriteria`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Files'],
    }),

    upload: builder.mutation<IFile, FormData>({
      query: (body) => ({
        url: BASE_URL,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Files'],
    }),

    download: builder.mutation<null, string>({
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        try {
          const result = await baseQuery({
            url: `${BASE_URL}/${id}/download`,
            method: 'GET',
            responseHandler: (response: Response) => response.blob(),
          })

          if (result.error) {
            return { error: result.error }
          }

          const meta = result.meta as FetchBaseQueryMeta | undefined
          const contentDisposition = meta?.response?.headers.get('content-disposition')
          const filename = contentDisposition
            ? (contentDisposition.split("filename*=utf-8''")[1] ?? `file-${id}`)
            : `file-${id}`

          saveAs(result.data as Blob, filename)

          return { data: null }
        } catch (error: unknown) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          }
        }
      },
    }),
  }),
})

export const {
  useLazyFetchQuery,
  useFetchByCriteriaMutation,
  useUploadMutation,
  useDownloadMutation,
} = filesApi
