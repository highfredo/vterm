import { FileEntry, SFTPWrapper, Stats } from 'ssh2'
import { EventEmitter } from 'events'
import { constants } from 'fs'

export type ProgressCb = (bytes: number, total: number) => void

export type Transfer = {
  mode: 'upload' | 'download'
  status: 'queued' | 'progress'
  bytes: number
  total: number
  localFile: string
  remoteFile: string
}

export type SFTPFile = {
  isDirectory: boolean
  isSymbolicLink: boolean
  name: string
  uid: number
  gid: number
  size: number
  atime: number
  mtime: number
  permissions: string
}

export const fileEntryToFile = (entry: FileEntry): SFTPFile => {
  const permissions: string[] = []
  permissions.push(entry.attrs.mode & 300 ? 'r' : '-')
  permissions.push(entry.attrs.mode & 200 ? 'w' : '-')
  permissions.push(entry.attrs.mode & 100 ? 'x' : '-')

  permissions.push(entry.attrs.mode & 30 ? 'r' : '-')
  permissions.push(entry.attrs.mode & 20 ? 'w' : '-')
  permissions.push(entry.attrs.mode & 10 ? 'x' : '-')

  permissions.push(entry.attrs.mode & 3 ? 'r' : '-')
  permissions.push(entry.attrs.mode & 2 ? 'w' : '-')
  permissions.push(entry.attrs.mode & 1 ? 'x' : '-')


  return {
    isDirectory: (entry.attrs.mode & constants.S_IFDIR) === constants.S_IFDIR,
    isSymbolicLink: (entry.attrs.mode & constants.S_IFLNK) === constants.S_IFLNK,
    name: entry.filename,
    uid: entry.attrs.uid,
    gid: entry.attrs.gid,
    size: entry.attrs.size,
    atime: entry.attrs.atime * 1000,
    mtime: entry.attrs.mtime * 1000,
    permissions: permissions.join('')
  }
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

  async readdir(remotePath: string): Promise<SFTPFile[]> {
    return new Promise((resolve, reject) => {
      this.wrapper.readdir(remotePath, (error: Error | undefined, entries: FileEntry[]) => {
        if(error) {
          reject(error)
        } else {
          resolve(entries.map(fileEntryToFile))
        }
      })
    })
  }

  async realpath(remotePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.wrapper.realpath(remotePath, (error: Error | undefined, realpath: string) => {
        if(error) reject(error)
        else resolve(realpath)
      })
    })
  }

  close() {
    this.wrapper.destroy()
  }
}
