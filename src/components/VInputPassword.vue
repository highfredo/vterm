<template>
  <q-input :type="isPwd ? 'password' : 'text'">
    <template v-slot:append>
      <q-icon
        :name="isPwd ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="isPwd = !isPwd"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isPwd = ref(true)
</script>
