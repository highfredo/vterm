import {
  Client,
  ClientChannel,
  ClientErrorExtensions,
  ConnectConfig,
  KeyboardInteractiveCallback,
  Prompt,
  PseudoTtyOptions,
  VerifyCallback
} from 'ssh2'
import { SshLocalTunnelParams } from 'src/types'
import log from 'electron-log'
import { Server } from 'net'
import { EventEmitter } from 'events'
import { openServer } from 'app/src-electron/utils'
import { verify } from 'app/src-electron/ssh/SshHostVerifier'
import { SFTPClient } from 'app/src-electron/ssh/SFTPClient'

export class SSHClient extends EventEmitter {
  private client = new Client()
  keyboardInteractiveFinish: KeyboardInteractiveCallback | undefined
  hostVerifierCallback: VerifyCallback | undefined

  async connect(config: ConnectConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      log.debug('conectando...')

      this.client.once('banner', (banner: string) => {
        this.emit('banner', banner)
      })

      this.client.once('keyboard-interactive', (name: string, instructions: string, lang: string, prompts: Prompt[], finish: KeyboardInteractiveCallback) => {
        this.keyboardInteractiveFinish = finish
        this.emit('try-keyboard', prompts)
      })

      let handshakePromise = Promise.resolve(true)
      this.client.once('ready', async () => {
        const valid = await handshakePromise
        if(valid) {
          log.debug('conectado!')
          this.emit('ready')
          resolve(undefined)
        } else {
          log.debug('hostkey not valid')
          this.emit('error', new Error('hostkey not valid'))
          reject('hostkey not valid')
        }
      })

      this.client.once('error', (err: Error & ClientErrorExtensions) => {
        this.emit('error', err)
        reject(err)
      })

      this.client.once('close', () => {
        this.keyboardInteractiveFinish = undefined
        this.hostVerifierCallback = undefined
        this.emit('close')
      })

      this.client.connect({
        ...config,
        hostVerifier: async (key: Buffer) => {
          verify(config.host ?? 'localhost', key).then(inKnownHosts => {
            if(inKnownHosts)
              return
            handshakePromise = new Promise(resolve => {
              this.hostVerifierCallback = (result: boolean) => resolve(result)
              this.emit('verify-hostkey', key)
            })
          })

          return true
        }
      })
    })
  }

  shell(window: PseudoTtyOptions): Promise<ClientChannel> {
    return new Promise((resolve, reject) => {
      this.client.shell(window, (err, channel) => {
        if (err) {
          return reject(err)
        }
        resolve(channel)
      })
    })
  }

  async localTunnel(config: SshLocalTunnelParams): Promise<Server> {
    log.debug('Creando tunel', config)

    return await openServer(config.localHost, config.localPort, async (socket) => {
      try {
        const channel = await this.forwardOut(
          socket.remoteAddress ?? '127.0.0.1', socket.remotePort ?? 0,
          config.remoteHost, config.remotePort
        )

        channel.pipe(socket)
        socket.pipe(channel)
        channel.on('close', () => {
          socket.destroy()
        })
        socket.on('close', () => {
          channel.close()
        })
      } catch (e) {
        log.error(e)
        socket.destroy()
      }
    })
  }

  async forwardOut(srcIP: string, srcPort: number, dstIP: string, dstPort: number): Promise<ClientChannel> {
    return await new Promise((resolve, reject) => {
      this.client.forwardOut(srcIP, srcPort, dstIP, dstPort,
        (err, channel) => {
          if (err) {
            reject(err)
            return
          }
          resolve(channel)
        })
    })
  }

  async sftp(): Promise<SFTPClient> {
    return new Promise((resolve, reject) => {
      this.client.sftp((error, sftp) => {
        if(error) reject(error)
        else resolve(new SFTPClient(sftp))
      })
    })
  }

  close() {
    // TODO devolver promesa y comprobar si está levantado
    this.client.destroy()
  }
}
