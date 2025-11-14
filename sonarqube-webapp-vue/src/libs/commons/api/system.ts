import { getJSON } from '@/libs/shared/utils/request'

export interface SystemStatusResponse {
  status: 'UP' | 'DOWN' | 'RESTARTING' | 'DB_MIGRATION_NEEDED' | 'DB_MIGRATION_RUNNING'
}

export function getSystemStatus(): Promise<SystemStatusResponse> {
  return getJSON<SystemStatusResponse>('/api/system/status')
}

export function waitSystemUPStatus(): Promise<SystemStatusResponse> {
  return getJSON<SystemStatusResponse>('/api/system/status')
}
