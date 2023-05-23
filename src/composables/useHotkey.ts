import {onActivated, onDeactivated} from 'vue'
import type {MaybeElementRef} from '@vueuse/core'
import {unrefElement} from '@vueuse/core'
import {useConfigStore} from 'stores/config-store'
import {isEqual, forEach} from 'lodash-es'

type HotkeyBinding = {
  cb: (event: KeyboardEvent) => void
}

type NamedHotkey = {
  name: string
  keys: string[][]
  defaultElement: HTMLElement | SVGElement
  bindings: HotkeyBinding[]
}

export type Reanudable = {
  start: () => void
  stop: () => void
}

const emitter = new EventTarget()
let init = false
const hotkeys: NamedHotkey[] = []
const keyBuffer = new Set()
let hotkeyMatch: string | undefined = undefined
const keyAlias: Record<string, string> = {
  'ctrl': 'control',
  'esc': 'escape',
  'up': 'arrowup',
  'down': 'arrowdown',
  'left': 'arrowleft',
  'right': 'arrowright',
}
const calcHotkeyMatch = (event: KeyboardEvent): string | undefined => {
  hotkeyMatch = undefined

  if(keyBuffer.size === 0) {
    return
  }

  const pressedKeys = [...keyBuffer].sort()

  forEach(hotkeys, (value: NamedHotkey) => {
    if(value.keys.some(keys => isEqual(keys, pressedKeys))) {
      if(!value.bindings.length) {
        console.warn('No hay ningún evento registrado para el hotkey', value.name)
        return
      }
      hotkeyMatch = value.name
      return false
    }
  })

  return hotkeyMatch
}

const api = {
  register(name: string, keys: string[], defaultElement?: MaybeElementRef) {
    if(hotkeys.some(k => k.name === name)) {
      return
    }

    const hkeys: NamedHotkey = {
      name,
      defaultElement: unrefElement(defaultElement) ?? document.documentElement,
      bindings: [],
      keys: keys.map((hotkeystr) => {
        return hotkeystr.toLowerCase().split('+').map(k => keyAlias[k] ?? k).sort()
      }),
    }

    hotkeys.push(hkeys)
  },
  on(name: string, cb: (kbEvent: KeyboardEvent) => void, element?: MaybeElementRef): Reanudable | undefined {
    const namedHotkey = hotkeys.find(h => h.name === name)
    if(!namedHotkey) {
      console.error('no hotkey registered with name ', name)
      return
    }

    const etCb = ((evt: CustomEvent) => {
      const path = evt.detail.event.composedPath() as (HTMLElement | SVGElement)[]
      const elm = unrefElement(element) ?? namedHotkey.defaultElement

      if(!path.some(e => elm === e)) {
        return
      }

      const {event} = evt.detail
      cb(event)
    }) as EventListener

    const binding: HotkeyBinding = {
      cb: etCb
    }
    namedHotkey.bindings.push(binding)

    emitter.addEventListener(name, etCb)

    const reanudable = {
      start() {
        emitter.addEventListener(name, etCb)
        namedHotkey.bindings.push(binding)
      },
      stop() {
        emitter.removeEventListener(name, etCb)
        namedHotkey.bindings = namedHotkey.bindings.filter( h => h.cb !== etCb)
      }
    }

    onDeactivated(reanudable.stop)
    onActivated(reanudable.start)

    return reanudable
  },
  addKeyEvent(event: KeyboardEvent): string | undefined {
    if(event.type === 'keydown') {
      keyBuffer.add(event.key.toLowerCase())
    } else if(event.type === 'keyup') {
      keyBuffer.delete(event.key.toLowerCase())
    } else {
      return
    }

    calcHotkeyMatch(event)
    if(hotkeyMatch) {
      console.log('hk match:', hotkeyMatch)
      emitter.dispatchEvent(new CustomEvent(hotkeyMatch, {
        detail: {
          event,
        },
      }))
    }

    return hotkeyMatch
  },
  pressingHotkey(): string | undefined {
    return hotkeyMatch
  },
}

document.addEventListener('keyup', api.addKeyEvent)
document.addEventListener('keydown', api.addKeyEvent)

export function useHotKey() {
  if(!init) {
    init = true

    // Register app hotkeys
    const configStore = useConfigStore()
    for(const [name, keys] of Object.entries(configStore.hotkeys)) {
      api.register(name, keys)
    }
  }

  return api
}
