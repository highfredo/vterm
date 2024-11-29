import { defineStore } from 'pinia'
import { computed, ComputedRef, Ref } from 'vue'
import { SearchResult, useSearch } from '@/composables/useSearch'
import { Profile, ProfileUI } from '@/types'

const { search } = useSearch()

export const useProfile = defineStore('profiles', {
  state: () => {
    return [] as ProfileUI[]
  },
  actions: {
    async load() {
      this.$state = await window.profiles.load()
    },
    async retrieve(profileId: string): Promise<Profile> {
      return await window.profiles.retrieve(profileId)
    },
    filter(q: Ref<string>, type?: Ref<string>): ComputedRef<SearchResult<ProfileUI>[]> {
      const typeQ = type ? computed(() => ({ type: type.value })) : undefined
      return search(
        computed(() => this.$state ?? []),
        ['title', 'subtitle', 'tags'],
        q,
        typeQ
      )
    },
    async update(profile: Profile) {
      const idx = this.$state.findIndex((p) => p.id === profile.id)
      const profileUI = await window.profiles.save({ ...profile })
      if (idx === -1) {
        this.$state.push(profileUI)
      } else {
        this.$state[idx] = profileUI
      }
    }
  }
})
