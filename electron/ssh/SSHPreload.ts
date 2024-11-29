import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { Prompt } from 'ssh2'
import { ProgressInfo, SFTPFile } from '@/ssh/SFTPClient'
import { ProfileUI, SshLocalTunnel, SshSessionStatus } from '../../app/types'

const api = {
  tryKeyboard(profileId: string, response: string[]) {
    ipcRenderer.send('ssh:try-keyboard', profileId, response)
  },
  onTryKeyboard(cb: (profile: ProfileUI, prompts: Prompt[]) => void) {
    ipcRenderer.on(
      'ssh:try-keyboard',
      (_event: IpcRendererEvent, profile: ProfileUI, prompts: Prompt[]) => {
        cb(profile, prompts)
      }
    )
  },
  verifyHostkey(profileId: string, valid: boolean) {
    ipcRenderer.send('ssh:verify-hostkey', profileId, valid)
  },
  onVerifyHostkey(cb: (profile: ProfileUI, hostkey: Buffer) => void) {
    ipcRenderer.on(
      'ssh:verify-hostkey',
      (_event: IpcRendererEvent, profile: ProfileUI, hostkey: Buffer) => {
        cb(profile, hostkey)
      }
    )
  },
  addToKnownHost(host: string, hostkey: Buffer) {
    ipcRenderer.send('ssh:add-to-known-host', host, hostkey)
  },
  addTunnel(profileId: string, tunnel: SshLocalTunnel) {
    ipcRenderer.send('ssh:add-tunnel', profileId, tunnel)
  },
  removeTunnel(profileId: string, tunnel: SshLocalTunnel) {
    ipcRenderer.send('ssh:remove-tunnel', profileId, tunnel)
  },
  readdir(profileId: string, path: string): Promise<SFTPFile[]> {
    return ipcRenderer.invoke('sftp:readdir', profileId, path)
  },
  async realpath(profileId: string, path: string): Promise<string> {
    return ipcRenderer.invoke('sftp:realpath', profileId, path)
  },
  download(profileId: string, remotePath: string, localPath?: string) {
    ipcRenderer.send('sftp:download', profileId, remotePath, localPath)
  },
  upload(profileId: string, localPath: string, remotePath: string) {
    ipcRenderer.send('sftp:upload', profileId, localPath, remotePath)
  },
  onTransfer(cb: (profileId: string, progress: ProgressInfo[]) => void) {
    return ipcRenderer.on(
      'sftp:transfer',
      (_event: IpcRendererEvent, profileId: string, progress: ProgressInfo[]) => {
        cb(profileId, progress)
      }
    )
  },
  onStatusUpdate(cb: (status: SshSessionStatus) => void) {
    ipcRenderer.on('ssh:onStatusUpdate', (_evt, status) => cb(status))
  }
}

export const SshApi = typeof api

contextBridge.exposeInMainWorld('ssh', api)
