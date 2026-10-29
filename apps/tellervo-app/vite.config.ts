import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tellervo/functions': fileURLToPath(new URL('../../packages/functions/src/index.ts', import.meta.url)),
      '@tellervo/supabase': fileURLToPath(new URL('../../packages/supabase/src/index.ts', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
