import type { IpcMainInvokeEvent} from 'electron'
import {ipcMain} from 'electron'
import { retrieveSSHSession } from 'app/src-electron/ssh/SSHSessionManager'
import log from 'electron-log'
import { SshTunnelParams } from 'src/types'
import { addToKnownHost } from 'app/src-electron/ssh/SshHostVerifier'


ipcMain.on('ssh:try-keyboard', async (event: IpcMainInvokeEvent, profileId: string, response: string[]) => {
  log.debug(profileId, response)
  const session = retrieveSSHSession(profileId, event.sender)
  session.keyboardInteractiveFinish(response)
})

ipcMain.on('ssh:verify-hostkey', async (event: IpcMainInvokeEvent, profileId: string, valid: boolean) => {
  const session = retrieveSSHSession(profileId, event.sender)
  session.verifyHostkey(valid)
})

ipcMain.on('ssh:add-to-known-host', async (event: IpcMainInvokeEvent, host: string, hostkey: Buffer) => {
  addToKnownHost(host, hostkey)
})

ipcMain.on('ssh:add-tunnel', async (event: IpcMainInvokeEvent, profileId: string, tunnel: SshTunnelParams) => {
  const session = retrieveSSHSession(profileId, event.sender)
  await session.localTunnel(tunnel)
  session.init()
})

ipcMain.on('ssh:remove-tunnel', async (event: IpcMainInvokeEvent, profileId: string, config: SshTunnelParams) => {
  const session = retrieveSSHSession(profileId, event.sender)
  const tunnel = session.findTunnel(config)
  if(tunnel)
    tunnel.server?.close()
})

ipcMain.handle('sftp:readdir', async (event: IpcMainInvokeEvent, profileId: string, path: string) => {
  const session = await retrieveSSHSession(profileId, event.sender).init()
  const sftp = await session.sftp()
  return sftp.readdir(path)
})
