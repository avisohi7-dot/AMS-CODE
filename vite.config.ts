import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/AMS-CODE/',
  plugins: [react()],
  server: {
    host: true,
  },
})
