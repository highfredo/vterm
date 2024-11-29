import { computed, reactive, watch } from 'vue'
import PromptDialog from '@/components/PromptDialog.vue'
import { clone } from 'lodash-es'
import HostVerifyDialog from '@/components/HostVerifyDialog.vue'
import useDialog from '@/composables/useDialog'
import { SshProfile, SshSessionStatus } from '@/types'

const status = reactive({})

watch(status, () => console.log({ ...status }))

export const useSSH = () => {
  return {
    init() {
      const dialog = useDialog()

      window.ssh.onTryKeyboard(async (profile: SshProfile, prompts: any[]) => {
        console.log(profile, prompts)
        const { payload } = await dialog(PromptDialog, { title: profile.host, prompts })
        window.ssh.tryKeyboard(profile.id, clone(payload))
      })

      window.ssh.onVerifyHostkey(async (profile: SshProfile, hostkey: Uint8Array) => {
        const {
          payload: { valid, store }
        } = await dialog(HostVerifyDialog, { title: profile.host, hostkey })
        window.ssh.verifyHostkey(profile.id, valid)

        if (store) {
          window.ssh.addToKnownHost(profile.host, hostkey)
        }
      })

      window.ssh.onStatusUpdate((sessionStatus: SshSessionStatus) => {
        if (sessionStatus.status === 'stopped' && !sessionStatus.error) {
          delete status[sessionStatus.profileId]
        } else {
          status[sessionStatus.profileId] = sessionStatus
        }
      })
    },
    status: computed(() => status)
  }
}
