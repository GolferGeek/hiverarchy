import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const shouldGenerateSourcemap = env.VITE_DISABLE_SOURCEMAPS !== 'true'
  
  // Check if we're running in hierarchy-local mode (port 4021)
  const isHierarchyLocal = process.env.HIERARCHY_LOCAL === 'true'
  
  return {
    plugins: [react()],
    base: '/',
    assetsInclude: ['**/*.md'],
    server: {
      port: isHierarchyLocal ? 4021 : 3000, // Use port 4021 for hierarchy mode, 3000 as default
      strictPort: true, // Don't fallback to another port
      fs: {
        // Allow serving files from the project root
        allow: ['..']
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: shouldGenerateSourcemap,
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
      manifest: true,
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      exclude: ['js-big-decimal']
    }
  }
})
