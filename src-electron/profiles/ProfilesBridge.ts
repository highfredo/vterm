import { contextBridge, ipcRenderer } from 'electron';
import { ProfileParams } from 'src/types'

contextBridge.exposeInMainWorld('profiles', {
  async load(): Promise<ProfileParams[]> {
    return ipcRenderer.invoke('profiles:load')
  },
  onUpdate(cb: (profile: ProfileParams) => void) {
    ipcRenderer.on('profile:update', (evt, profile) => cb(profile))
  }
})
