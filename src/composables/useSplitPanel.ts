import { Component, inject, markRaw } from 'vue'
import SpliteableContent from 'components/splitcontent/SpliteableContent.vue'

// function findPane(id: string, panels: any[]) {
//   let result
//   panels.some(o => o.id === id && (result = o) || (result = findPane(id, o.panels || [])))
//   return result
// }

export default function useSplitPanel() {
  // const currentSplitKey = inject('split-key')
  // const currentSplit = inject('split')

  return {
    new(component: Component, props?: any) {
      return {
        component: SpliteableContent,
        props: {
          direction: 'vertical',
          panels: [{
            component: markRaw(component),
            props: props
          }]
        }
      }
    },
    replace(component: Component, props?: any) {
      console.log('')
    },
    splitRight(paneId: string, component: Component, props?: any) {
      // comprobar si no es un spliteableContent
      // y si lo es, que sea en la direccion adecuada
      // TODO
    }
  }
}
