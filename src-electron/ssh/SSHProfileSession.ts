import { SSHClient } from 'app/src-electron/ssh/SSHClient'
import {
  RunStatus,
  RunStatusOpts,
  SshIdentity,
  SshLocalTunnelParams,
  SshProfileInfo,
  SshProfileParams,
  SshTunnelParams
} from 'src/types'
import { Server } from 'net'
import { ClientChannel, ConnectConfig, Prompt, PseudoTtyOptions } from 'ssh2'
import { userInfo } from 'os'
import { readFileParam } from 'app/src-electron/utils'
import log from 'electron-log'
import { EventEmitter } from 'events'
import { getStore } from 'app/src-electron/Store'
import { SFTPClient } from 'app/src-electron/ssh/SFTPClient'
import { ProfilesStore } from 'app/src-electron/profiles/ProfilesStore'

type SshTunnel = RunStatus & {
  server?: Server
  config: SshTunnelParams
}

ProfilesStore() // FIXME, fuerza a crear primero workspace.txt
const workspaceStore = getStore('workspace')

const getIdentity = async (profile: SshProfileParams): Promise<SshIdentity> => {
  const result: SshIdentity = { }

  if(profile.identity) {
    const identity = workspaceStore.find('identities', profile.identity)
    result.username = identity.username ?? profile.username
    result.password = identity.password ?? profile.password
    result.privateKey = identity.privateKey ?? profile.privateKey
  }

  if(!result.username) {
    result.username = userInfo().username
  }

  if(typeof result.privateKey === 'string') {
    result.privateKey = await readFileParam(result.privateKey)
  }

  return result
}

export class SSHProfileSession extends EventEmitter implements RunStatus {
  public client = new SSHClient()
  public sftpClient: SFTPClient | undefined
  public tunnels: SshTunnel[] = []
  error?: any
  $status: RunStatusOpts = 'stopped'
  $uses = 0

  get status() {
    return this.$status
  }
  set status(status: RunStatusOpts) {
    this.$status = status
    this.emit('update')
  }

  get uses() {
    return this.$uses
  }
  set uses(uses: number) {
    this.$uses = uses < 0 ? 0 : uses
    this.emit('uses')
  }

  constructor(
    public profile: SshProfileParams,
    public jumpSession?: SSHProfileSession
  ) {
    super()
  }

  info(): SshProfileInfo {
    return {
      ...this.profile,
      status: this.status,
      error: this.error,
      tunnels: this.profile.tunnels?.map(t => ({
        ...t,
        status: this.findTunnel(t)?.status || 'stopped'
      })) || []
    }
  }

  findTunnel(config: SshLocalTunnelParams) {
    return this.tunnels.find(tunnel => tunnel.config.type === config.type &&
      tunnel.config.localHost === config.localHost &&
      tunnel.config.localPort === config.localPort &&
      tunnel.config.remoteHost === config.remoteHost &&
      tunnel.config.remotePort === config.remotePort)
  }

  async init(): Promise<SSHProfileSession> {
    if(this.status === 'started') {
      return this
    } else if(this.status === 'starting') {
      return new Promise(resolve => {
        this.client.once('ready', () => resolve(this))
      })
    }

    this.status = 'starting'
    this.error = undefined

    const config: ConnectConfig = {
      host: this.profile.host,
      port: this.profile.port,
      ...await getIdentity(this.profile),
      tryKeyboard: true,
    }

    this.client.once('ready', () => {
      this.status = 'started'
      this.emit('ready')
    })

    this.client.once('try-keyboard', (prompts: Prompt[]) => {
      this.emit('try-keyboard', prompts)
    })

    this.client.once('verify-hostkey', (valid: boolean) => {
      this.emit('verify-hostkey', valid)
    })

    this.client.once('banner', (banner: string) => {
      this.emit('banner', banner)
    })

    this.client.once('error', (error) => {
      log.debug(error)
      this.status = 'stopped'
      this.error = error
    })

    this.client.once('close', () => {
      this.status = 'stopped'
      if(this.jumpSession) {
        config.sock?.destroy()
      }
    })

    if(this.jumpSession) {
      await this.jumpSession.init()
      config.sock = await this.jumpSession.forwardOut('127.0.0.1', 0, this.profile.host, this.profile.port ?? 22)
    }

    this.emit('starting')
    this.emit('update')

    await this.client.connect(config)

    this.emit('update')

    this.tunnels.forEach(t => this.startLocalTunnel(t))

    return this
  }

  async shell(window: PseudoTtyOptions): Promise<ClientChannel> {
    this.uses++
    const channel = await this.client.shell(window)
    channel.on('close', () => this.uses--)
    return channel
  }

  async sftp(): Promise<SFTPClient> {
    if(!this.sftpClient) {
      this.sftpClient = await this.client.sftp()
      this.sftpClient.on('close', () => {
        this.sftpClient = undefined
      })
    }

    return this.sftpClient
  }

  async localTunnel(config: SshLocalTunnelParams) {
    this.uses++

    const tunnel: SshTunnel = {
      status: 'starting',
      server: undefined,
      error: undefined,
      config
    }

    this.tunnels.push(tunnel)
    this.emit('update')
    if(this.status === 'started') {
      await this.startLocalTunnel(tunnel)
    }
  }

  private async startLocalTunnel(tunnel: SshTunnel) {
    try {
      const channel = await this.client.localTunnel(tunnel.config)
      tunnel.status = 'started'
      tunnel.server = channel
      this.emit('update')

      log.debug('tunnel abierto')
      channel.on('close', () => {
        log.debug('tunnel cerrado')
        this.tunnels = this.tunnels.filter(t => t !== tunnel)
        this.uses--
        this.emit('update')
      })
    } catch (error) {
      log.error(error)
      tunnel.error = error
      this.emit('update')
    }
  }

  async forwardOut(srcIP: string, srcPort: number, dstIP: string, dstPort: number): Promise<ClientChannel> {
    this.uses++
    const channel = await this.client.forwardOut(srcIP, srcPort, dstIP, dstPort)
    channel.on('close', () => this.uses--)
    return channel
  }

  keyboardInteractiveFinish(answers: string[]) {
    return this.client.keyboardInteractiveFinish && this.client.keyboardInteractiveFinish(answers)
  }

  verifyHostkey(valid: boolean) {
    return this.client.hostVerifierCallback && this.client.hostVerifierCallback(valid)
  }

  close() {
    this.client.close()
  }

}
