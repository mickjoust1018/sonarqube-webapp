import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IssueDetailsSidebar from '@/components/issues/IssueDetailsSidebar.vue'
import type { Issue } from '@/libs/commons/types/issues'

// Mock i18n
vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'zh' },
  }),
}))

// Mock API
vi.mock('@/libs/commons/api/issues', () => ({
  assignIssue: vi.fn(),
  setSeverity: vi.fn(),
  setType: vi.fn(),
  doTransition: vi.fn(),
  addIssueComment: vi.fn(),
  deleteIssueComment: vi.fn(),
  editIssueComment: vi.fn(),
  getIssueChangelog: vi.fn(),
}))

// Mock request
vi.mock('@/libs/shared/utils/request', () => ({
  getJSON: vi.fn(),
}))

describe('IssueDetailsSidebar', () => {
  const mockIssue: Issue = {
    key: 'TEST-123',
    message: 'Test issue',
    severity: 'MAJOR',
    status: 'OPEN',
    type: 'BUG',
    component: 'test-component',
    line: 10,
    creationDate: '2024-01-01T00:00:00Z',
    actions: ['assign', 'comment', 'set_severity'],
  } as Issue

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染问题详情', () => {
    const wrapper = mount(IssueDetailsSidebar, {
      props: {
        modelValue: true,
        issue: mockIssue,
      },
      global: {
        stubs: {
          'el-drawer': true,
          'el-card': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-tag': true,
          'el-button': true,
          'el-tabs': true,
          'el-tab-pane': true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('应该在问题变化时加载评论和历史记录', async () => {
    const { getIssueChangelog } = await import('@/libs/commons/api/issues')

    vi.mocked(getIssueChangelog).mockResolvedValue({
      changelog: [
        {
          creationDate: '2024-01-01T00:00:00Z',
          user: 'test-user',
          diffs: [{ field: 'status', oldValue: 'OPEN', newValue: 'CONFIRMED' }],
        },
      ],
    })

    const wrapper = mount(IssueDetailsSidebar, {
      props: {
        modelValue: true,
        issue: mockIssue,
      },
      global: {
        stubs: {
          'el-drawer': true,
          'el-card': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-tag': true,
          'el-button': true,
          'el-tabs': true,
          'el-tab-pane': true,
        },
      },
    })

    await wrapper.vm.$nextTick()
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(getIssueChangelog).toHaveBeenCalledWith(mockIssue.key)
  })
})
