/*
* Utils
* */
type Exclusive<
  T extends Record<PropertyKey, unknown>,
  U extends Record<PropertyKey, unknown>
  > =
  | (T & { [k in Exclude<keyof U, keyof T>]?: never })
  | (U & { [k in Exclude<keyof T, keyof U>]?: never })

type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T]

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
  on(type: 'ready', listener: () => void ): void
  on(type: 'error', listener: (error: string) => void ): void
  on(type: 'close', listener: () => void ): void
  on(name: 'data', listener: (data: string | Buffer) => void ): void
  on(name: 'info', listener: (data: string) => void ): void
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

  // template?: string // profile padre que tomar como plantilla
export type ProfileParams = ID & {
  type: string
  title: string
  subtitle?: string
  icon?: string
  clearKey?: string
  tags?: string[]
}

export type RunStatusOpts = 'starting' | 'started' | 'stopping' | 'stopped'

export type RunStatus = {
  status: RunStatusOpts
  error?: any
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
export type LocalProfileParams = ProfileParams & {
  exe: string
  cwd?: string
  args?: string[] | string
}

/*
* SSH Shell
* */
export type SshProfileParams = ProfileParams & SshIdentity & {
  host: string
  port?: number
  jumpProfile?: string
  identity?: string
  tunnels?: SshTunnelParams[]
}

export type SshIdentity = {
  username?: string
  password?: string
  privateKey?: Buffer | string
}

export type SshLocalTunnelParams = {
  type: 'local'
  description: string
  localHost: string
  localPort: number
  remoteHost: string
  remotePort: number
}

export type SshTunnelParams = SshLocalTunnelParams

export type SshTunnelInfo = RunStatus & SshTunnelParams

export type SshProfileInfo = SshProfileParams & RunStatus & {
  tunnels: SshTunnelInfo[]
}
