import { createServer, Server, Socket } from 'net'
import { readFile } from 'fs/promises'
import { EventEmitter } from 'events'


export const camelize = (s: string) => s.replace(/-./g, x=>x[1].toUpperCase())

export const openServer = (host: string, port: number, listener: (socket: Socket) => void): Promise<Server> => {
  const server: Server = createServer(listener).listen(port, host)
  return eventToPromise(server, 'listening')
}

export const readFileParam = async (key: string): Promise<string | Buffer> => {
  if(key.startsWith('file://')) {
    return await readFile(
      key.replace('file://', ''),
      { encoding: null }
    )
  }

  return key
}

export const eventToPromise = <T extends EventEmitter> (emitter: T, resolveEvt = 'ready', rejectEvt = 'error'): Promise<T> => {
  return new Promise((resolve, reject) => {
    const resolveFn = () => {
      resolve(emitter)
      emitter.off(rejectEvt, rejectFn)
    }
    const rejectFn = (error: any) => {
      reject(error)
      emitter.off(resolveEvt, resolveFn)
    }

    emitter.once(resolveEvt, resolveFn)
    emitter.once(rejectEvt, rejectFn)
  })
}
