import { createServer, Server, Socket } from 'net'
import { readFile } from 'fs/promises'


export const camelize = (s: string) => s.replace(/-./g, x=>x[1].toUpperCase())

export const openServer = (host: string, port: number, listener: (socket: Socket) => void): Promise<Server> => {
  return new Promise((resolve, reject) => {
    const server: Server = createServer(listener)
      .once('listening', () => resolve(server))
      .once('error', reject)
      .listen(port, host)
  })
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
