import {defineStore} from 'pinia';
import { ProfileParams } from 'src/types'
import { computed, ComputedRef, Ref } from 'vue'
import { SearchResult, useSearch } from 'src/composables/useSearch'

const { search } = useSearch()

export const useProfileStore = defineStore('profiles', {
  state: () => {
    return [] as ProfileParams[]
  },
  actions: {
    async load() {
      this.$state = await window.profiles.load()
    },
    filter(q: Ref<string>, type?: Ref<string>): ComputedRef<SearchResult<ProfileParams>[]> {
      const typeQ = type ? computed(() => ({type: type.value})) : undefined
      return search(computed(() => this.$state ?? []), ['title', 'subtitle', 'tags'], q, typeQ)
    },
    update(profile: ProfileParams) {
      const idx = this.$state.findIndex(p => p.id === profile.id)
      if(idx === -1) {
        this.$state.push(profile)
      } else {
        this.$state[idx] = profile
      }
    }
  }
})
