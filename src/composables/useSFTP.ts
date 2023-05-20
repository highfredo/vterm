import { FileEntry } from 'ssh2'
import { ref, Ref } from 'vue'
import { watchTriggerable } from '@vueuse/core'

export type Files = {
  loading: boolean
  entries: FileEntry[] | undefined
}

export type ReaddirResult = {
  loading: Ref<boolean>
  error: Ref<any>
  entries: Ref<FileEntry[]>
  refresh: () => void
}

export const useSFTP = (profileId: string) => {
  const cache: Record<string, FileEntry[]> = {}

  return {
    readdir(path: Ref<string>): ReaddirResult {
      const loading = ref(true)
      const error = ref()
      const entries: Ref<FileEntry[]> = ref<FileEntry[]>([])

      const { trigger } = watchTriggerable(path, async (p: string, _, onCleanup) => {
        let canceled = false
        onCleanup(() => canceled = true)


        loading.value = true
        error.value = undefined
        entries.value = cache[p] ?? []

        try {
          const fileEntries = await window.ssh.readdir(profileId, p)
          if(canceled) return
          entries.value = fileEntries
          cache[p] = fileEntries
        } catch (err) {
            if(canceled) return
            error.value = err
        }

        if(canceled) return
        loading.value = false
      }, {immediate: true})

      return {
        loading,
        error,
        entries,
        refresh: trigger
      }
    }
  }
}
