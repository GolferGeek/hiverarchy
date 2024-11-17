import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  assetsInclude: ['**/*.md'],
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    // Ensure proper MIME types
    manifest: true,
    // Generate source maps for better debugging
    sourcemap: true
  }
})
