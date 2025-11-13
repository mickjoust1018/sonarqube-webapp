import { getJSON } from '@/libs/shared/utils/request'

export interface Measure {
  metric: string
  value: string
}

export interface ComponentMeasures {
  component: {
    key: string
    name: string
    qualifier: string
    measures?: Measure[]
  }
}

export function getComponentMeasures(params: {
  component: string
  metricKeys: string
  branch?: string
  pullRequest?: string
}): Promise<ComponentMeasures> {
  return getJSON<ComponentMeasures>('/api/measures/component', params)
}

export function getComponentMeasuresTree(params: {
  component: string
  metricKeys: string
  baseComponentKey?: string
  branch?: string
  pullRequest?: string
  qualifiers?: string
  s?: string
  strategy?: string
}): Promise<any> {
  return getJSON('/api/measures/component_tree', params)
}
