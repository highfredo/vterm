<template>
  <transition
    enter-active-class="animated slideInDown"
    leave-active-class="animated slideOutUp"
  >
    <q-card
      v-if="showSearch"
      class="search-container bg-primary q-px-sm">
      <q-input
        ref="searchField"
        v-model="searchQuery"
        autofocus
        borderless
        placeholder="Buscar..."
        hide-bottom-space
        @keyup.enter.exact.prevent="findNext"
        @keyup.enter.shift.exact.prevent="findPrevious"
      >
        <template #append>
          <span class="text-subtitle2">{{searchInfo}}</span>
        </template>
      </q-input>
    </q-card>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VTerm } from 'src/composables/useVTerm'
import { ISearchOptions } from 'xterm-addon-search'
import { useHotKey } from 'src/composables/useHotkey'
import { unrefElement } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { IBaseShellHandler } from 'src/types'

const props = defineProps<{
  vterm: VTerm<IBaseShellHandler>
}>()

const showSearch = ref(false)
const searchQuery = ref('')
const searchFound = ref(false)
const searchInfo = ref('')
const searchField = ref()
const hotkey = useHotKey()
const $q = useQuasar()

const searchOptionsObj: ISearchOptions = {
  decorations: {
    matchBackground: '#888888',
    matchOverviewRuler: '#888888',
    activeMatchBackground: '#fff200',
    activeMatchColorOverviewRuler: '#fff200',
  }
}

const findNext = () => {
  // searchHistory.value.value.push(searchQuery.value)
  searchFound.value = props.vterm.search.findNext(searchQuery.value, searchOptionsObj)
  if(!searchFound.value) {
    $q.notify('No hay resultados')
  }
}

const findPrevious = () => {
  // searchHistory.value.value.push(searchQuery.value)
  searchFound.value = props.vterm.search.findPrevious(searchQuery.value, searchOptionsObj)
  if(!searchFound.value) {
    $q.notify('No hay resultados')
  }
}

const hideSearchBar = () => {
  showSearch.value = false
  searchQuery.value = ''
  props.vterm.search.clearDecorations()
  props.vterm.search.clearActiveDecoration()
}

// Clear decorations!
type Result = {
  resultIndex: number
  resultCount: number
}
props.vterm.search.onDidChangeResults(({ resultIndex, resultCount }: Result) => {
  if(resultCount < 0) {
    searchInfo.value = searchQuery.value ? '+1k' : ''
  } else {
    searchInfo.value = `${resultIndex+1}/${resultCount}`
  }
})

hotkey.on('search', () => {
  console.log('search!')
  if(showSearch.value) {
    const input = unrefElement(searchField)?.querySelector('input')
    if(input !== document.activeElement) {
      input?.focus()
    }
  } else {
    searchQuery.value = props.vterm.terminal.getSelection()
    showSearch.value = true
  }
})

hotkey.register('esc-search-dialog', ['esc'], props.vterm.terminal.element)

const escCtrl = hotkey.on('esc-search-dialog', hideSearchBar)
escCtrl?.stop()

watch(showSearch, (show: boolean) => {
  if(show) {
    escCtrl?.start()
  } else {
    escCtrl?.stop()
    props.vterm.terminal.focus()
  }
})

</script>

<style scoped lang="scss">
.search-container {
  position: absolute;
  z-index: 100;
  right: 20px;
  top: 10px;
}
</style>
