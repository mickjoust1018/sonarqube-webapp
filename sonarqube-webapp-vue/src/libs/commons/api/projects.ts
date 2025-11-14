import { getJSON, postJSON, del } from '@/libs/shared/utils/request'
import type { ProjectsResponse, ProjectsQuery, Project } from '../types/projects'

export function searchProjects(
  query: ProjectsQuery & { p?: number; ps?: number }
): Promise<ProjectsResponse> {
  return getJSON<ProjectsResponse>('/api/projects/search', query)
}

export function createProject(data: {
  name: string
  project: string
  visibility?: string
  branch?: string
  mainBranch?: string
}): Promise<Project> {
  return postJSON<Project>('/api/projects/create', data)
}

export function deleteProject(project: string): Promise<void> {
  return del(`/api/projects/delete?project=${project}`)
}

export function updateProjectVisibility(data: {
  project: string
  visibility: string
}): Promise<void> {
  return postJSON<void>('/api/projects/update_visibility', data)
}

export function updateProjectKey(data: { from: string; to: string }): Promise<void> {
  return postJSON<void>('/api/projects/update_key', data)
}

export function getProjectTags(data: { ps?: number; q?: string }): Promise<string[]> {
  return getJSON<{ tags: string[] }>('/api/project_tags/search', data).then(r => r.tags)
}

export function addProjectTag(data: { project: string; tag: string }): Promise<void> {
  return postJSON<void>('/api/project_tags/set', data)
}

export function removeProjectTag(data: { project: string; tag: string }): Promise<void> {
  return postJSON<void>('/api/project_tags/remove', data)
}

// 根据gitUrl和appCode查找项目
export function findProjectByGitInfo(params: {
  gitUrl: string
  appCode: string
}): Promise<Project | null> {
  return getJSON<Project | null>('/api/projects/find_by_git', params)
}

// 根据gitUrl和appCode创建或获取项目
export function createOrGetProject(data: {
  gitUrl: string
  appCode: string
  name?: string
}): Promise<Project> {
  return postJSON<Project>('/api/projects/create_or_get', data)
}
