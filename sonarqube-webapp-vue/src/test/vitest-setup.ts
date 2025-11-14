import { config } from '@vue/test-utils'

// Mock window properties
Object.defineProperty(window, 'baseUrl', {
  value: '',
  writable: true,
})

Object.defineProperty(window, 'serverStatus', {
  value: 'UP',
  writable: true,
})

// Global test utilities
config.global.mocks = {
  $t: (key: string) => key,
}
