import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // No `server.proxy` needed — in dev mode Vite runs inside Express as middleware,
  // so /api requests are handled directly by Express (same origin, same port).
})
