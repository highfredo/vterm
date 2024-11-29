<template>
  <div style="position: sticky; top: 0; background: var(--q-dark-page); z-index: 10000">
    <q-tabs v-model="tab" dense>
      <q-tab name="general" label="General" />
      <q-tab name="tunnels" label="Tuneles" />
    </q-tabs>
    <q-separator />
  </div>

  <q-form @submit="onSubmit">
    <q-tab-panels v-model="tab" class="transparent">
      <q-tab-panel name="general">
        <div class="q-pa-md">
          <div class="q-gutter-y-md">
            <q-input v-model="title" outlined label="Nombre" v-bind="titleProps" />
            <q-select
              v-model="tags"
              label="Tags"
              outlined
              use-input
              use-chips
              multiple
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
              v-bind="tagsProps"
            />
            <div class="row q-gutter-x-md">
              <div class="col-9">
                <q-input outlined label="Host" v-model="host" v-bind="hostProps" />
              </div>
              <div class="col">
                <q-input
                  outlined
                  v-model.number="port"
                  label="Port"
                  type="number"
                  v-bind="portProps"
                />
              </div>
            </div>
            <q-select
              v-model="jumpProfile"
              v-bind="jumpProfileProps"
              label="Máquina de salto"
              outlined
              input-debounce="0"
              use-input
              :options="profiles"
              emit-value
              map-options
              :option-label="(j) => j.item.title"
              :option-value="(j) => j.item.id"
              @filter="filterJumphostProfiles"
            >
              <template #option="{ opt, itemProps }">
                <profile-list-item
                  v-bind="itemProps"
                  :title="opt.highlight.title ?? opt.item.title"
                  :subtitle="opt.highlight.subtitle ?? opt.item.subtitle"
                  :tags="opt.highlight.tags ?? opt.item.tags"
                />
              </template>
            </q-select>
            <div class="row q-gutter-x-md">
              <div class="col-3">
                <q-select
                  v-model="authMethod"
                  label="Auth Method"
                  outlined
                  input-debounce="0"
                  :options="['identity', 'userpass', 'privateKey']"
                />
              </div>
              <div class="col" v-if="authMethod === 'identity'">
                <q-select
                  v-model="identity"
                  label="Identidad"
                  outlined
                  input-debounce="0"
                  :options="identityStore.$state"
                  :option-label="(i) => i.title ?? i.id"
                  option-value="id"
                  v-bind="identityProps"
                  emit-value
                  map-options
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
                <v-input-password
                  outlined
                  label="Password"
                  v-model="password"
                  v-bind="passwordProps"
                />
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel name="tunnels">
        <q-list dense style="min-width: 100px">
          <template v-for="(field, idx) in tunnelFields" :key="field.key">
            <ssh-config-profile-tunnel :form-path="`tunnels[${idx}]`" @delete="removeTunnel(idx)" />
            <q-separator />
          </template>
        </q-list>
        <q-btn @click="addTunnel({})" class="text-weight-bold"> Nuevo tunel </q-btn>
      </q-tab-panel>
    </q-tab-panels>

    <q-btn type="submit">Guardar</q-btn>
    <q-btn @click="resetForm()">Reset</q-btn>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import * as yup from 'yup'
import { useFieldArray, useForm } from 'vee-validate'
import { inputConfig } from '@/utils/DefineQField'
import ProfileListItem from '@/components/profile/ProfileListItem.vue'
import { useProfile } from '@/composables/useProfile'
import { SshProfile } from '@/types'
import SshConfigProfileTunnel from '@/components/config/SshConfigProfileTunnel.vue'
import VInputPassword from '@/components/VInputPassword.vue'
import { useIdentityStore } from '@/composables/useIdentityStore'

const { profile } = defineProps<{
  profile: SshProfile
}>()

const emit = defineEmits<{
  update: [profile: SshProfile]
}>()

const calcAuthMethod = () => {
  if (profile.identity) return 'identity'
  else if (profile.privateKey) return 'privateKey'
  else return 'userpass'
}

const tab = ref('general')
const authMethod = ref(calcAuthMethod())

const schema = yup.object({
  title: yup.string().required(),
  host: yup.string().required(),
  port: yup.number().min(1).max(65535),
  tunnels: yup.array(
    yup.object().shape({
      description: yup.string().required(),
      localHost: yup.string().required(),
      localPort: yup.number().min(1).max(65535).required(),
      remoteHost: yup.string().required(),
      remotePort: yup.number().min(1).max(65535).required()
    })
  )
})

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: profile
})

const { remove: removeTunnel, push: addTunnel, fields: tunnelFields } = useFieldArray('tunnels')

watch(
  () => profile,
  () => {
    resetForm({ values: profile }, { force: true })
    authMethod.value = calcAuthMethod()
  }
)

const [title, titleProps] = defineField('title', inputConfig)
const [tags, tagsProps] = defineField('tags', inputConfig)
const [host, hostProps] = defineField('host', inputConfig)
const [port, portProps] = defineField('port', inputConfig)
const [username, usernameProps] = defineField('username', inputConfig)
const [password, passwordProps] = defineField('password', inputConfig)
const [jumpProfile, jumpProfileProps] = defineField('jumpProfile', inputConfig)
const [identity, identityProps] = defineField('identity', inputConfig)
const [privateKey, privateKeyProps] = defineField('privateKey', inputConfig)

const onSubmit = handleSubmit((values) => {
  emit('update', values)
  resetForm({ values }, { force: true })
})

const profileStore = useProfile()
const identityStore = useIdentityStore()
identityStore.load()
console.log('AQUI!!!!', identityStore.$state)
const profileFilter = ref('')
const profiles = profileStore.filter(profileFilter)
const filterJumphostProfiles = (inputValue: string, doneFn) => {
  profileFilter.value = inputValue
  doneFn()
}
</script>

<style scoped lang="scss"></style>
