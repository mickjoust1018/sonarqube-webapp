import { getJSON } from '@/libs/shared/utils/request'

export interface ProjectAnalysis {
  key: string
  date: string
  projectVersion?: string
  buildString?: string
  events?: Array<{
    key: string
    category: string
    name: string
    description?: string
  }>
}

export interface ProjectAnalysesResponse {
  analyses: ProjectAnalysis[]
  paging: {
    pageIndex: number
    pageSize: number
    total: number
  }
}

export function searchProjectAnalyses(params: {
  project: string
  branch?: string
  category?: string
  p?: number
  ps?: number
}): Promise<ProjectAnalysesResponse> {
  return getJSON<ProjectAnalysesResponse>('/api/project_analyses/search', params)
}
