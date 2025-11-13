import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import CreateProject from '@/views/projects/CreateProject.vue'
import { createProject, searchProjects } from '@/libs/commons/api/projects'

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

  it('应该验证项目名称', async () => {
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

    const form = wrapper.vm.form
    form.name = ''

    // 触发验证
    const validateName = wrapper.vm.validateName
    await new Promise<void>((resolve, reject) => {
      validateName({}, '', (error?: Error) => {
        if (error) {
          expect(error.message).toContain('项目名称')
          resolve()
        } else {
          reject(new Error('应该返回错误'))
        }
      })
    })
  })

  it('应该验证项目 Key 格式', async () => {
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

    vi.mocked(searchProjects).mockResolvedValue({
      components: [],
    } as any)

    const form = wrapper.vm.form
    form.key = 'invalid key with spaces'

    const validateKey = wrapper.vm.validateKey
    await new Promise<void>((resolve, reject) => {
      validateKey({}, form.key, (error?: Error) => {
        if (error) {
          expect(error.message).toContain('Key')
          resolve()
        } else {
          reject(new Error('应该返回错误'))
        }
      })
    })
  })

  it('应该自动生成项目 Key', () => {
    const wrapper = mount(CreateProject, {
      global: {
        stubs: {
          'el-container': true,
          'el-main': true,
          'el-card': true,
        },
      },
    })

    wrapper.vm.form.name = 'My Test Project'
    wrapper.vm.autoGenerateKey = true
    wrapper.vm.generateKey()

    expect(wrapper.vm.form.key).toBe('my-test-project')
  })

  it('应该在创建成功后跳转', async () => {
    vi.mocked(createProject).mockResolvedValue({
      key: 'test-project',
    } as any)

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

    wrapper.vm.form.name = 'Test Project'
    wrapper.vm.form.key = 'test-project'
    wrapper.vm.form.visibility = 'private'

    // Mock form validation
    wrapper.vm.formRef = {
      validate: vi.fn((callback: Function) => callback(true)),
    }

    await wrapper.vm.handleSubmit()

    expect(createProject).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith('/project/test-project')
  })
})
