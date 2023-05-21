<template>
  <q-menu
    touch-position
    context-menu
    @before-show="loadItems"
    @hide="items = []"
  >
    <q-list dense style="min-width: 100px">
      <q-item
        v-for="(item, idx) in items"
        :key="idx"
        v-close-popup
        clickable>
        <q-item-section @click="item.action()">{{ item.label }}</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>
<script lang="ts" setup>

import { ref } from 'vue'
import useContextMenu, { ContextMenuItem } from 'src/composables/useContextMenu'

const items = ref<ContextMenuItem[]>([])
const contextMenu = useContextMenu()

const loadItems = (evt) => {
  items.value = contextMenu.getItems(evt)
}
</script>
