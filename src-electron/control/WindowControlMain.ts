import { BrowserWindow, ipcMain, clipboard, IpcMainInvokeEvent, shell } from 'electron'
import { cwd } from 'app/src-electron/Store'

ipcMain.handle('window:is-maximize', () => {
  const focused = BrowserWindow.getFocusedWindow()
  if(!focused) return false

  return focused.isMaximized()
})

ipcMain.on('window:minimize', () => {
  const focused = BrowserWindow.getFocusedWindow()
  if(!focused) return

  focused.minimize()
})

ipcMain.on('window:toggle-maximize', () => {
  const focused = BrowserWindow.getFocusedWindow()
  if(!focused) return

  if (focused.isMaximized()) {
    focused.unmaximize()
  } else {
    focused.maximize()
  }
})

ipcMain.on('window:close', () => {
  const focused = BrowserWindow.getFocusedWindow()
  if(!focused) return

  focused.close()
})

ipcMain.handle('clipboard:read-text', () => {
  return clipboard.readText()
})

ipcMain.on('clipboard:write-text', (event: Electron.IpcMainInvokeEvent, txt: string) => {
  clipboard.writeText(txt)
})

ipcMain.on('window:open-config-dir', () => {
  shell.openPath(cwd)
})
