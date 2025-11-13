import { getJSON } from '@/libs/shared/utils/request'

export interface ComponentMeasure {
  key: string
  name: string
  qualifier: string
  path?: string
  measures?: Array<{ metric: string; value: string }>
}

export interface ComponentTreeResponse {
  baseComponent: ComponentMeasure
  components: ComponentMeasure[]
  metrics?: any[]
  paging?: {
    pageIndex: number
    pageSize: number
    total: number
  }
}

export interface SourceLine {
  line: number
  code: string
  coverageStatus?: string
  duplicated?: boolean
  scmRevision?: string
  scmAuthor?: string
  scmDate?: string
}

export interface SourceViewerFile {
  key: string
  name: string
  path: string
  qualifier: string
  q: string
  measures?: Array<{ metric: string; value: string }>
}

export function getComponentTree(
  component: string,
  strategy: string = 'children',
  metrics: string[] = [],
  additional: Record<string, any> = {}
): Promise<ComponentTreeResponse> {
  return getJSON<ComponentTreeResponse>('/api/measures/component_tree', {
    component,
    strategy,
    metricKeys: metrics.join(','),
    ...additional,
  })
}

export function getComponent(
  component: string,
  metricKeys: string = '',
  branch?: string,
  pullRequest?: string
): Promise<{ component: ComponentMeasure }> {
  return getJSON<{ component: ComponentMeasure }>('/api/measures/component', {
    component,
    metricKeys,
    branch,
    pullRequest,
  })
}

export function getComponentData(
  component: string,
  branch?: string,
  pullRequest?: string
): Promise<{
  ancestors: ComponentMeasure[]
  component: ComponentMeasure
}> {
  return getJSON('/api/components/show', {
    component,
    branch,
    pullRequest,
  })
}

export function getSources(
  key: string,
  from?: number,
  to?: number,
  branch?: string,
  pullRequest?: string
): Promise<SourceLine[]> {
  return getJSON<{ sources: SourceLine[] }>('/api/sources/lines', {
    key,
    from,
    to,
    branch,
    pullRequest,
  }).then((r) => r.sources)
}

export function getComponentForSourceViewer(
  component: string,
  branch?: string,
  pullRequest?: string
): Promise<SourceViewerFile> {
  return getJSON<SourceViewerFile>('/api/components/app', {
    component,
    branch,
    pullRequest,
  })
}

export function getBreadcrumbs(
  component: string,
  branch?: string,
  pullRequest?: string
): Promise<ComponentMeasure[]> {
  return getComponentData(component, branch, pullRequest).then((r) => {
    const reversedAncestors = [...r.ancestors].reverse()
    return [...reversedAncestors, r.component]
  })
}
