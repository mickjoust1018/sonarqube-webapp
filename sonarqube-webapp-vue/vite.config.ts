import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~shared': resolve(__dirname, 'src/libs/shared'),
      '~commons': resolve(__dirname, 'src/libs/commons'),
      '~api': resolve(__dirname, 'src/libs/commons/api'),
      '~types': resolve(__dirname, 'src/libs/commons/types'),
      '~components': resolve(__dirname, 'src/libs/commons/components'),
      '~utils': resolve(__dirname, 'src/libs/shared/utils'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.PROXY || 'http://localhost:9000',
        changeOrigin: true,
      },
      '/static': {
        target: process.env.PROXY || 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-element': ['element-plus'],
          'vendor-query': ['@tanstack/vue-query'],
          'vendor-d3': ['d3-array', 'd3-hierarchy', 'd3-scale', 'd3-selection', 'd3-shape', 'd3-zoom'],
          'vendor-utils': ['lodash-es', 'date-fns', 'highlight.js'],
        },
      },
    },
  },
})
