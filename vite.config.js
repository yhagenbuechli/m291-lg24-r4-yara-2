import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Standardwert, falls VITE_APP_TITLE in keiner .env-Datei gesetzt ist
  if (!env.VITE_APP_TITLE) process.env.VITE_APP_TITLE = 'M291-Projekt'

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
      },
    },
  }
})