import { provide, inject, ref, type Ref } from 'vue'

export interface Metric {
  key: string
  name: string
  type: string
  domain?: string
  description?: string
}

export interface MetricsContextShape {
  metrics: Ref<Metric[]>
  getMetric: (key: string) => Metric | undefined
}

const MetricsContextKey = Symbol('MetricsContext')

export function provideMetricsContext(context: MetricsContextShape) {
  provide(MetricsContextKey, context)
}

export function useMetricsContext(): MetricsContextShape {
  const context = inject<MetricsContextShape>(MetricsContextKey)
  if (!context) {
    // 返回默认值
    return {
      metrics: ref([]),
      getMetric: () => undefined,
    }
  }
  return context
}
