import {defineStore} from 'pinia';
import { ProgressInfo } from 'app/src-electron/ssh/SFTPClient';


let inited = false

export const useSFTPTransfer = defineStore('sftp-transfers', {
  state: () => {
    return { } as Record<string, ProgressInfo[]>
  },
  actions: {
    async init() {
      if(inited)
        return
      inited = true

      window.ssh.onTransfer((profileId: string, progress: ProgressInfo[]) => {
        console.log(progress)
        this.$state[profileId] = progress
      })
    }
  }
})
