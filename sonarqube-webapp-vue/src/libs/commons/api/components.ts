import { getJSON } from '@/libs/shared/utils/request'
import type { Component } from '../types/components'

export interface ComponentDataResponse {
  ancestors: Array<Omit<Component, 'tags'>>
  component: Omit<Component, 'tags'>
}

export interface SuggestionsResponse {
  results: Array<{
    q: string
    items: Array<{
      key: string
      name: string
    }>
    more?: number
  }>
}

export interface ComponentMeasure extends Component {
  measures?: Array<{
    metric: string
    value: string
  }>
}

export interface SourceLine {
  line: number
  code: string
  coverageStatus?: string
  coverageHits?: number
  scmRevision?: string
  scmAuthor?: string
  scmDate?: string
  duplicated?: boolean
  isNew?: boolean
}

export interface ComponentTreeResponse {
  baseComponent: ComponentMeasure
  components: ComponentMeasure[]
}

export function getComponentData(params: {
  component: string
  branch?: string
  pullRequest?: string
}): Promise<ComponentDataResponse> {
  return getJSON<ComponentDataResponse>('/api/components/show', params)
}

export function getSuggestions(
  query: string,
  recentlyBrowsed: string[] = []
): Promise<SuggestionsResponse> {
  return getJSON<SuggestionsResponse>('/api/components/suggestions', {
    s: query,
    recentlyBrowsed: recentlyBrowsed.join(','),
  })
}

export function getComponentTree(
  component: string,
  strategy: string = 'children',
  metricKeys: string[] = []
): Promise<ComponentTreeResponse> {
  return getJSON<ComponentTreeResponse>('/api/components/tree', {
    component,
    strategy,
    metricKeys: metricKeys.join(','),
  })
}

export function getBreadcrumbs(component: string, branch?: string): Promise<ComponentMeasure[]> {
  return getJSON<ComponentMeasure[]>('/api/components/breadcrumbs', {
    component,
    branch,
  })
}

export function getSources(
  component: string,
  from?: number,
  to?: number,
  branch?: string,
  pullRequest?: string
): Promise<SourceLine[]> {
  return getJSON<SourceLine[]>('/api/sources/lines', {
    component,
    from,
    to,
    branch,
    pullRequest,
  })
}
