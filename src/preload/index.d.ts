import { ElectronAPI } from '@electron-toolkit/preload'

// 在渲染进程的.d.ts文件中
declare global {
  interface Window {
    api: {
      searchMusic: (keyword: string) => Promise<any>
    }
    electronAPI: {
      minimize: () => void
      close: () => void
    }
    volumeAPI: {
      get: () => Promise<number>
      set: (value: number) => Promise<void>
      mute: (mute: boolean) => Promise<void>
    }
  }
}
