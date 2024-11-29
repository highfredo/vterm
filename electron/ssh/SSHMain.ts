import type { IpcMainInvokeEvent } from 'electron'
import { ipcMain } from 'electron'
import { retrieveSSHSession } from '@/ssh/SSHSessionManager'
import log from 'electron-log'
import { addToKnownHost } from '@/ssh/SshHostVerifier'
import { SshLocalTunnel } from '../../app/types'

ipcMain.on(
  'ssh:try-keyboard',
  async (event: IpcMainInvokeEvent, profileId: string, response: string[]) => {
    log.debug(profileId, response)
    const session = retrieveSSHSession(profileId, event.sender)
    session.keyboardInteractiveFinish(response)
  }
)

ipcMain.on(
  'ssh:verify-hostkey',
  async (event: IpcMainInvokeEvent, profileId: string, valid: boolean) => {
    const session = retrieveSSHSession(profileId, event.sender)
    session.verifyHostkey(valid)
  }
)

ipcMain.on(
  'ssh:add-to-known-host',
  async (_event: IpcMainInvokeEvent, host: string, hostkey: Buffer) => {
    addToKnownHost(host, hostkey)
  }
)

ipcMain.on(
  'ssh:add-tunnel',
  async (event: IpcMainInvokeEvent, profileId: string, tunnel: SshLocalTunnel) => {
    const session = retrieveSSHSession(profileId, event.sender)
    await session.localTunnel(tunnel)
    session.init()
  }
)

ipcMain.on(
  'ssh:remove-tunnel',
  async (event: IpcMainInvokeEvent, profileId: string, tunnel: SshLocalTunnel) => {
    const session = retrieveSSHSession(profileId, event.sender)
    session.findTunnel(tunnel)?.server?.close()
  }
)

ipcMain.handle(
  'sftp:readdir',
  async (event: IpcMainInvokeEvent, profileId: string, path: string) => {
    const session = await retrieveSSHSession(profileId, event.sender).init()
    const sftp = await session.sftp()
    return sftp.readdir(path)
  }
)

ipcMain.handle(
  'sftp:realpath',
  async (event: IpcMainInvokeEvent, profileId: string, path: string) => {
    const session = await retrieveSSHSession(profileId, event.sender).init()
    const sftp = await session.sftp()
    return sftp.realpath(path)
  }
)

ipcMain.on(
  'sftp:download',
  async (event: IpcMainInvokeEvent, profileId: string, remotePath: string, localPath: string) => {
    const session = await retrieveSSHSession(profileId, event.sender).init()
    const sftp = await session.sftp()
    sftp.download(remotePath, localPath)
  }
)

ipcMain.on(
  'sftp:upload',
  async (event: IpcMainInvokeEvent, profileId: string, localPath: string, remotePath: string) => {
    const session = await retrieveSSHSession(profileId, event.sender).init()
    const sftp = await session.sftp()
    sftp.upload(localPath, remotePath)
  }
)
