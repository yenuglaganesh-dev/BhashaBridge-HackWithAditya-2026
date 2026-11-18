import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export const LANGUAGE_CODES = {
  telugu: { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  hindi: { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  english: { code: 'en', label: 'English', nativeName: 'English', speechCode: 'en-US' },
}

const languageSlice = createSlice({
  name: 'language',
  initialState: { current: 'english' },
  reducers: {
    setLanguage: (state, action) => {
      state.current = action.payload
    },
  },
})

export const { setLanguage } = languageSlice.actions

export default languageSlice.reducer

export const store = configureStore({
  reducer: {
    language: languageSlice.reducer,
  },
})
