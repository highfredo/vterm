/*
 * Utils
 * */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Exclusive<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>
> =
  | (T & { [k in Exclude<keyof U, keyof T>]?: never })
  | (U & { [k in Exclude<keyof T, keyof U>]?: never })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T]

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type MaybeNew<T extends ID> = Optional<T, 'id'>

export type MapCache<T> = Record<string, T>

type ID = {
  id: string
}

/*
 * Common
 * */
export type IBaseShellHandler = {
  write(data: string): void
  resize(size: ShellDimensions): void
  close(): void
  on(type: 'ready', listener: () => void): void
  on(type: 'error', listener: (error: string) => void): void
  on(type: 'close', listener: () => void): void
  on(name: 'data', listener: (data: string | Buffer) => void): void
  on(name: 'info', listener: (data: string) => void): void
}

export type RunStatusOpts = 'starting' | 'started' | 'stopping' | 'stopped'

export type RunStatus = {
  status: RunStatusOpts
  error?: unknown
}

export type ShellDimensions = {
  cols: number
  rows: number
  height: number
  width: number
}

export type ShellRequest = {
  profileId: string
} & ShellDimensions

export type ProfileUI = ID & {
  type: string
  title: string
  subtitle: string
  tags?: string[]
  icon?: string
}

export type Profile = ID & {
  type: string
  title: string
  tags?: string[]
  icon?: string
}

export type SessionStatus = RunStatus & {
  profileId: string
}

export type VTermConfig = {
  'last-workspace': string
  hotkeys: Record<string, string[]>
  enableHardwareAcceleration: boolean
  multiwindow: boolean
  closeToTray: boolean
}

/*
 * Local Shell
 * */
export type LocalProfile = Profile & {
  type: 'local'
  exe: string
  cwd?: string
  args?: string
}

/*
 * SSH Shell
 * */
export type SshProfile = Profile &
  SshIdentity & {
    type: 'ssh'
    host: string
    port?: number
    jumpProfile?: string
    identity?: string
    tunnels?: SshLocalTunnel[]
  }

export type SshIdentity = ID & {
  title?: string
  username?: string
  password?: string
  privateKey?: string
}

export type SshLocalTunnel = {
  type: 'local'
  description: string
  localHost: string
  localPort: number
  remoteHost: string
  remotePort: number
}

export type SshTunnelStatus = RunStatus & SshLocalTunnel

export type SshSessionStatus = SessionStatus & {
  tunnels: SshTunnelStatus[]
}
