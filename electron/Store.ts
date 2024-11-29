import ElectronStore from 'electron-store'
import yaml from 'js-yaml'
import { homedir } from 'os'
import { normalize } from 'path'

const stores: Record<string, Store> = {}
export const cwd = normalize(`${homedir()}/.config/vterm`)

export function getStore(name: string, opts?: any): Store {
  let store = stores[name]

  if(!store) {
    store = stores[name] = new Store({
      name,
      cwd,
      ...opts
    })
  }

  return store
}

export default class Store<T extends Record<string, any> = Record<string, unknown>> extends ElectronStore<T> {
  constructor(props?: ElectronStore.Options<T>) {
    super({
      fileExtension: 'yaml',
      serialize: yaml.dump,
      deserialize: yaml.load,
      ...props,
    })
  }

  push(key: string, obj: any) {
    const list = this.get(key) ?? []
    this.set(key, list.concat(obj))
  }

  remove(key: string, id: string) {
    const list = this.get(key)
    if (!list) {
      return
    }

    const filtered = list.filter((value: any) => {
      return value.id === id
    })
    this.set(key, filtered)
  }

  change(key: string, obj: any) {
    const list = this.get(key) ?? []

    const idx = list.findIndex((value: any) => {
      return value.id === obj.id
    })

    this.set(`${key}.${idx}`, obj)
  }

  find(key: string, id: string) {
    const list = this.get(key)
    if (!list) {
      return undefined
    }

    return list.find((value: any) => value.id === id)
  }
}
