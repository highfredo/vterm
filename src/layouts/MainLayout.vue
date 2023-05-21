<template>
  <q-layout view="hHh Lpr fFf">
    <q-header>
      <q-bar class="q-pl-none q-bar--big q-electron-drag q-pr-none">
        <q-tabs
          v-model="tabStore.currentTabId"
          class="q-electron-drag--exception"
          outside-arrows
          shrink
          stretch>
          <draggable
            v-model="tabStore.tabs"
            tag="div"
            class="row no-wrap"
            group="tabs"
            :animation="150"
            item-key="id">
            <template #item="{element}">
              <tab-flap
                :tab="element"
                @click="tabStore.currentTabId = element.id"
              />
            </template>
          </draggable>
        </q-tabs>
        <q-space class="min-space"/>
        <q-btn square flat icon="add" class="q-pa-sm" @click="newTab">
          <q-tooltip>Nueva pestaña</q-tooltip>
        </q-btn>
        <q-btn square flat icon="settings_input_hdmi" class="q-pa-sm" @click="openTunnelsPage">
          <q-tooltip>Tuneles</q-tooltip>
        </q-btn>
        <q-btn v-if="enableHotkeys" square flat icon="piano" class="q-pa-sm" @click="enableHotkeys = false">
          <q-tooltip>Deshabilitar shortcuts</q-tooltip>
        </q-btn>
        <q-btn v-else square flat icon="piano_off" class="q-pa-sm" @click="enableHotkeys = true">
          <q-tooltip>Habilitar shortcuts</q-tooltip>
        </q-btn>
        <q-btn square flat icon="minimize" class="minimize-btn q-ml-sm q-pa-sm" @click="minimize" />
        <q-btn square flat :icon="maximizeIcon" class="maximize-btn q-pa-sm" @click="toggleMaximize" />
        <q-btn square flat icon="close" class="close-btn q-pa-sm" @click="close" />
      </q-bar>
    </q-header>
    <q-page-container>
      <q-page style="height: calc(100vh - 37px);">
        <keep-alive v-if="tabStore.tabs.length">
          <tab-content
            :key="tabStore.currentTab?.id"
            :tab="tabStore.currentTab"
          />
        </keep-alive>
        <index-page v-else></index-page>
      </q-page>
    </q-page-container>

    <v-context-menu />
  </q-layout>
</template>

<script setup lang="ts">
import TabFlap from 'components/TabFlap.vue'
import { useTabStore } from 'stores/tab-store'
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useHotKey } from 'src/composables/useHotkey'
import IndexPage from 'pages/IndexPage.vue'
import useSplitPanel from 'src/composables/useSplitPanel'
import VContextMenu from 'components/VContextMenu.vue'
import TabContent from 'components/TabContent.vue'
import { ProfileParams, SshProfileParams } from 'src/types'
import { Prompt } from 'ssh2'
import PromptDialog from 'components/PromptDialog.vue'
import { clone } from 'lodash-es'
import draggable from 'vuedraggable'
import useDialog from 'src/composables/useDialog'
import useVTerm from 'src/composables/useVTerm'
import { useProfileStore } from 'src/composables/useProfileStore'
import SshTunnelsPage from 'pages/SshTunnelsPage.vue'
import HostVerifyDialog from 'components/HostVerifyDialog.vue'

const tabStore = useTabStore()
const hotkey = useHotKey()
const $q = useQuasar()
const dialog = useDialog()
const { enableHotkeys } = useVTerm()
const profileStore = useProfileStore()
$q.dark.set(true)

const maximizeIcon = ref('crop_square')

const splitPanel = useSplitPanel()
const newTab = () => {
  tabStore.open({
    ...splitPanel.new(IndexPage),
    title: 'Perfiles'
  })
}

const openTunnelsPage = () => {
  const tab = tabStore.tabs.find(c => c.component === SshTunnelsPage)
  if(tab) {
    tabStore.gotoTab(tab.id)
  } else {
    tabStore.open({
      component: SshTunnelsPage,
      title: 'Tuneles'
    })
  }
}

const minimize = () => {
  window.wincontrol.minimize()
}

const toggleMaximize = () => {
  window.wincontrol.toggleMaximize()
}

const close = () => {
  window.wincontrol.close()
}

const changeMaximizeIcon = (itIs: boolean) => {
  maximizeIcon.value = itIs ? 'close_fullscreen' : 'crop_square'
}

window.wincontrol.onIsMaximize(changeMaximizeIcon)
window.wincontrol.isMaximize().then(changeMaximizeIcon)

hotkey.on('new-tab', newTab)
hotkey.on('close-tab', () => tabStore.close())
hotkey.on('goto-tab-next', tabStore.gotoNext)
hotkey.on('goto-tab-prev', tabStore.gotoPrev)
hotkey.on('open-config', () => window.wincontrol.openConfigDir())

for(let i = 0; i < 10; i++){
  hotkey.on(`goto-tab-${i+1}`, () => {
    tabStore.gotoTab(i)
  })
}

window.ssh.onTryKeyboard(async (profile: SshProfileParams, prompts: Prompt[]) => {
  console.log(profile, prompts)
  const { payload } = await dialog(PromptDialog, {title: profile.host, prompts})
  window.ssh.tryKeyboard(profile.id, clone(payload))
})

window.ssh.onVerifyHostkey(async (profile: SshProfileParams, hostkey: Uint8Array) => {
  const {payload: { valid, store }} = await dialog(HostVerifyDialog, {title: profile.host, hostkey})
  window.ssh.verifyHostkey(profile.id, valid)

  if(store) {
    window.ssh.addToKnownHost(profile.host, hostkey)
  }
})

window.profiles.onUpdate((profile: ProfileParams) => {
  console.log('update profile', profile)
  profileStore.update(profile)
})

profileStore.load()
</script>


<style scoped lang="scss">
.min-space {
  min-width: 100px;
}

.close-btn:hover {
  background: $negative;
  > :deep(.q-focus-helper) {
    opacity: 0 !important;
  }
}
</style>
