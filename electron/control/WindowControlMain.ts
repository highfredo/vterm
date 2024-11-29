import { BrowserWindow, ipcMain, clipboard, IpcMainInvokeEvent, shell } from 'electron'
import { cwd } from '../Store'
import { ConfigStore } from '../config/ConfigStore'

const configStore = ConfigStore()

ipcMain.handle('window:isMaximize', () => {
  const focused = BrowserWindow.getFocusedWindow()
  if (!focused) return false

  return focused.isMaximized()
})

ipcMain.on('window:minimize', () => {
  const focused = BrowserWindow.getFocusedWindow()
  if (!focused) return

  focused.minimize()
})

ipcMain.on('window:toggleMaximize', () => {
  const focused = BrowserWindow.getFocusedWindow()
  if (!focused) return

  if (focused.isMaximized()) {
    focused.unmaximize()
  } else {
    focused.maximize()
  }
})

ipcMain.on('window:close', () => {
  const focused = BrowserWindow.getFocusedWindow()
  if (!focused) return

  focused.close()
})

ipcMain.handle('clipboard:clipboardReadText', () => {
  return clipboard.readText()
})

ipcMain.on('clipboard:clipboardWriteText', (event: Electron.IpcMainInvokeEvent, txt: string) => {
  clipboard.writeText(txt)
})

ipcMain.on('window:openConfigDir', () => {
  shell.openPath(cwd)
})
