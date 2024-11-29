import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { Profile, ProfileUI, SshIdentity } from '../../app/types'
import { toProfileUI, IdentityStore, ProfilesStore } from '@/profiles/ProfilesStore'

const profileStore = ProfilesStore()
const identityStore = IdentityStore()

ipcMain.handle('profiles:load', (): ProfileUI[] => {
  return profileStore.list()
})

ipcMain.handle('profiles:save', (_event: IpcMainInvokeEvent, profile: Profile) => {
  profileStore.save(profile)
  return toProfileUI(profile)
})

ipcMain.handle('profiles:retrieve', (_event: IpcMainInvokeEvent, id: string) => {
  return profileStore.find(id)
})

ipcMain.handle('profiles:loadIdentities', (): SshIdentity[] => {
  return identityStore.get()
})

ipcMain.handle('profiles:saveIdentity', (_event: IpcMainInvokeEvent, identity: SshIdentity) => {
  identityStore.save(identity)
})
