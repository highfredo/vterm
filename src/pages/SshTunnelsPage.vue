<template>
  <div class="row fit">
    <div class="scroll" style="width: 300px; height: 100%; background-color: var(--q-dark)" >
      <div class="column" ref="searchField">
        <q-input
          class="q-mx-sm"
          v-model="q"
          placeholder="Buscar..."
          autofocus
        >
          <template v-slot:append>
            <q-icon name="search"/>
          </template>
        </q-input>
        <q-list style="width: 100%">
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
            <q-item-section>No se ha encontrado ninguna sesión</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <div class="col">
      <div class="row justify-center">
        <q-list style="width: 500px" padding>
          <q-item v-if="!profile">
            <q-item-section>
              <q-item-label class="text-weight-bold">
                Seleccione un perfil
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-else-if="!profile.tunnels || profile.tunnels.length === 0">
            <q-item-section>
              <q-item-label class="text-weight-bold">
                Perfil sin tuneles
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-else :key="idxt" v-for="(tunnel, idxt) in profile.tunnels">
            <q-separator v-if="idxt !== 0" spaced inset="item" />

            <q-item-section top avatar>
              <q-avatar color="primary" text-color="white" icon="computer" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{tunnel.description}}</q-item-label>
              <q-item-label>
                {{`${tunnel.localHost}:${tunnel.localPort}` }}
                <q-icon name="arrow_right_alt" />
                {{ `${tunnel.remoteHost}:${tunnel.remotePort}` }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-btn v-if="tunnel.status === 'stopped'" @click="addTunnel(profile.id, tunnel)">start</q-btn>
              <q-btn v-else-if="tunnel.status === 'started'" @click="removeTunnel(profile.id, tunnel)">stop</q-btn>
              <q-btn v-else loading>start</q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, ref } from 'vue'
import { ProfileParams, SshProfileInfo, SshTunnelParams } from 'src/types'
import { clone } from 'lodash-es'
import { useProfileStore } from 'src/composables/useProfileStore'
import ProfileListItem from 'components/profile/ProfileListItem.vue'
import { SearchResult } from 'src/composables/useSearch'

const profileStore = useProfileStore()
const q = ref('')
const profileId = ref()
const resultProfiles: ComputedRef<SearchResult<ProfileParams>[]> = profileStore.filter(q, ref('ssh'))
const profile: ComputedRef<SshProfileInfo | undefined> =
  computed(() => resultProfiles.value.find(p => p.item.id === profileId.value)?.item)

const open = (p) => {
  profileId.value = p.id
}

const addTunnel = async (profileId: string, tunnel: SshTunnelParams) => {
  window.ssh.addTunnel(profileId, clone(tunnel))
}

const removeTunnel = async (profileId: string, tunnel: SshTunnelParams) => {
  window.ssh.removeTunnel(profileId, clone(tunnel))
}
</script>

<style scoped lang="scss">


</style>
