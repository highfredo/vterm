<template>
  <q-form @submit="onSubmit">
    <div class="q-pa-md">
      <div class="q-gutter-md">
        <q-input v-model="title" outlined label="Nombre" v-bind="titleProps" />
        <q-input v-model="exe" outlined label="Executable" v-bind="exeProps" />
        <q-input v-model="args" outlined label="Arguments" v-bind="argsProps" />

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

        <q-btn type="submit">Guardar</q-btn>
        <q-btn @click="resetForm()">Reset</q-btn>
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { LocalProfile } from '@/types'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { inputConfig } from '@/utils/DefineQField'
import { watch } from 'vue'

const { profile } = defineProps<{
  profile: LocalProfile
}>()

const emit = defineEmits<{
  update: [profile: LocalProfile]
}>()

const schema = yup.object({
  title: yup.string().required(),
  exe: yup.string().required(),
  args: yup.string()
})

const { defineField, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: profile
})

watch(
  () => profile.id,
  () => resetForm({ values: profile }, { force: true })
)

const [title, titleProps] = defineField('title', inputConfig)
const [exe, exeProps] = defineField('exe', inputConfig)
const [args, argsProps] = defineField('args', inputConfig)
const [tags, tagsProps] = defineField('tags', inputConfig)

const onSubmit = handleSubmit((values) => {
  emit('update', values)
})
</script>

<style scoped lang="scss"></style>
