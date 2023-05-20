import { FileEntry, SFTPWrapper, Stats } from 'ssh2'
import { EventEmitter } from 'events'

export type ProgressCb = (bytes: number, total: number) => void

export type Transfer = {
  mode: 'upload' | 'download'
  status: 'queued' | 'progress'
  bytes: number
  total: number
  localFile: string
  remoteFile: string
}

export class SFTPClient extends EventEmitter {

  transfers: Transfer[] = []

  constructor(
    private wrapper: SFTPWrapper
  ) {
    super()
    wrapper.on('close', () => this.emit('close'))
  }

  async download(remoteFile: string, localFile: string, progress: ProgressCb) {
    // this.wrapper.wri
  }

  async upload(localFile: string, remoteFile: string, progress: ProgressCb) {
    // this.wrapper.wri
  }

  async stat(remotePath: string): Promise<Stats> {
    return new Promise((resolve, reject) => {
      this.wrapper.stat(remotePath, (error: Error | undefined, stats: Stats) => {
        if(error) reject(error)
        else resolve(stats)
      })
    })
  }

  async readdir(remotePath: string): Promise<FileEntry[]> {
    return new Promise((resolve, reject) => {
      this.wrapper.readdir(remotePath, (error: Error | undefined, entries: FileEntry[]) => {
        if(error) reject(error)
        else resolve(entries) // https://code-maven.com/system-information-about-a-file-or-directory-in-nodejs
      })
    })
  }

  close() {
    this.wrapper.destroy()
  }
}
