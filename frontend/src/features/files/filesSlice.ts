import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { FILE_STATE, type IFileCriteria } from '@/entities/file'

export const filesSlice = createSlice({
  name: 'files',
  initialState: FILE_STATE,
  reducers: {
    setCriteria: (state, action: PayloadAction<IFileCriteria>) => {
      state.criteria = action.payload
    },
  },
})

export const { setCriteria } = filesSlice.actions

export default filesSlice.reducer
