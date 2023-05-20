<template>
  <div class="column" ref="searchField">
    <q-input
      outlined
      v-model="search"
      placeholder="Buscar..."
      autofocus
    >
      <template v-slot:append>
        <q-icon name="search"/>
      </template>
    </q-input>
    <q-list style="width: 100%">
      <profile-list-item
        v-for="rst in resultProfiles"
        :key="rst.item.id"
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
import { ProfileParams } from 'src/types';
import ProfileListItem from './ProfileListItem.vue';
import { useHotKey } from 'src/composables/useHotkey'
import { unrefElement } from '@vueuse/core'
import { useProfileStore } from 'src/composables/useProfileStore'
import { SearchResult } from 'src/composables/useSearch'

const search = ref('')

const profileStore = useProfileStore()
const hk = useHotKey()
const searchField = ref()
const resultProfiles: ComputedRef<SearchResult<ProfileParams>[]> = profileStore.filter(search)

const emit = defineEmits<{
  (e: 'open', profile: ProfileParams): void
}>()

const focusSearch = (evt?: KeyboardEvent) => {
  const input = unrefElement(searchField)?.querySelector('input')
  if(input !== document.activeElement) {
    evt?.preventDefault()
    input?.focus()
  }
}

hk.on('search', focusSearch)
</script>
