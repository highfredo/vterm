<template>
  <q-item
    v-ripple
    clickable>
    <q-item-section avatar top class="q-mt-xs q-pl-md">
      <q-icon name="terminal" />
    </q-item-section>
    <q-item-section class="q-py-sm">
      <q-item-label class="ellipsis">
        <span v-html="title"></span>
      </q-item-label>
      <q-item-label caption class="ellipsis">
        <span v-html="subtitle"></span>
      </q-item-label>
      <q-item-label>
        <q-chip
          v-for="(tag, idx) in tags"
          :key="idx"
          color="accent"
          dense>
          <span v-html="tag"></span>
        </q-chip>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
  tags?: string[]
}>()
</script>
