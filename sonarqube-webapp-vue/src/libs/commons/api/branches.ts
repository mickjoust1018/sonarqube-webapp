import { getJSON, postJSON } from '@/libs/shared/utils/request'

export interface Branch {
  name: string
  isMain: boolean
  type: 'BRANCH' | 'PULL_REQUEST'
  status?: {
    qualityGateStatus: 'OK' | 'ERROR' | 'WARN' | 'NONE'
  }
  analysisDate?: string
  excludedFromPurge: boolean
}

export interface PullRequest extends Branch {
  key: string
  title?: string
  base?: string
  branch?: string
}

export function getBranches(project: string): Promise<Branch[]> {
  return getJSON<{ branches: Branch[] }>('/api/project_branches/list', { project }).then(
    (r) => r.branches
  )
}

export function getPullRequests(project: string): Promise<PullRequest[]> {
  return getJSON<{ pullRequests: PullRequest[] }>('/api/project_pull_requests/list', { project }).then(
    (r) => r.pullRequests
  )
}

export function deleteBranch(data: { branch: string; project: string }): Promise<void> {
  return postJSON<void>('/api/project_branches/delete', data)
}

export function deletePullRequest(data: { project: string; pullRequest: string }): Promise<void> {
  return postJSON<void>('/api/project_pull_requests/delete', data)
}

export function renameBranch(project: string, name: string): Promise<void> {
  return postJSON<void>('/api/project_branches/rename', { project, name })
}

export function excludeBranchFromPurge(
  projectKey: string,
  branchName: string,
  excluded: boolean
): Promise<void> {
  return postJSON<void>('/api/project_branches/set_automatic_deletion_protection', {
    project: projectKey,
    branch: branchName,
    value: excluded,
  })
}

export function setMainBranch(project: string, branch: string): Promise<void> {
  return postJSON<void>('/api/project_branches/set_main', { project, branch })
}
