import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const shouldGenerateSourcemap = env.VITE_DISABLE_SOURCEMAPS !== 'true'

  return {
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
