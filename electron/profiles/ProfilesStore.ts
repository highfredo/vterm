import { LocalProfile, Profile, ProfileUI, SshIdentity, SshProfile } from '../../app/types'
import { getSshProfileName } from '@/ssh/SSHSessionManager'
import { getStore } from '@/Store'

const workspaceStore = getStore('workspace', {
  defaults: {
    name: 'Default',
    profiles: [
      {
        id: 'powershell',
        type: 'local',
        title: 'powershell',
        exe: 'C:\\\\WINDOWS\\\\System32\\\\WindowsPowerShell\\\\v1.0\\\\powershell.exe'
      },
      {
        id: 'cmd',
        type: 'local',
        title: 'CMD',
        clearKey: 'cls\r',
        exe: 'C:\\\\Windows\\\\system32\\\\cmd.exe'
      },
      {
        id: 'sample',
        type: 'ssh',
        title: 'SSH tunelado',
        host: 'localhost',
        identity: 'sample-identity',
        tags: ['sample', 'ssh']
      }
    ],
    identities: [
      {
        id: 'sample-identity',
        username: 'root',
        privateKey: 'file://C:\\Users\\sample\\.ssh\\id_rsa'
      }
    ]
  }
})

export const ProfilesStore = () => {
  return {
    find(profileId: string): Profile {
      return workspaceStore.find('profiles', profileId)
    },
    list(): ProfileUI[] {
      return (workspaceStore.get('profiles') as []).map(toProfileUI)
    },
    save(profile: Profile) {
      const profiles = workspaceStore.get('profiles') as Profile[]
      const idx = profiles.findIndex((p) => p.id === profile.id)
      if (idx < 0) {
        profiles.push(profile)
      } else {
        profiles[idx] = profile
      }

      workspaceStore.set('profiles', profiles)
    }
  }
}

export const IdentityStore = () => {
  return {
    find(identityId: string) {
      return workspaceStore.find('identities', identityId)
    },
    get() {
      return workspaceStore.get('identities') as SshIdentity[]
    },
    save(identity: SshIdentity) {
      const identities = workspaceStore.get('identities') as SshIdentity[]
      const idx = identities.findIndex((p) => p.id === identity.id)
      if (idx < 0) {
        identities.push(identity)
      } else {
        identities[idx] = identity
      }

      workspaceStore.set('identities', identities)
    }
  }
}

export const toProfileUI = (profile: Profile): ProfileUI => {
  return profile.type === 'local'
    ? fillLocalProfile(profile as LocalProfile)
    : fillSshProfile(profile as SshProfile)
}

const fillLocalProfile = (profile: LocalProfile): ProfileUI => {
  return {
    type: 'local',
    id: profile.id,
    title: profile.title,
    subtitle: profile.exe.replaceAll('\\\\', '\\'),
    tags: profile.tags,
    icon: profile.icon
  }
}

const fillSshProfile = (profile: SshProfile): ProfileUI => {
  return {
    type: 'ssh',
    id: profile.id,
    title: profile.title,
    subtitle: getSshProfileName(profile),
    tags: profile.tags,
    icon: profile.icon
  }
}
