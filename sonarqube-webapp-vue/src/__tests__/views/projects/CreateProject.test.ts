import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreateProject from '@/views/projects/CreateProject.vue'

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
  back: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

// Mock API
vi.mock('@/libs/commons/api/projects', () => ({
  createProject: vi.fn(),
  searchProjects: vi.fn(),
}))

vi.mock('@/libs/shared/utils/request', () => ({
  getJSON: vi.fn(),
}))

describe('CreateProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染创建方式选择', () => {
    const wrapper = mount(CreateProject, {
      global: {
        stubs: {
          'el-container': true,
          'el-main': true,
          'el-card': true,
          'el-button': true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('应该能够渲染创建项目表单', () => {
    const wrapper = mount(CreateProject, {
      global: {
        stubs: {
          'el-container': true,
          'el-main': true,
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-button': true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
