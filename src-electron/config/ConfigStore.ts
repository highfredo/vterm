import { getStore } from 'app/src-electron/Store'
import { VTermConfig } from 'src/types'

const store = getStore('config', {
  defaults: {
    'last-workspace': 'workspace.yaml',
    'enableHardwareAcceleration': true,
    'multiwindow': false,
    'hotkeys': {
      'search': [
        'ctrl+f'
      ],
      'copy': [
        'ctrl+c'
      ],
      'paste': [
        'ctrl+v'
      ],
      'clear': [
        'ctrl+l'
      ],
      'new-tab': [
        'ctrl+t'
      ],
      'close-tab': [
        'ctrl+w'
      ],
      'goto-tab-1': [
        'ctrl+1'
      ],
      'goto-tab-2': [
        'ctrl+2'
      ],
      'goto-tab-3': [
        'ctrl+3'
      ],
      'goto-tab-4': [
        'ctrl+4'
      ],
      'goto-tab-5': [
        'ctrl+5'
      ],
      'goto-tab-6': [
        'ctrl+6'
      ],
      'goto-tab-7': [
        'ctrl+7'
      ],
      'goto-tab-8': [
        'ctrl+8'
      ],
      'goto-tab-9': [
        'ctrl+9'
      ],
      'goto-tab-10': [
        'ctrl+0'
      ],
      'goto-tab-next': [
        'ctrl+tab'
      ],
      'goto-tab-prev': [
        'ctrl+shift+tab'
      ],
      'open-snippets': [
        'ctrl+p'
      ],
      'split-up': [
        'ctrl+up'
      ],
      'split-down': [
        'ctrl+down'
      ],
      'split-left': [
        'ctrl+left'
      ],
      'split-right': [
        'ctrl+right'
      ],
      'open-config': [
        'ctrl+,'
      ]
    }
  }
})

export const ConfigStore = () => {
  return {
    get(): VTermConfig {
      return store.store as VTermConfig // TODO rellenar con defaults
    }
  }
}

