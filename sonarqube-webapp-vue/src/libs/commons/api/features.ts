import { getJSON } from '@/libs/shared/utils/request'

export function getAvailableFeatures(): Promise<string[]> {
  return getJSON<string[]>('/api/navigation/features')
}
