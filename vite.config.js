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
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            '@mui/material',
            '@emotion/react',
            '@emotion/styled'
          ],
          'editor': ['@uiw/react-md-editor'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    // Ensure proper MIME types
    manifest: true,
    // Generate source maps for better debugging
    sourcemap: true,
    // Increase the warning limit for chunk sizes
    chunkSizeWarningLimit: 1000
  }
})
