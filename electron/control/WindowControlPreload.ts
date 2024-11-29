import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const api = {
  onFocus(cb: () => void) {
    ipcRenderer.on('window:focus', cb)
  },
  onBlur(cb: () => void) {
    ipcRenderer.on('window:blur', cb)
  },
  onIsMaximize(cb: (itIs: boolean) => void) {
    ipcRenderer.on('window:onIsMaximize', (_event: IpcRendererEvent, itIs: boolean) => {
      cb(itIs)
    })
  },
  isMaximize(): Promise<boolean> {
    return ipcRenderer.invoke('window:isMaximize')
  },
  minimize() {
    ipcRenderer.send('window:minimize')
  },
  toggleMaximize() {
    ipcRenderer.send('window:toggleMaximize')
  },
  close() {
    ipcRenderer.send('window:close')
  },
  async clipboardReadText(): Promise<string> {
    return ipcRenderer.invoke('clipboard:clipboardReadText')
  },
  clipboardWriteText(txt = '') {
    return ipcRenderer.send('clipboard:clipboardWriteText', txt)
  },
  openConfigDir() {
    ipcRenderer.send('window:openConfigDir')
  }
}

export type WindowControl = typeof api

contextBridge.exposeInMainWorld('wincontrol', api)
