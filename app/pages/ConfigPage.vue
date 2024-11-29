<template>
  <div class="row fit">
    <div class="scroll full-height" style="width: 220px; background-color: var(--q-dark)">
      <q-list style="width: 100%">
        <q-item v-ripple :active="section === 'perfiles'" clickable @click="section = 'perfiles'">
          <q-item-section avatar>
            <q-icon name="link" />
          </q-item-section>
          <q-item-section>Perfiles</q-item-section>
        </q-item>
        <q-item v-ripple :active="section === 'identity'" clickable @click="section = 'identity'">
          <q-item-section avatar>
            <q-icon name="groups" />
          </q-item-section>
          <q-item-section>Identidades</q-item-section>
        </q-item>
        <q-item v-ripple clickable @click="openConfig">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Abrir fichero configuración</q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="col scroll full-height">
      <template v-if="section === 'perfiles'">
        <config-profiles />
      </template>
      <template v-else-if="section === 'identity'">
        <ssh-config-identities />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfigProfiles from '@/components/config/ConfigProfiles.vue'
import SshConfigIdentities from '@/components/config/SshConfigIdentities.vue'

const section = ref('perfiles')

const openConfig = () => {
  window.wincontrol.openConfigDir()
}
</script>

<style scoped lang="scss"></style>
