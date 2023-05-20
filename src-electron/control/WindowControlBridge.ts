import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('wincontrol', {
  onIsMaximize(cb: (itIs: boolean) => void) {
    ipcRenderer.on('window:is-maximize', (event: IpcRendererEvent, itIs: boolean) => {
      cb(itIs)
    })
  },
  isMaximize() {
    return ipcRenderer.invoke('window:is-maximize')
  },
  minimize() {
    ipcRenderer.send('window:minimize')
  },
  toggleMaximize() {
    ipcRenderer.send('window:toggle-maximize')
  },
  close() {
    ipcRenderer.send('window:close')
  },
  async clipboardReadText(): Promise<string> {
    return ipcRenderer.invoke('clipboard:read-text')
  },
  clipboardWriteText(txt = '') {
    return ipcRenderer.send('clipboard:write-text', txt)
  },
  openConfigDir() {
    ipcRenderer.send('window:open-config-dir')
  },
})
