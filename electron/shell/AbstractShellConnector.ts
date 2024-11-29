import { ShellDimensions } from '../../app/types'
import WebContents = Electron.WebContents
import { v4 } from 'uuid'

export abstract class Connection {
  channel: string

  protected constructor(protected sender: WebContents) {
    this.channel = 'shell:' + v4()
  }

  send(name: string, ...args: unknown[]) {
    this.sender.send(this.channel, name, ...args)
  }

  abstract init(): Promise<void>
  abstract write(data: string): void
  abstract resize(dim: ShellDimensions): void
  abstract close(): void
}
