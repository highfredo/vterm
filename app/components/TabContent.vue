<template>
  <component :is="tab.component" v-if="tab.alive" :key="tab.id" v-bind="tab.props" />
</template>

<script setup lang="ts">
import { Tab } from '@/stores/tab-store'

const props = withDefaults(
  defineProps<{
    tab: Tab
  }>(),
  {}
)
</script>
