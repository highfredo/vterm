<template>
  <div class="full-height force-scroll">
    <q-btn
      flat
      round
      icon="settings"
      class="config-btn"
      @click="openConfig"
    >
      <q-tooltip anchor="center left" self="center end">Configuración</q-tooltip>
    </q-btn>
    <div class="row justify-center">
      <div class="col q-pt-xl" style="max-width: 400px">
        <profile-list
          @open="open"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTabStore } from 'stores/tab-store'
import ProfileList from 'components/profile/ProfileList.vue'
import { ProfileParams } from 'src/types'
import VShell from 'components/VShell.vue'
import useSplitPanel from 'src/composables/useSplitPanel'
import VSftp from 'components/VSftp.vue'


const tabStore = useTabStore()
const splitPanel = useSplitPanel()

const open = (profile: ProfileParams) => {
  const tabRequest = {
    ...splitPanel.new(VShell, { profile }),
    title: profile.title
  }

  if(tabStore.currentTab) {
    tabStore.replace(tabRequest)
  } else {
    tabStore.open(tabRequest)
  }
}

const openConfig = () => {
  window.wincontrol.openConfigDir()
}

</script>

<style scoped lang="scss">
.config-btn {
  position: absolute;
  right: 11px;
  top: 10px;
}
</style>
