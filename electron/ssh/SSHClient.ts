import {
  AnyAuthMethod,
  AuthenticationType,
  Client,
  ClientChannel,
  ClientErrorExtensions,
  ConnectConfig,
  KeyboardInteractiveCallback,
  NextAuthHandler,
  Prompt,
  PseudoTtyOptions,
  VerifyCallback
} from 'ssh2'
import { SshLocalTunnel } from '../../app/types'
import log from 'electron-log'
import { Server } from 'net'
import { EventEmitter } from 'events'
import { eventToPromise, openServer } from '@/utils'
import { verify } from '@/ssh/SshHostVerifier'
import { SFTPClient } from '@/ssh/SFTPClient'

export class SSHClient extends EventEmitter {
  private client = new Client()
  keyboardInteractiveFinish: KeyboardInteractiveCallback | undefined
  hostVerifierCallback: VerifyCallback | undefined
  validHostkey = false

  constructor() {
    super()

    this.client.on('banner', (banner: string) => {
      this.emit('banner', banner)
    })

    this.client.on('ready', async () => {
      this.emit('ready')
    })

    this.client.on('error', (err: Error & ClientErrorExtensions) => {
      if (!this.validHostkey && err.message === 'All configured authentication methods failed') {
        this.emit('error', new Error('hostkey not valid'))
      } else {
        this.emit('error', err)
      }
    })

    this.client.on('close', () => {
      this.keyboardInteractiveFinish = undefined
      this.hostVerifierCallback = undefined
      this.emit('close')
    })
  }

  async connect(config: ConnectConfig): Promise<void> {
    log.debug('conectando...')

    const authMethods = this.buildAuthMethods(config)
    let handshakePromise = Promise.resolve(false)
    this.client.connect({
      ...config,
      hostVerifier: async (key: Buffer) => {
        handshakePromise = verify(config.host ?? 'localhost', key).then((inKnownHosts) => {
          if (inKnownHosts) {
            this.validHostkey = true
            return true
          }

          return new Promise((resolve) => {
            this.hostVerifierCallback = (result: boolean) => {
              this.validHostkey = result
              resolve(result)
            }
            this.emit('verify-hostkey', key)
          })
        })

        return true
      },
      authHandler(
        _authsLeft: AuthenticationType[],
        _partialSuccess: boolean,
        next: NextAuthHandler
      ) {
        handshakePromise.then(async (hostValid) => {
          if (hostValid) {
            next(authMethods.next().value || false)
          } else {
            next(false)
          }
        })
      }
    })

    await eventToPromise(this)
  }

  private *buildAuthMethods(config: ConnectConfig): Generator<AuthenticationType | AnyAuthMethod> {
    log.debug('auth: none')
    yield 'none'

    if (config.password) {
      log.debug('auth: password')
      yield 'password'
    }

    if (config.privateKey) {
      log.debug('auth: publickey')
      yield 'publickey'
    }

    if (config.agent || config.agentForward) {
      log.debug('auth: agent')
      yield 'agent'
    }

    let tryKbWithPassword = false
    log.debug('auth: keyboard-interactive try password')
    yield {
      username: config.username!,
      type: 'keyboard-interactive',
      prompt: (
        _name: string,
        _instructions: string,
        _lang: string,
        prompts: Prompt[],
        finish: KeyboardInteractiveCallback
      ) => {
        if (config.password && prompts.length === 1 && prompts[0].prompt.includes('assword')) {
          tryKbWithPassword = true
          finish([config.password])
        } else {
          this.keyboardInteractiveFinish = finish
          this.emit('try-keyboard', prompts)
        }
      }
    }

    if (tryKbWithPassword) {
      log.debug('auth: keyboard-interactive')
      yield {
        username: config.username!,
        type: 'keyboard-interactive',
        prompt: (
          _name: string,
          _instructions: string,
          _lang: string,
          prompts: Prompt[],
          finish: KeyboardInteractiveCallback
        ) => {
          this.keyboardInteractiveFinish = finish
          this.emit('try-keyboard', prompts)
        }
      }
    }

    log.debug('auth: hostbased')
    yield 'hostbased'
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

  async localTunnel(config: SshLocalTunnel): Promise<Server> {
    log.debug('Creando tunel', config)

    const server = await openServer(config.localHost, config.localPort, async (socket) => {
      socket.on('error', (err) => {
        log.error('Socket error', err)
      })

      try {
        const channel = await this.forwardOut(
          socket.remoteAddress ?? '127.0.0.1',
          socket.remotePort ?? 0,
          config.remoteHost,
          config.remotePort
        )

        channel.pipe(socket)
        socket.pipe(channel)
        channel.on('close', () => {
          socket.destroy()
        })
        socket.on('close', () => {
          channel.close()
        })

        channel.on('error', (err: unknown) => {
          log.error('Channel error', err)
        })
      } catch (e) {
        log.error(e)
        socket.destroy()
      }
    })

    server.on('error', (err) => {
      log.error('Server error', err)
    })

    return server
  }

  async forwardOut(
    srcIP: string,
    srcPort: number,
    dstIP: string,
    dstPort: number
  ): Promise<ClientChannel> {
    return await new Promise((resolve, reject) => {
      this.client.forwardOut(srcIP, srcPort, dstIP, dstPort, (err, channel) => {
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
        if (error) reject(error)
        else resolve(new SFTPClient(sftp))
      })
    })
  }

  close() {
    return new Promise((resolve) => {
      this.client.once('close', () => resolve(null))
      this.client.destroy()
    })
  }
}
