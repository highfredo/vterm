<template>
  <q-form @submit="onSubmit">
    <div class="q-pa-md">
      <div class="q-gutter-y-md">
        <q-input v-model="title" outlined label="Name" v-bind="titleProps" />

        <div class="row q-gutter-x-md">
          <div class="col-3">
            <q-select
              v-model="authMethod"
              label="Auth Method"
              outlined
              input-debounce="0"
              :options="['userpass', 'privateKey']"
            />
          </div>
          <div class="col" v-if="authMethod === 'privateKey'">
            <q-input v-model="privateKey" outlined label="Key path" v-bind="privateKeyProps" />
          </div>
        </div>
        <div class="row q-gutter-x-md" v-if="authMethod === 'userpass'">
          <div class="col">
            <q-input outlined label="Username" v-model="username" v-bind="usernameProps" />
          </div>
          <div class="col">
            <v-input-password outlined label="Password" v-model="password" v-bind="passwordProps" />
          </div>
        </div>
      </div>
    </div>

    <q-btn type="submit">Guardar</q-btn>
    <q-btn @click="resetForm()">Reset</q-btn>
  </q-form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { SshIdentity } from '@/types'
import VInputPassword from '@/components/VInputPassword.vue'
import { inputConfig } from '@/utils/DefineQField'
import { ref, watch } from 'vue'
import { useIdentityStore } from '@/composables/useIdentityStore'

const { identity } = defineProps<{
  identity: SshIdentity
}>()

const identityStore = useIdentityStore()

const calcAuthMethod = () => {
  if (identity.privateKey) return 'privateKey'
  else return 'userpass'
}

const authMethod = ref(calcAuthMethod())
watch(
  () => identity,
  () => {
    resetForm({ values: identity }, { force: true })
    authMethod.value = calcAuthMethod()
  }
)

const { defineField, handleSubmit, resetForm } = useForm({
  initialValues: identity
})

const onSubmit = handleSubmit((values) => {
  identityStore.update(values)
  resetForm({ values }, { force: true })
})

const [title, titleProps] = defineField('title', inputConfig)
const [username, usernameProps] = defineField('username', inputConfig)
const [password, passwordProps] = defineField('password', inputConfig)
const [privateKey, privateKeyProps] = defineField('privateKey', inputConfig)
</script>

<style scoped lang="scss"></style>
