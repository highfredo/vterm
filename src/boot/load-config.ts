import { boot } from 'quasar/wrappers'
import { useConfigStore } from 'stores/config-store'
import { QTabs } from 'quasar'


export default boot(async ({ app }) => {
  // Es necesario registrarlo globalmente para que draggable lo pueda usar
  app.component('QTabs', QTabs)


  await useConfigStore().load()
});
