import { fileURLToPath } from 'node:url'
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('electron')
      }
    },
    plugins: [externalizeDepsPlugin({ exclude: ['electron-store'] })]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload.ts')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('electron')
      }
    },
    plugins: [externalizeDepsPlugin({ exclude: ['electron-store'] })]
  },
  renderer: {
    root: './app',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, './app/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('app')
      }
    },
    plugins: [
      vue({
        template: { transformAssetUrls }
      }),
      quasar({
        sassVariables: fileURLToPath(new URL('./app/css/quasar.variables.scss', import.meta.url))
      })
    ]
  }
})
