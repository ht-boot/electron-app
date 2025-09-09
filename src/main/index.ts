import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import axios, { AxiosError } from 'axios'

let mainWindow: BrowserWindow | null = null

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minHeight: 600,
    minWidth: 800,
    frame: false, // 🚀 去除原生边框
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  // 加载前端页面
  mainWindow.loadURL('http://localhost:5173')

  // 设置窗口宽高比 (16:9)
  mainWindow.setAspectRatio(16 / 9)

  // 监听 F12 打开调试工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' && input.type === 'keyDown') {
        mainWindow?.webContents.openDevTools()
        event.preventDefault()
      }
    })
  }
})

// 处理渲染进程发来的音乐搜索请求
ipcMain.handle('search-music', async (_event, keyword: string) => {
  try {
    const resp = await axios.post(
      'https://music.iqwq.cn/',
      new URLSearchParams({
        input: keyword,
        filter: 'name',
        type: 'netease',
        page: '1'
      }),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'x-requested-with': 'XMLHttpRequest'
        }
      }
    )

    return resp.data // 把结果返回给渲染进程
  } catch (err: any) {
    console.error('请求出错：', err.message)
    throw err
  }
})

// 监听渲染进程请求

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})
