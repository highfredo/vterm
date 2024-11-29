<template>
  <div class="row fit">
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
          <profile-list-item
            v-for="p in resultProfiles"
            :key="p.item.id"
            :active="p.item.id === profile?.id"
            :title="p.highlight.title ?? p.item.title"
            :subtitle="p.highlight.subtitle ?? p.item.subtitle"
            :tags="p.highlight.tags ?? p.item.tags"
            @click="profileId = p.item.id"
          />
          <q-item v-if="!resultProfiles.length">
            <q-item-section>No se ha encontrado ninguna sesión</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <div class="col scroll full-height">
      <div class="row justify-center">
        <q-list style="width: 500px" padding>
          <q-item v-if="!profile">
            <q-item-section>
              <q-item-label class="text-weight-bold"> Seleccione un perfil </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-else-if="!profile.tunnels || profile.tunnels.length === 0">
            <q-item-section>
              <q-item-label class="text-weight-bold"> Perfil sin tuneles </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            v-for="(tunnel, idxt) in profileStatus?.tunnels || profile.tunnels"
            v-else
            :key="idxt"
            class="q-my-md"
          >
            <q-item-section top avatar>
              <q-avatar color="primary" text-color="white" icon="computer" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ tunnel.description }}</q-item-label>
              <q-item-label>
                {{ `${tunnel.localHost}:${tunnel.localPort}` }}
                <q-icon name="arrow_right_alt" />
                {{ `${tunnel.remoteHost}:${tunnel.remotePort}` }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-btn
                v-if="tunnel.status === 'stopped' || !tunnel.status"
                @click="addTunnel(profile.id, tunnel)"
              >
                start
              </q-btn>
              <q-btn
                v-else-if="tunnel.status === 'started'"
                @click="removeTunnel(profile.id, tunnel)"
              >
                stop
              </q-btn>
              <q-btn v-else loading>start</q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, Ref, ref } from 'vue'
import { SshLocalTunnel, ProfileUI, SshProfile } from '@/types'
import { clone } from 'lodash-es'
import { useProfile } from '@/composables/useProfile'
import ProfileListItem from '@/components/profile/ProfileListItem.vue'
import { SearchResult } from '@/composables/useSearch'
import { useSSH } from '@/composables/useSSH'
import { computedAsync } from '@vueuse/core'

const profileStore = useProfile()
const q = ref('')
const profileId = ref()
const resultProfiles: ComputedRef<SearchResult<ProfileUI>[]> = profileStore.filter(
  q,
  ref('ssh')
) as ComputedRef<SearchResult<ProfileUI>[]>

const profile: Ref<SshProfile | undefined> = computedAsync(async () => {
  if (!profileId.value) return
  return (await profileStore.retrieve(profileId.value)) as SshProfile
})

const ssh = useSSH()
const profileStatus = computed(() => {
  if (!profileId.value) return
  return ssh.status.value[profileId.value]
})

const addTunnel = async (profileId: string, tunnel: SshLocalTunnel) => {
  window.ssh.addTunnel(profileId, clone(tunnel))
}

const removeTunnel = async (profileId: string, tunnel: SshLocalTunnel) => {
  window.ssh.removeTunnel(profileId, clone(tunnel))
}
</script>

<style scoped lang="scss"></style>
