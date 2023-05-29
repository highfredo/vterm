import { SFTPWrapper, Stats } from 'ssh2';
import fs from 'fs-extra'
import speedometer from 'speedometer';
import log from 'electron-log';

export class SFTPTransfer {

  private CHUNK_SIZE = 32768
  private THREADS_LEN = 32
  private threads: Buffer[] = []

  private src: any
  private srcHandle: any
  private dst: any
  private dstHandle: any

  status: 'pause' | 'progress' | 'finished' | 'error' = 'progress'
  total = 0
  transferred = 0
  speed = 0
  _speed = speedometer() // TODO no usar este paquete
  error?: any

  constructor(
    private wrapper: SFTPWrapper,
    public remoteFile: string,
    public localFile: string,
    public mode: 'download' | 'upload'
  ) {
    // TODO ajustar numero de threads para ficheros pequeños
    for(let i = 0; i < this.THREADS_LEN; i++) {
      this.threads.push(Buffer.alloc(this.CHUNK_SIZE))
    }
  }

  async open() {
    const remoteHandler = await new Promise((resolve, reject) => {
      this.wrapper.open(this.remoteFile, this.mode === 'download' ? 'r' : 'w', (err: Error | undefined, handle: Buffer) => {
        if(err) {
          return reject(err)
        }
        resolve(handle)
      })
    })

    const localHandler = await new Promise((resolve, reject) => {
      fs.open(this.localFile, this.mode === 'download' ? 'w' : 'r', (err, fd) => {
        if(err) {
          return reject(err)
        }
        resolve(fd)
      })
    })

    if(this.mode === 'download') {
      this.src = this.wrapper
      this.srcHandle = remoteHandler
      this.dst = fs
      this.dstHandle = localHandler
    } else {
      this.src = fs
      this.srcHandle = localHandler
      this.dst = this.wrapper
      this.dstHandle = remoteHandler
    }

    const stats: Stats = await new Promise((resolve, reject) => {
      const file = this.mode === 'download' ? this.remoteFile  : this.localFile
      this.src.stat(file, (error: Error | undefined, stats: Stats) => {
        if(error) reject(error)
        else resolve(stats)
      })
    })
    this.total = stats.size
  }

  start(onStep?: () => void) {
    let activeThreads = 0
    let position = -this.CHUNK_SIZE
    this.threads.forEach(async (buffer, idx) => {
      log.debug('iniciando...', idx+1, '/', this.THREADS_LEN)
      activeThreads++
      while(this.status === 'progress' && (position += buffer.length) < this.total) {
        try {
          const len = await this.transfer(buffer, position)
          this.transferred += len
        } catch (e) {
          this.error = e
          this.status = 'error'
        }
        onStep && onStep()
      }
      activeThreads--
      log.debug('finished', activeThreads)
      if(activeThreads === 0) {
        if(this.status === 'progress') {
          this.status = 'finished'
        }
        log.error('ERROR: ', this.error)
        this.close()
      }
    })
  }

  pause() {
    this.status = 'pause' // TODO
  }

  close() {
    this.src.close(this.srcHandle)
    this.dst.close(this.dstHandle)
  }

  private async transfer(buffer: Buffer, position: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const len = position + buffer.length >= this.total ? this.total - position : buffer.length

      if(len <= 0) {
        return reject(new Error(`Invalid len ${len}`))
      }

      this.src.read(this.srcHandle, buffer, 0, len, position, (err: Error) => {
        if(err) return reject(err)
        this.dst.write(this.dstHandle, buffer, 0, len, position, (err: Error) => {
          this.speed = this._speed(len)
          if(err) return reject(err)
          resolve(len)
        })
      })
    })
  }
}
