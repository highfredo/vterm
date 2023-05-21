import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { Prompt } from 'ssh2'
import { ProfileParams, SshTunnelParams } from 'src/types'
import { SFTPFile } from 'app/src-electron/ssh/SFTPClient'

const api = {
  tryKeyboard(profileId: string, response: string[]) {
    ipcRenderer.send('ssh:try-keyboard', profileId, response)
  },
  onTryKeyboard(cb: (profile: ProfileParams, prompts: Prompt[]) => void) {
    ipcRenderer.on('ssh:try-keyboard', (event: IpcRendererEvent, profile: ProfileParams, prompts: Prompt[]) => {
      cb(profile, prompts)
    })
  },
  verifyHostkey(profileId: string, valid: boolean) {
    ipcRenderer.send('ssh:verify-hostkey', profileId, valid)
  },
  onVerifyHostkey(cb: (profile: ProfileParams, hostkey: Buffer) => void) {
    ipcRenderer.on('ssh:verify-hostkey', (event: IpcRendererEvent, profile: ProfileParams, hostkey: Buffer) => {
      cb(profile, hostkey)
    })
  },
  addToKnownHost(host: string, hostkey: Buffer) {
    ipcRenderer.send('ssh:add-to-known-host', host, hostkey)
  },
  addTunnel(profileId: string, tunnel: SshTunnelParams) {
    ipcRenderer.send('ssh:add-tunnel', profileId, tunnel)
  },
  removeTunnel(profileId: string, tunnel: SshTunnelParams){
    ipcRenderer.send('ssh:remove-tunnel', profileId, tunnel)
  },
  readdir(profileId: string, path: string): Promise<SFTPFile[]> {
    return ipcRenderer.invoke('sftp:readdir', profileId, path)
  },
  async realpath(profileId: string, path: string): Promise<string> {
    return ipcRenderer.invoke('sftp:realpath', profileId, path)
  }
}

contextBridge.exposeInMainWorld('ssh', api)
