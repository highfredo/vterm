import { contextBridge, ipcRenderer } from 'electron'
import { VTermConfig } from '../../app/types'

contextBridge.exposeInMainWorld('config', {
  async load(): Promise<VTermConfig> {
    return ipcRenderer.invoke('config:load')
  }
})
