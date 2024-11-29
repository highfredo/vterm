<template>
  <q-item class="q-my-md">
    <q-item-section top avatar>
      <q-avatar color="primary" text-color="white" icon="computer" />
    </q-item-section>

    <q-item-section>
      <q-input v-model="description" outlined label="Descripción" v-bind="descriptionProps" dense />
      <div class="row q-gutter-x-md">
        <div class="col-9">
          <q-input v-model="localHost" outlined label="local host" v-bind="localHostProps" dense />
        </div>
        <div class="col">
          <q-input v-model="localPort" outlined label="local port" v-bind="localPortProps" dense />
        </div>
      </div>
      <div class="row q-gutter-x-md">
        <div class="col-9">
          <q-input
            v-model="remoteHost"
            outlined
            label="remote host"
            v-bind="remoteHostProps"
            dense
          />
        </div>
        <div class="col">
          <q-input
            v-model="remotePort"
            outlined
            label="remote port"
            v-bind="remotePortProps"
            dense
          />
        </div>
      </div>
    </q-item-section>

    <q-item-section top avatar @click="emit('delete')">
      <q-btn color="primary" text-color="negative" icon="delete" fab-mini />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { PublicFormContextKey } from 'vee-validate'
import { inputConfig } from '@/utils/DefineQField'

const { formPath } = defineProps<{
  formPath: string
}>()

const emit = defineEmits<{
  delete: [e: void]
}>()

const form = inject(PublicFormContextKey)
if (!form) throw new Error('no form found')

const [description, descriptionProps] = form.defineField(`${formPath}.description`, inputConfig)
const [localHost, localHostProps] = form.defineField(`${formPath}.localHost`, inputConfig)
const [localPort, localPortProps] = form.defineField(`${formPath}.localPort`, inputConfig)
const [remoteHost, remoteHostProps] = form.defineField(`${formPath}.remoteHost`, inputConfig)
const [remotePort, remotePortProps] = form.defineField(`${formPath}.remotePort`, inputConfig)
</script>

<style scoped lang="scss"></style>
