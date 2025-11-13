import { describe, it, expect } from 'vitest'
import { serializeQuery, parseQuery } from '@/libs/shared/utils/issues-utils'
import type { IssuesQuery } from '@/libs/commons/types/issues'

describe('issues-utils', () => {
  describe('serializeQuery', () => {
    it('should serialize query object to params', () => {
      const query: IssuesQuery = {
        severities: ['BLOCKER', 'CRITICAL'],
        statuses: ['OPEN'],
        types: ['BUG'],
        assignees: ['user1', 'user2'],
      }

      const result = serializeQuery(query)

      expect(result.severities).toBe('BLOCKER,CRITICAL')
      expect(result.statuses).toBe('OPEN')
      expect(result.types).toBe('BUG')
      expect(result.assignees).toBe('user1,user2')
    })

    it('should handle empty arrays', () => {
      const query: IssuesQuery = {
        severities: [],
      }

      const result = serializeQuery(query)
      expect(result.severities).toBeUndefined()
    })
  })

  describe('parseQuery', () => {
    it('should parse params to query object', () => {
      const params = {
        severities: 'BLOCKER,CRITICAL',
        statuses: 'OPEN',
        types: 'BUG',
      }

      const result = parseQuery(params)

      expect(result.severities).toEqual(['BLOCKER', 'CRITICAL'])
      expect(result.statuses).toEqual(['OPEN'])
      expect(result.types).toEqual(['BUG'])
    })

    it('should handle array params', () => {
      const params = {
        severities: ['BLOCKER', 'CRITICAL'],
      }

      const result = parseQuery(params)
      expect(result.severities).toEqual(['BLOCKER', 'CRITICAL'])
    })
  })
})
