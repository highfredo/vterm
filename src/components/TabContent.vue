<template>
  <component :key="tab.id"
             :is="tab.component"
             v-bind="tab.props"
             v-if="tab.alive"
  />
</template>

<script setup lang="ts">
import { Tab } from 'stores/tab-store'

const props = withDefaults(defineProps<{
  tab: Tab
}>(), {})
</script>
