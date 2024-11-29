import { contextBridge, ipcRenderer } from 'electron'
import { Profile, ProfileUI, SshIdentity } from '../../app/types'

const api = {
  async load(): Promise<ProfileUI[]> {
    return ipcRenderer.invoke('profiles:load')
  },
  async save(profile: Profile): Promise<ProfileUI> {
    return ipcRenderer.invoke('profiles:save', profile)
  },
  async retrieve(profileId: string): Promise<Profile> {
    return ipcRenderer.invoke('profiles:retrieve', profileId)
  },
  async loadIdentities(): Promise<SshIdentity[]> {
    return ipcRenderer.invoke('profiles:loadIdentities')
  },
  async saveIdentity(identity: SshIdentity): Promise<void> {
    return ipcRenderer.invoke('profiles:saveIdentity', identity)
  }
}

export type ProfileApi = typeof api

contextBridge.exposeInMainWorld('profiles', api)
