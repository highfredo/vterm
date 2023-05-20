<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" seamless>
    <q-card class="paste-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Va a pegar texto con saltos de linea</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          filled
          type="textarea"
          label="Texto"
          v-model="txtRef"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn @click="onDialogCancel" flat>Cancel</q-btn>
        <q-btn @click="onDialogOK(txtRef)" flat>OK</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'

const props = withDefaults(defineProps<{
  txt: string,
}>(), {})

const txtRef = ref(props.txt)

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

</script>

<style scoped lang="scss">
.paste-card {
  width: 100%;
  max-width: 400px;

  position: absolute;
  left: 0;
  right: 0;
  top: 30%;
  margin: auto;
  z-index: 100;
}
</style>
