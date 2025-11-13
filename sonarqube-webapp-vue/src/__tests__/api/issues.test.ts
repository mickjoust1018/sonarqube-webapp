import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchIssues, assignIssue, addIssueComment } from '@/libs/commons/api/issues'
import { getJSON, postJSON } from '@/libs/shared/utils/request'

vi.mock('@/libs/shared/utils/request', () => ({
  getJSON: vi.fn(),
  postJSON: vi.fn(),
}))

describe('Issues API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchIssues', () => {
    it('should call getJSON with correct params', async () => {
      const mockResponse = {
        issues: [],
        total: 0,
        p: 1,
        ps: 20,
      }

      vi.mocked(getJSON).mockResolvedValue(mockResponse)

      const result = await searchIssues({ p: 1, ps: 20 })

      expect(getJSON).toHaveBeenCalledWith('/api/issues/search', { p: 1, ps: 20 })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('assignIssue', () => {
    it('should call postJSON with correct params', async () => {
      const mockResponse = {
        key: 'issue-1',
        status: 'OPEN',
      }

      vi.mocked(postJSON).mockResolvedValue(mockResponse)

      const result = await assignIssue({ issue: 'issue-1', assignee: 'user1' })

      expect(postJSON).toHaveBeenCalledWith('/api/issues/assign', {
        issue: 'issue-1',
        assignee: 'user1',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('addIssueComment', () => {
    it('should call postJSON with correct params', async () => {
      const mockResponse = {
        key: 'issue-1',
        comments: [{ key: 'comment-1', text: 'Test comment' }],
      }

      vi.mocked(postJSON).mockResolvedValue(mockResponse)

      const result = await addIssueComment({
        issue: 'issue-1',
        text: 'Test comment',
      })

      expect(postJSON).toHaveBeenCalledWith('/api/issues/add_comment', {
        issue: 'issue-1',
        text: 'Test comment',
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
