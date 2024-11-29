<template>
  <div class="row fit">
    <div class="col scroll full-height">
      <div v-if="!identity" class="row justify-center">
        <q-list style="width: 500px" padding>
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold"> Seleccione una identidad </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div v-else>
        <ssh-config-identity :identity="identity" />
      </div>
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
            <q-btn @click="newIdentity()">Nuevo perfil</q-btn>
          </q-item>
          <q-item
            v-for="p in resultIdentities"
            :active="p.item.id == identity?.id"
            :key="p.item.id"
            v-ripple
            clickable
            @click="open(p.item)"
          >
            <q-item-section class="q-py-sm">
              <q-item-label class="ellipsis">
                <span>{{ p.item.title ?? p.item.id }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="!resultIdentities.length">
            <q-item-section>No se ha encontrado ninguna identidad</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ComputedRef, ref } from 'vue'
import { SshIdentity } from '@/types'
import { SearchResult } from '@/composables/useSearch'
import { useIdentityStore } from '@/composables/useIdentityStore'
import SshConfigIdentity from '@/components/config/SshConfigIdentity.vue'

const identityStore = useIdentityStore()
identityStore.load()
const q = ref('')
const identity = ref<SshIdentity | undefined>()
const resultIdentities: ComputedRef<SearchResult<SshIdentity>[]> = identityStore.filter(q)

const open = async (p: SshIdentity) => {
  identity.value = p
}

// Hacer id un id 'humano'?
const newIdentity = () => {
  identity.value = {
    id: Math.random().toString(36).replace('0.', '')
  }
}
</script>

<style scoped lang="scss"></style>
