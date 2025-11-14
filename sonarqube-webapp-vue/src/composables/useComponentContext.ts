import { provide, inject } from 'vue'
import type { ComponentContextShape } from '@/libs/commons/types/components'

const ComponentContextKey = Symbol('ComponentContext')

export function provideComponentContext(context: ComponentContextShape) {
  provide(ComponentContextKey, context)
}

export function useComponentContext(): ComponentContextShape {
  const context = inject<ComponentContextShape>(ComponentContextKey)
  if (!context) {
    throw new Error('useComponentContext must be used within ComponentContainer')
  }
  return context
}
