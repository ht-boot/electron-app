import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import axios from 'axios'
import loudness from 'loudness'
import icon from '../../resources/icon.png?asset'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 960,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true // 防止js注入
    }
  })

  mainWindow.on('ready-to-show', () => {
    ;(mainWindow as BrowserWindow).show()
  })

  // mainWindow.webContents.openDevTools()

  // 设置窗口宽高比 (16:9)
  mainWindow.setAspectRatio(16 / 9)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 监听渲染进程的调用 获取音量
ipcMain.handle('get-volume', async () => {
  return await loudness.getVolume()
})
// 监听渲染进程的调用 设置音量
ipcMain.handle('set-volume', async (_event, value: number) => {
  await loudness.setVolume(value) // 0 ~ 100
  return true
})
// 监听渲染进程的调用 设置静音
ipcMain.handle('mute', async (_event, mute: boolean) => {
  await loudness.setMuted(mute)
  return true
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

// 监听渲染进程请求最小化窗口
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})
// 监听渲染进程请求关闭窗口
ipcMain.on('window-close', () => {
  mainWindow?.close()
})
