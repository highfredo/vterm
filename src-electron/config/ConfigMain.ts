import { ipcMain } from 'electron'
import { ConfigStore } from 'app/src-electron/config/ConfigStore'

ipcMain.handle('config:load', () => {
  return ConfigStore().get()
})
