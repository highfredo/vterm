import { WindowControl } from './control/WindowControlPreload'
import { ProfileApi } from './profiles/ProfilesPreload'
import { SshApi } from '@/ssh/SSHPreload'

declare global {
  interface Window {
    wincontrol: WindowControl
    profiles: ProfileApi
    ssh: SshApi
  }
}
