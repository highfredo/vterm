import { FileEntry, SFTPWrapper, Stats } from 'ssh2'
import { EventEmitter } from 'events'
import { constants } from 'fs'
import { SFTPTransfer } from 'app/src-electron/ssh/SFTPTransfer';
import { debounce } from 'lodash';
import log from 'electron-log';
import { dialog, app } from 'electron'
import { basename, join } from 'path';


export type ProgressInfo = {
  id: number
  mode: 'upload' | 'download'
  status: 'queued' | 'progress' | 'finished'
  speed: number // bytes per second
  transferred: number
  total: number
  localFile: string
  remoteFile: string
  error?: Error
}

export type SFTPFile = {
  isDirectory: boolean
  isSymbolicLink: boolean
  name: string
  path: string
  uid: number
  gid: number
  size: number
  atime: number
  mtime: number
  permissions: string
}

export const fileEntryToFile = (entry: FileEntry, path: string): SFTPFile => {
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
    path,
    uid: entry.attrs.uid,
    gid: entry.attrs.gid,
    size: entry.attrs.size,
    atime: entry.attrs.atime * 1000,
    mtime: entry.attrs.mtime * 1000,
    permissions: permissions.join('')
  }
}

export class SFTPClient extends EventEmitter {

  private nextId = 0
  private _transfers: {
    id: number
    transfer: SFTPTransfer
  }[] = []

  constructor(
    private wrapper: SFTPWrapper
  ) {
    super()
    wrapper.on('close', () => this.emit('close'))
  }

  transfers(): ProgressInfo[] {
    return this._transfers.map(t => {
      return {
        id: t.id,
        mode: t.transfer.mode,
        status: t.transfer.status,
        speed: t.transfer.speed,
        transferred: t.transfer.transferred,
        total: t.transfer.total,
        localFile: t.transfer.localFile,
        remoteFile: t.transfer.remoteFile,
        error: t.transfer.error,
      } as ProgressInfo
    })
  }

  async download(remoteFile: string, localFile?: string): Promise<void> {
    let file = localFile

    if(!file) {
      const { filePath } = await dialog.showSaveDialog({
        title: 'guardar',
        defaultPath: join(app.getPath('downloads'), basename(remoteFile))
      })
      file = filePath
    }

    if(file) {
      this.doTransfer(remoteFile, file, 'download')
    }
  }

  async upload(localFile: string, remoteFile: string): Promise<void> {
    this.doTransfer(remoteFile, localFile, 'upload')
  }

  private async doTransfer(remoteFile: string, localFile: string, mode: 'upload' | 'download') {
    // TODO ignorar si ya se está descargando o error si el fichero ya existe?
    log.debug(remoteFile, localFile)
    const ts = new SFTPTransfer(this.wrapper, remoteFile, localFile, mode)
    this._transfers.push({
      id: this.nextId++,
      transfer: ts
    })

    await ts.open()

    ts.start(debounce(() => {
      this.emit('transfer')
    }, 1000, {maxWait: 1000, leading: true}))

    return ts
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
          resolve(entries.map(e => fileEntryToFile(e, remotePath)))
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
