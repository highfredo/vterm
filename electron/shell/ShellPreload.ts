import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { IBaseShellHandler, ShellRequest, ShellDimensions } from '../../app/types'
import { EventEmitter } from 'events'

const api = {
  async shell(shellRequest: ShellRequest): Promise<IBaseShellHandler> {
    console.log('Pidiendo shell', shellRequest)
    const channel = await ipcRenderer.invoke('shell:new', shellRequest)

    const emitter = new EventEmitter()

    ipcRenderer.on(channel, (event: IpcRendererEvent, type: string, ...rest) => {
      emitter.emit(type, ...rest)
    })

    return {
      write(data: string) {
        ipcRenderer.send(channel, 'write', data)
      },
      resize(size: ShellDimensions) {
        ipcRenderer.send(channel, 'resize', size)
      },
      close() {
        ipcRenderer.send(channel, 'close')
        ipcRenderer.removeAllListeners(channel)
        emitter.removeAllListeners()
      },
      send(name: string, ...args: any[]) {
        ipcRenderer.send(channel, name, ...args)
      },
      on(type: string, cb: (...args: any[]) => void) {
        emitter.on(type, cb)
      }
    } as IBaseShellHandler
  }
}

contextBridge.exposeInMainWorld('shell', api)
