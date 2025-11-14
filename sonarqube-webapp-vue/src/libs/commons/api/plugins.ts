import { getJSON } from '@/libs/shared/utils/request'

export interface PendingPluginsResponse {
  installing: number
  removing: number
  updating: number
}

export function getPendingPlugins(): Promise<PendingPluginsResponse> {
  return getJSON<PendingPluginsResponse>('/api/plugins/pending')
}
