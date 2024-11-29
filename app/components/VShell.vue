<template>
  <div class="full-height">
    <search-prompt :vterm="vterm"></search-prompt>
    <div ref="terminal" class="terminal q-ml-sm"></div>
  </div>
</template>

<script setup lang="ts">
import '@xterm/xterm/css/xterm.css'
import useVTerm from '@/composables/useVTerm'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import SearchPrompt from '@/components/SearchPrompt.vue'
import { useHotKey } from '@/composables/useHotkey'
import { useQuasar } from 'quasar'
import { Profile } from '@/types'
import useContextMenu, { ContextMenuItem } from '@/composables/useContextMenu'
import useDialog from '@/composables/useDialog'
import PasteDialog from '@/components/PasteDialog.vue'
import { useTabStore } from '@/stores/tab-store'
import useSplitPanel from '@/composables/useSplitPanel'
// import VSftp from '@/components/VSftp.vue'

const props = defineProps<{
  profile: Profile
}>()

const terminal = ref()
const vterm = useVTerm().create()
const hotkey = useHotKey()
const $q = useQuasar()
const dialog = useDialog()
const tabStore = useTabStore()
const splitPanel = useSplitPanel()

onMounted(() => {
  vterm.open(terminal.value, props.profile.id)
})

onBeforeUnmount(() => {
  vterm.close()
})

const paste = async () => {
  let txt: string = await window.wincontrol.clipboardReadText()
  if (txt.includes('\n')) {
    const { payload } = await dialog(PasteDialog, { txt })
    if (!payload) return
    txt = payload.replaceAll(/(\r\n)|(\n)/g, '\r')
  }

  vterm.handler.value?.write(txt)
}

hotkey.on(
  'copy',
  () => {
    if (vterm.terminal.hasSelection()) {
      $q.notify('Copiado.')
      window.wincontrol.clipboardWriteText(vterm.terminal.getSelection())
    } else {
      vterm.handler.value?.write('\x03')
    }
  },
  terminal
)

hotkey.on('paste', () => paste(), terminal)

hotkey.on(
  'clear',
  () => {
    vterm.terminal.reset()
  },
  terminal
)

useContextMenu().register(() => {
  const menu: ContextMenuItem[] = [
    {
      label: 'Reconectar',
      action: () => vterm.connect(props.profile.id)
    }
  ]
  // if (props.profile.type === 'ssh') {
  //   menu.push({
  //     label: 'Abrir SFTP',
  //     action: () => {
  //       tabStore.open({
  //         title: 'Files: ' + props.profile.title
  //       })
  //     }
  //   })
  // }
  return menu
})
</script>

<style scoped lang="scss">
.terminal {
  background: $dark-page;
  height: 100%;
}
</style>
