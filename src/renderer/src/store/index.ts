import { configureStore } from '@reduxjs/toolkit'
import baseSlice from './baseSlice/base' // 基本配置

export const store = configureStore({
  reducer: {
    base: baseSlice
  }
})

// 从 store 本身推断出 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
