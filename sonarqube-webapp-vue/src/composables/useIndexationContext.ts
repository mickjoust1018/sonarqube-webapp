import { provide, inject, ref, type Ref } from 'vue'

export interface IndexationContextShape {
  status: Ref<'completed' | 'in_progress' | 'none'>
  completedCount: Ref<number>
  totalCount: Ref<number>
}

const IndexationContextKey = Symbol('IndexationContext')

export function provideIndexationContext(context: IndexationContextShape) {
  provide(IndexationContextKey, context)
}

export function useIndexationContext(): IndexationContextShape {
  const context = inject<IndexationContextShape>(IndexationContextKey)
  if (!context) {
    // 返回默认值，避免错误
    return {
      status: ref('none'),
      completedCount: ref(0),
      totalCount: ref(0),
    }
  }
  return context
}
