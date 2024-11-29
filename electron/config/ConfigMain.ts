import { ipcMain } from 'electron'
import { ConfigStore } from './ConfigStore'

ipcMain.handle('config:load', () => {
  return ConfigStore().get()
})
