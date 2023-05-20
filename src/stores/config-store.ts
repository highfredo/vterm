import {defineStore} from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => {
    return {
      hotkeys: {} as Record<string, string[]>,
      openlinkIfCtrlClick: false,
      // currentTheme: 'light',
      // terminal: {} as ITerminalOptions,
      // openProfileOnStart: '',
    }
  },
  actions: {
    async load() {
      this.$state = await window.config.load()
    },
  },
})
