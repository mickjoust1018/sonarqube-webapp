import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectOverview from '@/views/overview/ProjectOverview.vue'

// Mock i18n
vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'zh' },
  }),
}))

// Mock router
const mockRouter = {
  push: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      projectKey: 'test-project',
    },
  }),
  useRouter: () => mockRouter,
}))

// Mock API
vi.mock('@/libs/commons/api/measures', () => ({
  getComponentMeasures: vi.fn(),
}))

vi.mock('@/libs/commons/api/quality-gates', () => ({
  getQualityGateStatus: vi.fn(),
}))

vi.mock('@/libs/commons/api/project-activity', () => ({
  searchProjectAnalyses: vi.fn(),
}))

vi.mock('@/libs/shared/utils/request', () => ({
  getJSON: vi.fn(),
}))

describe('ProjectOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染项目概览', () => {
    const wrapper = mount(ProjectOverview, {
      global: {
        stubs: {
          'el-container': true,
          'el-header': true,
          'el-main': true,
          'el-row': true,
          'el-col': true,
          'el-card': true,
          'el-statistic': true,
          'el-button': true,
          'el-icon': true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
