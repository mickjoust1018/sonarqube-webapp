import { getJSON, postJSON, del } from '@/libs/shared/utils/request'

export interface QualityGate {
  id: string
  name: string
  isDefault?: boolean
  conditions?: Array<{
    metric: string
    op: string
    error?: string
    warning?: string
  }>
}

export interface QualityGateStatus {
  status: 'OK' | 'ERROR' | 'WARN'
  name: string
  conditions: Array<{
    metric: string
    status: 'OK' | 'ERROR' | 'WARN'
    actualValue: string
    errorThreshold?: string
    warningThreshold?: string
  }>
}

export function listQualityGates(): Promise<{ qualitygates: QualityGate[] }> {
  return getJSON<{ qualitygates: QualityGate[] }>('/api/qualitygates/list')
}

export function getQualityGateStatus(params: {
  projectKey: string
  branch?: string
  pullRequest?: string
}): Promise<QualityGateStatus> {
  return getJSON<QualityGateStatus>('/api/qualitygates/project_status', params)
}

export function createQualityGate(data: { name: string }): Promise<QualityGate> {
  return postJSON<QualityGate>('/api/qualitygates/create', data)
}

export function deleteQualityGate(id: string): Promise<void> {
  return del(`/api/qualitygates/destroy?id=${id}`)
}

export function updateQualityGate(data: {
  id: string
  name?: string
  conditions?: any[]
}): Promise<void> {
  return postJSON<void>('/api/qualitygates/update', data)
}
