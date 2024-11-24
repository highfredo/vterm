import { LocalProfileParams, ProfileParams, SshProfileInfo, SshTunnelInfo } from 'src/types'
import { findSSHSession, getSshProfileName } from 'app/src-electron/ssh/SSHSessionManager'
import { getStore } from 'app/src-electron/Store'

// TODO redo this
const workspaceStore = getStore('workspace', {
  defaults: {
    'name': 'Default',
    'profiles': [
      {
        'id': 'powershell',
        'type': 'local',
        'title': 'powershell',
        'exe': 'C:\\\\WINDOWS\\\\System32\\\\WindowsPowerShell\\\\v1.0\\\\powershell.exe'
      },
      {
        'id': 'cmd',
        'type': 'local',
        'title': 'CMD',
        'clearKey': 'cls\r',
        'exe': 'C:\\\\Windows\\\\system32\\\\cmd.exe'
      },
      {
        'id': 'sample',
        'type': 'ssh',
        'title': 'SSH tunelado',
        'host': 'localhost',
        'identity': 'sample-identity',
        'tags': [
          'sample',
          'ssh'
        ]
      }
    ],
    'identities': [
      {
        'id': 'sample-identity',
        'username': 'root',
        'privateKey': 'file://C:\\Users\\sample\\.ssh\\id_rsa'
      },
    ]
  }
})

export const ProfilesStore = () => {
  return {
    find(profileId: string) {
      return fillProfile(workspaceStore.find('profiles', profileId))
    },
    get() {
      return (workspaceStore.get('profiles') as []).map(fillProfile)
    }
  }
}

const fillProfile = (profile: ProfileParams) => {
  return profile.type === 'local' ? fillLocalProfile(profile) : fillSshProfile(profile as SshProfileInfo)
}


const fillLocalProfile = (profile: ProfileParams) => {
  profile.subtitle = profile.subtitle ?? (profile as LocalProfileParams).exe.replaceAll('\\\\', '\\')
  return profile
}

// TODO dividir profile de estado?
const fillSshProfile = (profile: SshProfileInfo) => {
  const session = findSSHSession(profile.id)

  profile.subtitle = profile.subtitle || getSshProfileName(profile)
  profile.status = session?.status || 'stopped'
  profile.tunnels?.map(t => {
    const ti = t as SshTunnelInfo
    ti.status = session?.findTunnel(t)?.status || 'stopped'
    return ti
  })

  return profile
}

