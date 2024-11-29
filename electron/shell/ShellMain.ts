import type { IpcMainInvokeEvent } from 'electron'
import { ipcMain } from 'electron'
import {
  LocalProfileParams,
  ShellDimensions,
  ShellRequest,
  SshProfileParams
} from '../../app/types'
import { LocalConnection } from '@/shell/LocalShellConnector'
import { SshShellConnection } from '@/shell/SshShellConnector'
import log from 'electron-log'
import { ProfilesStore } from '@/profiles/ProfilesStore'

const workspaceStore = ProfilesStore()

ipcMain.handle('shell:new', async (event: IpcMainInvokeEvent, shellRequest: ShellRequest) => {
  const profile = workspaceStore.find(shellRequest.profileId)

  log.debug('Perfil de la shell: ', shellRequest.profileId)
  const connection =
    profile.type === 'local'
      ? new LocalConnection(profile as LocalProfileParams, shellRequest, event.sender)
      : new SshShellConnection(profile as SshProfileParams, shellRequest, event.sender)

  const close = () => {
    connection.close()
    ipcMain.removeAllListeners(connection.channel)
  }

  connection.init().then(
    () => {
      ipcMain.on(connection.channel, (event: IpcMainInvokeEvent, type: string, args: unknown) => {
        if (type === 'write') {
          connection.write(args as string)
        } else if (type === 'resize') {
          connection.resize(args as ShellDimensions)
        } else if (type === 'close') {
          close()
        }
      })
      connection.send('ready')
    },
    (error: any) => {
      connection.send('error', error)
      close()
    }
  )

  return connection.channel
})
