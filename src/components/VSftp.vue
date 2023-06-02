<template>
  <div class="full-height force-scroll"
       @drop.prevent.stop="upload"
       @dragover.prevent.stop>
    <q-table
      card-class="bg-transparent"
      flat
      dense
      :rows="entries"
      :columns="columns"
      :title="pathRef"
      :pagination="pagination"
      :loading="loading"
      row-key="name"
      hide-pagination
      binary-state-sort
      @row-dblclick="click"
    >
      <template #top-row v-if="pathRef !== '/'">
        <q-tr class="cursor-pointer" @dblclick="goback">
          <q-td colspan="100%">
            ..
          </q-td>
        </q-tr>
      </template>
      <template #body-cell-name="props">
        <q-td :props="props">
          <q-icon :name="props.row.isDirectory ? 'folder' : 'description'"></q-icon>
          <span class="q-ml-md">{{props.value}}</span>
        </q-td>
      </template>
      <template #body-cell-permissions="props">
        <q-td :props="props">
          <code>{{props.value}}</code>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { useSFTP } from 'src/composables/useSFTP'
import { ref, watch } from 'vue'
import { ProfileParams } from 'src/types'
import { SFTPFile } from 'app/src-electron/ssh/SFTPClient'
import { join } from 'path-browserify'
import { date, format } from 'quasar'
import { useSFTPTransfer } from 'src/composables/useSFTPTransfers';
const { humanStorageSize } = format
const { formatDate } = date

const props = defineProps<{
  profile: ProfileParams,
}>()

const pagination = {
  rowsPerPage: 0,
  sortBy: 'name'
}

const columns = [
  { name: 'name', label: 'Nombre' },
  { name: 'size', label: 'Tamaño', format: v => humanStorageSize(v) },
  { name: 'mtime', label: 'Fecha Modificación', format: v => formatDate(v, 'DD/MM/YYYY HH:mm') },
  { name: 'permissions', label: 'Permisos' },
].map((e: any) => {
  return {
    ...e,
    field: e.name,
    align: 'left',
    sortable: true,
  }
})

const sftp = useSFTP(props.profile.id)
const transfers = useSFTPTransfer()
transfers.init()

const pathRef = ref('.')
const {loading, entries, error, refresh} = sftp.readdir(pathRef)
watch(loading, (e) => console.log('loading', e))

const click = (evt: Event, fileEntry: SFTPFile) => {
  const fullpath = join(fileEntry.path, fileEntry.name)
  if(fileEntry.isDirectory) {
    pathRef.value = fullpath
  } else {
    window.ssh.download(props.profile.id, fullpath)
  }
}

const goback = () => {
  pathRef.value = join(pathRef.value, '../')
}

const upload = (evt) => {
  for (const { path } of evt.dataTransfer.files) {
    console.log('File Path of dragged files: ', path)
    window.ssh.upload(props.profile.id, path, join(pathRef.value, path.replace(/^.*[\\\/]/, '')))
  }
}

</script>

<style scoped lang="scss">

</style>
