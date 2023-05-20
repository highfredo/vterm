import { ipcMain } from 'electron'
import { ProfileParams } from 'src/types'
import { ProfilesStore } from 'app/src-electron/profiles/ProfilesStore'

ipcMain.handle('profiles:load', (): ProfileParams[] => {
  return ProfilesStore().get()
})
