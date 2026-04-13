import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { ALERT_STATE, IAlertCriteria } from '@/entities/alert'

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState: ALERT_STATE,
  reducers: {
    setCriteria: (state, action: PayloadAction<IAlertCriteria>) => {
      state.criteria = action.payload
    },
  },
})

export const { setCriteria } = alertsSlice.actions

export default alertsSlice.reducer
