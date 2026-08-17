import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Electron loads index.html via file://, so it needs relative asset paths.
  // The GitHub Pages web build is served from /AMS-CODE/, so it needs that base.
  base: process.env.ELECTRON_BUILD ? './' : '/AMS-CODE/',
  plugins: [react()],
  server: {
    host: true,
  },
})
