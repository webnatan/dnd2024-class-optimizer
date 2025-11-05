import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Match your hosting subpath (e.g., GitHub Pages repo name)
  base: '/dnd2024-class-optimizer/',
})
