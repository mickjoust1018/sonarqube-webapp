import { getJSON, postJSON } from '@/libs/shared/utils/request'
import type { RawIssuesResponse, Issue } from '../types/issues'

export function searchIssues(query: Record<string, any>): Promise<RawIssuesResponse> {
  return getJSON<RawIssuesResponse>('/api/issues/search', query)
}

export function listIssues(query: Record<string, any>): Promise<{ issues: Issue[] }> {
  return getJSON<{ issues: Issue[] }>('/api/issues/list', query)
}

export function getIssueChangelog(issue: string): Promise<{ changelog: any[] }> {
  return getJSON<{ changelog: any[] }>('/api/issues/changelog', { issue })
}

export function addIssueComment(data: { issue: string; text: string }): Promise<Issue> {
  return postJSON<Issue>('/api/issues/add_comment', data)
}

export function deleteIssueComment(data: { comment: string }): Promise<Issue> {
  return postJSON<Issue>('/api/issues/delete_comment', data)
}

export function editIssueComment(data: { comment: string; text: string }): Promise<Issue> {
  return postJSON<Issue>('/api/issues/edit_comment', data)
}

export function assignIssue(data: { issue: string; assignee?: string }): Promise<Issue> {
  return postJSON<Issue>('/api/issues/assign', data)
}

export function doTransition(data: { issue: string; transition: string }): Promise<Issue> {
  return postJSON<Issue>('/api/issues/do_transition', data)
}

export function setSeverity(data: { issue: string; severity: string }): Promise<Issue> {
  return postJSON<Issue>('/api/issues/set_severity', data)
}

export function setType(data: { issue: string; type: string }): Promise<Issue> {
  return postJSON<Issue>('/api/issues/set_type', data)
}

export function setTags(data: { issue: string; tags: string }): Promise<Issue> {
  return postJSON<Issue>('/api/issues/set_tags', data)
}

export function bulkChange(data: {
  issues: string
  actions?: string
  add_tags?: string
  assign?: string
  comment?: string
  do_transition?: string
  remove_tags?: string
  sendNotifications?: boolean
  set_severity?: string
  set_type?: string
}): Promise<void> {
  return postJSON<void>('/api/issues/bulk_change', data)
}

export function getIssueFilters() {
  return getJSON('/api/issue_filters/search').then((r: any) => r.issueFilters)
}

export function searchIssueTags(data: {
  all?: boolean
  branch?: string
  project?: string
  ps?: number
  q?: string
}): Promise<string[]> {
  return getJSON<{ tags: string[] }>('/api/issues/tags', data).then(r => r.tags)
}

export function getIssueFlow(issue: string): Promise<{
  flows: Array<{
    locations?: Array<{ component: string; textRange: { startLine: number; endLine: number } }>
  }>
}> {
  return getJSON<{
    flows: Array<{
      locations?: Array<{ component: string; textRange: { startLine: number; endLine: number } }>
    }>
  }>('/api/issues/flow', { issue })
}
