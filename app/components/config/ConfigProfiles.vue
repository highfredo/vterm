<template>
  <div class="row fit">
    <div class="col scroll full-height">
      <div v-if="!profile" class="row justify-center">
        <q-list style="width: 500px" padding>
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold"> Seleccione un perfil </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <ssh-config-profile
        v-else-if="profile.type === 'ssh'"
        :profile="profile as SshProfile"
        @update="profileStore.update"
      />
      <local-config-profile
        v-else-if="profile.type === 'local'"
        :profile="profile as LocalProfile"
        @update="profileStore.update"
      />
      <new-config-profile v-else-if="profile.type === ''" v-model="profile" />
    </div>

    <div class="scroll full-height" style="width: 300px; background-color: var(--q-dark)">
      <div ref="searchField" class="column">
        <div style="position: sticky; top: 0; background: var(--q-dark); z-index: 10000">
          <q-input v-model="q" class="q-mx-sm" placeholder="Buscar..." autofocus>
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <q-list style="width: 100%">
          <q-item>
            <q-btn @click="newProfile()">Nuevo perfil</q-btn>
          </q-item>
          <profile-list-item
            v-for="p in resultProfiles"
            :key="p.item.id"
            :profile="p"
            :active="p.item.id === profile?.id"
            :title="p.highlight.title ?? p.item.title"
            :subtitle="p.highlight.subtitle ?? p.item.subtitle"
            :tags="p.highlight.tags ?? p.item.tags"
            @click="open(p.item)"
          />
          <q-item v-if="!resultProfiles.length">
            <q-item-section>No se ha encontrado ningun perfil</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ComputedRef, ref } from 'vue'
import { LocalProfile, ProfileUI, Profile, SshProfile } from '@/types'
import { useProfile } from '@/composables/useProfile'
import ProfileListItem from '@/components/profile/ProfileListItem.vue'
import { SearchResult } from '@/composables/useSearch'
import SshConfigProfile from '@/components/config/SshConfigProfile.vue'
import LocalConfigProfile from '@/components/config/LocalConfigProfile.vue'
import NewConfigProfile from '@/components/config/NewConfigProfile.vue'

const profileStore = useProfile()
const q = ref('')
const profile = ref<Profile | undefined>()
const resultProfiles: ComputedRef<SearchResult<ProfileUI>[]> = profileStore.filter(q)

const open = async (p: ProfileUI) => {
  profile.value = await profileStore.retrieve(p.id)
}

const newProfile = () => {
  profile.value = {
    id: Math.random().toString(36).replace('0.', ''),
    type: '',
    title: ''
  }
}
</script>

<style scoped lang="scss"></style>
