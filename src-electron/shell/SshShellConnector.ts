import { ShellDimensions, ShellRequest, SshProfileParams } from 'src/types'
import { Connection } from './ShellConnector'
import { ClientChannel } from 'ssh2'
import WebContents = Electron.WebContents
import { retrieveSSHSession } from 'app/src-electron/ssh/SSHSessionManager'

export class SshShellConnection extends Connection {
  shell: ClientChannel | undefined

  constructor(
    private profile: SshProfileParams,
    private shellRequest: ShellRequest,
    sender: WebContents
  ) {
    super(sender)
  }

  async init() {
    const session = retrieveSSHSession(this.profile.id, this.sender, (msg: string) => {
      this.send('info', msg + '\n')
    })

    await session.init()

    this.shell = await session.shell({
      rows: this.shellRequest.rows,
      cols: this.shellRequest.cols,
      height: this.shellRequest.height,
      width: this.shellRequest.width,
      term: 'xterm-256color',
    })

    this.shell.on('data', (data: string) => this.send('data', data))
    this.shell.on('close', () => this.send('close'))
  }

  write(data: string) {
    this.shell?.write(data)
  }

  resize(dim: ShellDimensions) {
    this.shell?.setWindow(dim.rows+'', dim.cols+'', dim.height+'', dim.width+'')
  }

  close() {
    this.shell?.close()
  }
}
