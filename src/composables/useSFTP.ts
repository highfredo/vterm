import { ref, Ref } from 'vue'
import { watchTriggerable } from '@vueuse/core'
import { SFTPFile } from 'app/src-electron/ssh/SFTPClient'

export type ReaddirResult = {
  loading: Ref<boolean>
  error: Ref<any>
  entries: Ref<SFTPFile[]>
  refresh: () => void
}

export const useSFTP = (profileId: string) => {
  const cache: Record<string, SFTPFile[]> = {}

  return {
    async realpath(path: string): Promise<string> {
      return await window.ssh.realpath(profileId, path)
    },
    readdir(path: Ref<string>): ReaddirResult {
      const loading = ref(true)
      const error = ref()
      const entries: Ref<SFTPFile[]> = ref<SFTPFile[]>([])

      const { trigger, ignoreUpdates } = watchTriggerable(path, async (p: string, _, onCleanup) => {
        let canceled = false
        onCleanup(() => canceled = true)


        loading.value = true
        error.value = undefined

        try {
          if(!path.value.startsWith('/')) {
            await new Promise(resolve => {
              window.ssh.realpath(profileId, path.value).then((p: string) => {
                ignoreUpdates(() => {
                  path.value = p
                  resolve(undefined)
                })
              })
            })
          }

          if(!path.value.endsWith('/')) {
            ignoreUpdates(() => {
              path.value += '/'
            })
          }

          entries.value = cache[path.value] || []

          const fileEntries = await window.ssh.readdir(profileId, path.value)
          if(canceled) return
          entries.value = fileEntries
          cache[path.value] = fileEntries
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
