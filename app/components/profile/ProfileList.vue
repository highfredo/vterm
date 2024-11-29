<template>
  <div ref="searchField" class="column">
    <q-input v-model="search" outlined placeholder="Buscar..." autofocus>
      <template #append>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-list style="width: 100%">
      <profile-list-item
        v-for="rst in resultProfiles"
        :key="rst.item.id"
        :status="ssh.status.value[rst.item.id]?.status"
        :title="rst.highlight.title ?? rst.item.title"
        :subtitle="rst.highlight.subtitle ?? rst.item.subtitle"
        :tags="rst.highlight.tags ?? rst.item.tags"
        @click="emit('open', rst.item)"
      />
      <q-item v-if="!resultProfiles.length">
        <q-item-section>No se ha encontrado ninguna sesión</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ComputedRef, ref } from 'vue'
import ProfileListItem from './ProfileListItem.vue'
import { useHotKey } from '@/composables/useHotkey'
import { unrefElement } from '@vueuse/core'
import { useProfile } from '@/composables/useProfile'
import { SearchResult } from '@/composables/useSearch'
import { useSSH } from '@/composables/useSSH'
import { ProfileUI } from '@/types'

const search = ref('')

const profileStore = useProfile()
const hk = useHotKey()
const searchField = ref()
const resultProfiles: ComputedRef<SearchResult<ProfileUI>[]> = profileStore.filter(search)
const ssh = useSSH()

const emit = defineEmits<{
  (e: 'open', profile: ProfileUI): void
}>()

const focusSearch = (evt?: KeyboardEvent) => {
  const input = unrefElement(searchField)?.querySelector('input')
  if (input !== document.activeElement) {
    evt?.preventDefault()
    input?.focus()
  }
}

hk.on('search', focusSearch)
</script>
