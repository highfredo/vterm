import { Terminal } from 'xterm'
import { IBaseShellHandler, ShellDimensions } from '@/types'
import { v4 } from 'uuid'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { SearchAddon } from 'xterm-addon-search'
import { WebglAddon } from 'xterm-addon-webgl'
import { useConfigStore } from '@/stores/config-store'
import { watchDebounced, useElementSize } from '@vueuse/core'
import { onActivated, onDeactivated, ref, Ref, WatchStopHandle } from 'vue'
import { getCssVar } from 'quasar'
import { useHotKey } from '@/composables/useHotkey'

const enableHotkeys = ref(true)

export interface VTerm<T extends IBaseShellHandler> {
  terminal: Terminal
  handler: Ref<T | undefined>
  search: SearchAddon

  close: () => void
  dimensions: () => ShellDimensions
  open(element: HTMLElement, profileId?: string): void
  connect(profileId: string): void
}

const configStore = useConfigStore()

class VTermImpl implements VTerm<IBaseShellHandler> {
  id: string
  terminal: Terminal
  handler: Ref<IBaseShellHandler | undefined> = ref()
  search: SearchAddon
  fitAddon: FitAddon
  stopFitWatch: WatchStopHandle | undefined
  webgl = new WebglAddon()

  constructor() {
    this.id = v4()
    this.terminal = new Terminal({
      allowProposedApi: true,
      fontFamily: "'MesloLGS NF', courier-new, courier, monospace",
      theme: {
        background: getCssVar('dark-page') ?? 'black',
        brightBlack: '#98a0a7'
      },
      convertEol: true
    })

    /**
     * Fit Addon
     */
    this.fitAddon = new FitAddon()
    this.terminal.loadAddon(this.fitAddon)

    /**
     * Search Addon
     */
    this.search = new SearchAddon()
    this.terminal.loadAddon(this.search)

    /**
     * WebLinks Addon
     */
    this.terminal.loadAddon(
      new WebLinksAddon(async (event: MouseEvent, uri: string) => {
        let open = true
        if (configStore.openlinkIfCtrlClick) {
          open = event.ctrlKey
        }
        if (open) {
          window.open(uri)
        }
      })
    )

    /**
     * Hotkey support
     */
    const hk = useHotKey()
    this.terminal.attachCustomKeyEventHandler((evt: KeyboardEvent) => {
      if (enableHotkeys.value) {
        const found = hk.addKeyEvent(evt)
        if (found) {
          evt.stopPropagation()
          evt.preventDefault()
        }
        return !found
      } else {
        return true
      }
    })
  }

  close(): void {
    this.stopFitWatch && this.stopFitWatch()
    this.handler.value?.close()
    this.webgl.dispose()
    this.terminal.dispose()
  }

  dimensions(): ShellDimensions {
    return {
      cols: this.terminal.cols,
      rows: this.terminal.rows,
      height: this.terminal.element?.clientHeight ?? 400,
      width: this.terminal.element?.clientWidth ?? 800
    }
  }

  open(element: HTMLElement, profileId?: string): void {
    const { width, height } = useElementSize(element)

    const start = () => {
      this.fitAddon.fit()
      this.terminal.focus()
      return watchDebounced(
        [width, height],
        () => {
          console.log('fit!')
          this.fitAddon.fit()
          this.webgl.clearTextureAtlas()
        },
        { debounce: 300, maxWait: 1000 }
      )
    }

    onDeactivated(() => {
      this.stopFitWatch && this.stopFitWatch()
    })

    onActivated(() => {
      this.stopFitWatch = start()
    })

    this.terminal.open(element)

    /**
     * WebglAddon Addon
     */
    this.terminal.loadAddon(this.webgl)

    this.stopFitWatch = start()

    this.terminal.onData((data: string) => {
      this.handler.value?.write(data)
    })

    this.terminal.onResize(() => {
      this.handler.value?.resize(this.dimensions())
    })

    if (profileId) {
      this.connect(profileId)
    }
  }

  async connect(profileId: string) {
    if (this.handler.value) {
      this.handler.value?.close()
      this.terminal.reset()
    }

    const handler: IBaseShellHandler = await window.shell.shell({
      profileId,
      ...this.dimensions()
    })

    handler.on('ready', () => {
      console.log('ready!!!')
      this.handler.value = handler
    })

    handler.on('data', (data) => this.terminal.write(data))

    handler.on('info', (data) => this.terminal.write(data))

    handler.on('error', (err) => {
      console.log('error!!!', err)
      this.terminal.write(err + '\n')
      this.terminal.write('\n\n\nPulse cualquier tecla para reintentar\n')
      this.retryOnKey(profileId)
    })

    handler.on('close', () => {
      this.handler.value?.close()
      this.handler.value = undefined
      this.terminal.write('\n\n\nSesión terminada, pulse cualquier tecla para reconectar\n')
      this.retryOnKey(profileId)
    })
  }

  private retryOnKey(profileId: string) {
    const disposable = this.terminal.onData(() => {
      this.terminal.reset()
      this.connect(profileId)
      disposable.dispose()
    })
  }
}

export default function useVTerm() {
  return {
    create() {
      return new VTermImpl()
    },
    enableHotkeys
  }
}
