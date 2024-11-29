import { MapCache, SshProfile } from '../../app/types'
import WebContents = Electron.WebContents
import { SSHSession } from '@/ssh/SSHSession'
import log from 'electron-log'
import { Prompt } from 'ssh2'
import { ProfilesStore } from '@/profiles/ProfilesStore'
import { debounce } from 'lodash'

const sshSessions: MapCache<SSHSession> = {}

export const findSSHSession = (profileId: string): SSHSession | undefined => {
  return sshSessions[profileId]
}

export const retrieveSSHSession = (
  profileId: string,
  sender: WebContents,
  notify: (msg: string) => void = () => ({})
): SSHSession => {
  let session = sshSessions[profileId]
  if (!session) {
    const profile = ProfilesStore().find(profileId) as SshProfile
    session = new SSHSession(
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
      if (session.uses === 0) {
        log.debug('cerrando...', session.profile.host, session.uses)
        session.close()
      }
    })

    session.on(
      'update',
      debounce(
        () => {
          sender.send('ssh:onStatusUpdate', session.sessionStatus())
        },
        300,
        { maxWait: 300, leading: true }
      )
    )

    session.on('transfer', () => {
      sender.send('sftp:transfer', session.profile.id, session.sftpClient?.transfers() || [])
    })

    sshSessions[profileId] = session
  }

  return session
}

export const getSshProfileName = (profile: SshProfile): string => {
  const parts = [profile.host]
  if (profile.username) {
    parts.unshift(profile.username, '@')
  }
  if (profile.port) {
    parts.push(':' + profile.port)
  }

  return parts.join('')
}
