import { defineStore } from 'pinia'
import { SshIdentity } from '@/types'
import { computed, ComputedRef, Ref } from 'vue'
import { SearchResult, useSearch } from '@/composables/useSearch'

const { search } = useSearch()

export const useIdentityStore = defineStore('identities', {
  state: () => {
    return [] as SshIdentity[]
  },
  actions: {
    async load() {
      this.$state = await window.profiles.loadIdentities()
    },
    async retrieve(identityId: string) {
      return await window.profiles.retrieve(identityId)
    },
    filter(q: Ref<string>): ComputedRef<SearchResult<SshIdentity>[]> {
      return search(
        computed(() => this.$state ?? []),
        ['username', 'privateKey'],
        q
      )
    },
    update(identity: SshIdentity) {
      const idx = this.$state.findIndex((p) => p.id === identity.id)
      if (idx === -1) {
        this.$state.push(identity)
      } else {
        this.$state[idx] = identity
      }
      window.profiles.saveIdentity({ ...identity })
    }
  }
})
