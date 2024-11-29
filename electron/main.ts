import { app } from 'electron'
import os from 'os'
import { restoreOrCreateWindow } from './MainWindow'
import { ConfigStore } from './config/ConfigStore'
import { is, optimizer } from '@electron-toolkit/utils'
import './SecurityRestriction'

// Import VShell functionalities
import './shell/ShellMain'
import './ssh/SSHMain'
import './config/ConfigMain'
import './control/WindowControlMain'
import './profiles/ProfilesMain'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()
/**
 * Prevent multiple instances
 */
const isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}
app.on('second-instance', restoreOrCreateWindow)

/**
 * Disable GPU Acceleration for Windows 7
 */
const config = ConfigStore().get()
const enableHardwareAcceleration: boolean = config.enableHardwareAcceleration
if (!enableHardwareAcceleration || os.release().startsWith('6.1')) {
  app.disableHardwareAcceleration()
}

/**
 * Set application name for Windows 10+ notifications
 */
if (platform === 'win32') {
  app.setAppUserModelId(app.getName())
}

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

/**
 * @see https://www.electronjs.org/docs/v14-x-y/api/app#event-activate-macos Event: 'activate'
 */
app.on('activate', restoreOrCreateWindow)

/**
 * Create app window when background process will be ready
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch((e) => console.error('Failed create window:', e))

/**
 * Install Vue.js or some other devtools in development mode only
 */
app
  .whenReady()
  .then(() => {
    if (!is.dev) return
    import('electron-devtools-installer')
      .then((devInstaller) => {
        devInstaller
          .default(devInstaller.VUEJS_DEVTOOLS)
          .then((name) => console.log(`Added Extension:  ${name}`))
          .catch((err) => console.log('An error occurred: ', err))
      })
      .catch((err) => console.log('An error occurred: ', err))
  })
  .catch((err) => console.log('An error occurred: ', err))

app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window)
})

// Catch errors
process.on('uncaughtException', (error) => {
  console.error('uncaughtException:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection:', error)
})

/**
 * Check new app version in production mode only
 */
// if (import.meta.env.PROD) {
//   app.whenReady()
//     .then(() => import('electron-updater'))
//     .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
//     .catch((e) => console.error('Failed check updates:', e));
// }
