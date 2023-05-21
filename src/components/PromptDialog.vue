<template>
  <q-dialog ref="dialogRef" seamless @hide="onDialogHide">
    <q-card class="prompt-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <form @submit.prevent="onDialogOK(responses)">
        <q-card-section>
          <div
            v-for="(prompt, idx) in prompts"
            :key="idx"
          >
            <q-input
              v-if="prompt.echo"
              v-model="responses[idx]"
              filled
              :label="prompt.prompt"
            />
            <v-input-password
              v-else
              v-model="responses[idx]"
              filled
              :label="prompt.prompt"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn type="submit" flat>OK</q-btn>
        </q-card-actions>
      </form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Prompt } from 'ssh2'
import { ref } from 'vue'
import VInputPassword from 'components/VInputPassword.vue'
import { useDialogPluginComponent } from 'quasar'

const props = withDefaults(defineProps<{
  title: string,
  prompts: Prompt[],
}>(), {})

const responses = ref<string[]>([])

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

</script>

<style scoped lang="scss">
.prompt-card {
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
