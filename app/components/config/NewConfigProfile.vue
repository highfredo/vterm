<template>
  <q-btn @click="profile.type = 'local'">Local</q-btn>
  <q-btn @click="profile.type = 'ssh'">SSH</q-btn>
</template>

<script setup lang="ts">
import { Profile } from '@/types'

const profile = defineModel<Profile>({ required: true })
</script>

<style scoped lang="scss"></style>
