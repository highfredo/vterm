import { LocalProfile, ShellDimensions, ShellRequest } from '../../app/types'
import { IPty, spawn } from 'node-pty'
import WebContents = Electron.WebContents
import log from 'electron-log'
import { Connection } from './AbstractShellConnector'
import { homedir } from 'os'

export class LocalConnection extends Connection {
  ptyProcess: IPty | undefined

  constructor(
    private profile: LocalProfile,
    private shellRequest: ShellRequest,
    sender: WebContents
  ) {
    super(sender)
  }

  async init() {
    this.ptyProcess = spawn(this.profile.exe, this.profile.args ?? '', {
      cwd: homedir(),
      ...this.profile,
      cols: this.shellRequest.cols,
      rows: this.shellRequest.rows
    })

    this.ptyProcess.onData((data: string) => this.send('data', data))
    this.ptyProcess.onExit(() => this.send('close'))
    return Promise.resolve()
  }

  write(data: string) {
    this.ptyProcess?.write(data)
  }

  resize(dim: ShellDimensions) {
    log.debug('Resize', dim)
    this.ptyProcess?.resize(dim.cols, dim.rows)
  }

  close() {
    log.debug('Cerrando shell')
    this.ptyProcess?.kill()
  }
}
