import {defineStore} from 'pinia';
import { Component, markRaw } from 'vue'
import { isNumber } from 'lodash-es'

export class Tab {
  eventTarget = new EventTarget()
  alive = true

  constructor(
    public id: string,
    public component: Component | string,
    public props: any,
    public title?: string,
  ) {
  }

  emit(name: string, ...params: any[]) {
    this.eventTarget.dispatchEvent(new CustomEvent(name, {detail: params}))
  }

  on(name: string, listener: (...params: any) => void) {
    this.eventTarget.addEventListener(name, (e) => {
      listener(...e.detail)
    })
  }
}

export type TabRequest = {
  component: Component
  props?: any
  title?: string
}

export type TabReplaceRequest = TabRequest & {
  tabId?: string
}

let nextTabId = 0

export const useTabStore = defineStore('tabs', {
  state: () => {
    return {
      tabs: [] as Tab[],
      currentTabId: undefined as undefined | string,
    }
  },
  actions: {
    async open(tabRequest: TabRequest) {
      const id = 'tab-' + nextTabId++

      const tab: Tab = new Tab(id, markRaw(tabRequest.component), tabRequest.props, tabRequest.title)
      this.tabs.push(tab)
      await this.gotoTab(id)
    },
    async replace(tabReplaceRequest: TabReplaceRequest) {
      const tab = this.findById(tabReplaceRequest.tabId ?? this.currentTabId ?? 'no-tab')
      if(!tab) {
        return console.warn('no tab found')
      }
      tab.component = markRaw(tabReplaceRequest.component)
      tab.props = tabReplaceRequest.props
      tab.title = tabReplaceRequest.title
    },
    findById(tabId: string): Tab | undefined {
      return this.tabs.find(t => t.id === tabId)
    },
    async close(tabId?: string) {
      const currentTabId = this.currentTabId
      const tabIdToClose = tabId ?? currentTabId
      const idx = this.tabs.findIndex(t => t.id === tabIdToClose)
      const tab = this.tabs[idx]

      let nextTabId: undefined | string = undefined
      if(tabIdToClose === currentTabId) {
        if(this.tabs.length === 1) {
          nextTabId = undefined
        } else if(idx === this.tabs.length-1) {
          nextTabId = this.tabs[idx-1].id
        } else {
          nextTabId = this.tabs[idx+1].id
        }
        nextTabId && await this.gotoTab(nextTabId)
      }

      this.tabs.splice(idx, 1)
      tab.alive = false
      tab.emit('close')
    },
    async gotoTab(tabIdOrIndex: string | number) {
      let tabId = tabIdOrIndex
      if(isNumber(tabIdOrIndex)) {
        let idx = Math.min(tabIdOrIndex, this.tabs.length - 1)
        idx = Math.max(0, idx)
        tabId = this.tabs[idx].id
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.currentTabId = tabId
    },
    async gotoNext() {
      await this.gotoTab((this.currentTabIndex + 1) % this.tabs.length)
    },
    async gotoPrev() {
      const tab = this.tabs.at((this.currentTabIndex - 1) % this.tabs.length)
      await this.gotoTab(tab?.id ?? 0)
    }
  },
  getters: {
    currentTab(): Tab | undefined {
      return this.tabs.find(t => t.id === this.currentTabId)
    },
    currentTabIndex(): number {
      return this.tabs.findIndex(t => t.id === this.currentTabId)
    },
  },
});
