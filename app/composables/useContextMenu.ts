import { onUnmounted, Ref, ref } from 'vue'
import { MaybeElementRef, unrefElement, useCurrentElement } from '@vueuse/core'

export type ContextMenuItem = {
  label: string
  children?: ContextMenuItem[]
  action: () => void
}

type ContextMenuObserver = {
  id: number
  listener: () => ContextMenuItem[]
  element: MaybeElementRef
}

const observers: Ref<ContextMenuObserver[]> = ref([])
let counter = 0

export default function useContextMenu() {

  return {
    register(listener: () => ContextMenuItem[], element?: MaybeElementRef) {
      const obs: ContextMenuObserver = {
        listener,
        element: element || useCurrentElement() as Ref<HTMLElement>,
        id: counter++
      }
      observers.value = [...observers.value, obs]

      onUnmounted(() => {
        observers.value = observers.value.filter((o) => o.id !== obs.id)
      })
    },
    getItems(evt: any): ContextMenuItem[] {
      const elmPath: HTMLElement[] = evt.composedPath()

      return observers.value.filter(o => {
        const elm = unrefElement(o.element)
        return elmPath.some((e: HTMLElement) => e === elm)
      }).flatMap((val: ContextMenuObserver) => val.listener())
    }
  }
}
