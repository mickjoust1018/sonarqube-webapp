import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import type { Plugin } from 'vite'
import { readFileSync, existsSync } from 'fs'

// Plugin to handle .well-known paths locally to avoid CSP violations
const handleWellKnownPlugin = (): Plugin => {
  return {
    name: 'handle-well-known',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle .well-known paths locally to prevent CSP violations
        // Chrome DevTools tries to connect to .well-known/appspecific/com.chrome.devtools.json
        if (req.url?.startsWith('/.well-known/')) {
          res.statusCode = 404
          res.end()
          return
        }
        next()
      })
    },
  }
}

// Plugin to read local files for source code viewer
const localFileReaderPlugin = (): Plugin => {
  return {
    name: 'local-file-reader',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle /api/files/* requests to read local files
        if (req.url?.startsWith('/api/files/')) {
          const filePath = decodeURIComponent(req.url.replace('/api/files/', ''))
          // 从项目根目录读取文件
          const fullPath = resolve(process.cwd(), filePath)

          // 安全检查：确保文件在项目目录内
          const projectRoot = resolve(process.cwd())
          if (!fullPath.startsWith(projectRoot)) {
            res.statusCode = 403
            res.end('Access denied')
            return
          }

          try {
            if (existsSync(fullPath)) {
              const content = readFileSync(fullPath, 'utf-8')
              res.setHeader('Content-Type', 'text/plain; charset=utf-8')
              res.end(content)
            } else {
              res.statusCode = 404
              res.end('File not found')
            }
          } catch (error) {
            res.statusCode = 500
            res.end('Error reading file')
          }
          return
        }
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), handleWellKnownPlugin(), localFileReaderPlugin()],
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
          'vendor-d3': [
            'd3-array',
            'd3-hierarchy',
            'd3-scale',
            'd3-selection',
            'd3-shape',
            'd3-zoom',
          ],
          'vendor-utils': ['lodash-es', 'date-fns', 'highlight.js'],
        },
      },
    },
  },
})
