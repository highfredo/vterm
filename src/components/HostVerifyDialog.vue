<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" seamless>
    <q-card class="host-verify-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">HostKey Verify</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="q-mb-lg text-center">
          <code>
            {{fingerprint}}
          </code>
        </div>

        <div class="fit row wrap justify-end items-start content-start">
          <q-checkbox
            label="Guardar"
            left-label
            v-model="storeRef"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn @click="onDialogOK({valid: false, store: storeRef})" flat>Cancel</q-btn>
        <q-btn @click="onDialogOK({valid: true, store: storeRef})" flat>OK</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { computedAsync } from '@vueuse/core'

const props = withDefaults(defineProps<{
  hostkey: Uint8Array,
}>(), {})

defineEmits([
  ...useDialogPluginComponent.emits
])


const storeRef = ref(false)

const fingerprint = computedAsync(async () => {
  const hash = await crypto.subtle.digest('SHA-256', props.hostkey)
  return 'SHA256:' + btoa(String.fromCharCode(...new Uint8Array(hash)))
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

</script>

<style scoped lang="scss">
.host-verify-card {
  width: 100%;
  position: absolute;
  left: 0;
  right: 0;
  top: 30%;
  margin: auto;
  z-index: 100;
}
</style>
