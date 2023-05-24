import { MapCache, SshProfileParams } from 'src/types'
import WebContents = Electron.WebContents
import { SSHProfileSession } from 'app/src-electron/ssh/SSHProfileSession'
import log from 'electron-log'
import { Prompt } from 'ssh2'
import { ProfilesStore } from 'app/src-electron/profiles/ProfilesStore'


const sshSessions: MapCache<SSHProfileSession> = {}

export const findSSHSession = (profileId: string): SSHProfileSession | undefined => {
  return sshSessions[profileId]
}

export const retrieveSSHSession = (profileId: string, sender: WebContents, notify: (msg: string) => void = () => ({})): SSHProfileSession => {
  let session = sshSessions[profileId]
  if(!session) {
    const profile = ProfilesStore().find(profileId) as SshProfileParams
    session = new SSHProfileSession(
      profile,
      profile.jumpProfile ? retrieveSSHSession(profile.jumpProfile, sender, notify) : undefined
    )

    session.on('starting', () => {
      notify('Conectando: ' + session.profile.host)
    })

    session.on('ready', () => {
      notify('Conectado: ' + session.profile.host)
    })

    session.on('banner', (banner: string) => {
      notify(banner)
    })

    session.on('try-keyboard', (prompts: Prompt[]) => {
      sender.send('ssh:try-keyboard', session.profile, prompts)
    })

    session.on('verify-hostkey', (hostkey: Buffer) => {
      sender.send('ssh:verify-hostkey', session.profile, hostkey)
    })

    session.on('uses', () => {
      log.debug('uses!', session.profile.host, session.uses)
      if(session.uses === 0) {
        log.debug('cerrando...',  session.profile.host, session.uses)
        session.close()
      }
    })

    session.on('update', () => {
      sender.send('profile:update', session.info())
    })

    sshSessions[profileId] = session
  }

  return session
}

export const getSshProfileName = (profile: SshProfileParams): string => {
  const parts = [profile.host]
  if(profile.username) {
    parts.unshift(profile.username, '@')
  }
  if(profile.port) {
    parts.push(':' + profile.port)
  }

  return parts.join('')
}
