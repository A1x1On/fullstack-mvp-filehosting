import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import filesReducer from '@/features/files/filesSlice'
import { filesApi } from '@/api/filesApi'

import alertsReducer from '@/features/alerts/alertsSlice'
import { alertsApi } from '@/api/alertsApi'

export const store = configureStore({
  reducer: {
    files: filesReducer,
    [filesApi.reducerPath]: filesApi.reducer,

    alerts: alertsReducer,
    [alertsApi.reducerPath]: alertsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(filesApi.middleware).concat(alertsApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
