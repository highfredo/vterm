import { useQuasar } from 'quasar'
import { Component } from 'vue'

export const okModal = Symbol('ok')
export const closeModal = Symbol('close')

export type DialogResult = {
  mode: typeof okModal | typeof closeModal
  payload?: any
}

export default function useDialog() {
  const $q = useQuasar()

  return (cmp: Component | string, props?: any): Promise<DialogResult> => {
    return new Promise(resolve => {
      return $q.dialog({
        component: cmp,
        componentProps: props
      })
        .onOk(payload => resolve({ mode: okModal, payload }))
        .onCancel(() => resolve({ mode: closeModal }))
    })
  }
}
