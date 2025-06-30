import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Otimizações de build
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['src/utils/performance.js', 'src/utils/dataValidator.js'],
          hooks: ['src/hooks/useDebounce.js', 'src/hooks/useVirtualTable.js', 'src/hooks/useOptimizedFilters.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  // Alias para imports mais limpos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  
  // Configurações de desenvolvimento
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Otimizações de dependências
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  
  // Configurações CSS
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@styles/_variables.scss";
          @import "@styles/_mixins.scss";
        `
      }
    }
  },
  
  // Performance hints
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})