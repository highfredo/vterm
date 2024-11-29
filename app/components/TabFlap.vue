<template>
  <q-tab
    :name="tab.id"
    outside-arrows
    :label="tab.title"
    shrink
    stretch
    content-class="closable-tab"
    class="q-pr-sm"
    @click.middle.stop.prevent="close"
  >
    <q-btn
      round
      unelevated
      size="xs"
      class="close-btn"
      title="Cerrar pestaña"
      @click.stop.prevent="close"
    >
      <q-icon name="close" :color="isSelected ? 'negative-light' : ''" />
    </q-btn>
  </q-tab>
</template>

<script setup lang="ts">
import { Tab, useTabStore } from '@/stores/tab-store'
import { computed } from 'vue'
import useContextMenu from '@/composables/useContextMenu'

const props = defineProps<{
  tab: Tab
}>()

const tabStore = useTabStore()
const isSelected = computed(() => props.tab.id === tabStore.currentTabId)
const close = () => tabStore.close(props.tab.id)

useContextMenu().register(() => {
  return [
    {
      label: 'Cerrar',
      action: close
    }
  ]
})
</script>

<style lang="scss" scoped>
::v-global(.closable-tab) {
  padding-right: 30px;
}
.close-btn {
  position: absolute;
  right: 0;
}
</style>
