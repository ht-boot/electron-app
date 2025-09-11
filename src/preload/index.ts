import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  searchMusic: (keyword: string) => ipcRenderer.invoke('search-music', keyword)
})

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close')
})

contextBridge.exposeInMainWorld('volumeAPI', {
  get: () => ipcRenderer.invoke('get-volume'),
  set: (value: number) => ipcRenderer.invoke('set-volume', value),
  mute: (mute: boolean) => ipcRenderer.invoke('mute', mute)
})
